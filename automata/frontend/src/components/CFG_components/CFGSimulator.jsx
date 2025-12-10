import React, { useState } from 'react';
import './stylings/CFGSimulator.css';
import { CFGControlPanel } from './CFGControlPanel';
import { CFGTestCases } from './CFGTestCases';
import { useExamples } from './examples';
import { useCFG } from './useCFG';

const CFGSimulator = () => {
    const { examples } = useExamples();
    const [currentExampleName, setCurrentExampleName] = useState('balanced_parentheses');

    const cfg = useCFG({
        variables: examples['balanced_parentheses'].variables,
        terminals: examples['balanced_parentheses'].terminals,
        rules: examples['balanced_parentheses'].rules,
        startVariable: examples['balanced_parentheses'].startVariable,
    });

    const [inputString, setInputString] = useState('');
    const [derivationSteps, setDerivationSteps] = useState([]);
    const [currentStep, setCurrentStep] = useState(-1);
    const [isPlaying, setIsPlaying] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(1000);
    const [isAccepted, setIsAccepted] = useState(null);

    // Helper functions for CNF conversion and CYK parsing
    const toArrayRHS = (rhs) => {
        if (Array.isArray(rhs)) {
            return rhs.filter((sym) => typeof sym === 'string' && sym.length > 0);
        }
        if (typeof rhs !== 'string') return [];
        const trimmed = rhs.trim();
        if (!trimmed || trimmed === 'ε' || trimmed === 'epsilon') return [];
        return trimmed.split('');
    };

    const cloneCFG = (cfg) => ({
        variables: [...cfg.variables],
        terminals: [...cfg.terminals],
        rules: cfg.rules.map((r) => ({ left: r.left, right: [...r.right] })),
        startVariable: cfg.startVariable,
    });

    const normalizeCFG = (cfg) => {
        const variables = Array.isArray(cfg.variables) ? [...new Set(cfg.variables)] : [];
        const terminals = Array.isArray(cfg.terminals) ? [...new Set(cfg.terminals)] : [];
        const rules = Array.isArray(cfg.rules)
            ? cfg.rules.map((rule) => ({ left: rule.left, right: toArrayRHS(rule.right) }))
            : [];
        const startVariable = typeof cfg.startVariable === 'string' ? cfg.startVariable : '';
        if (startVariable && !variables.includes(startVariable)) {
            variables.push(startVariable);
        }
        return {
            variables,
            terminals,
            rules,
            startVariable,
        };
    };

    const ensureUniqueVariableName = (base, usedVariables) => {
        let counter = 0;
        let candidate = base;
        while (usedVariables.has(candidate)) {
            counter += 1;
            candidate = `${base}_${counter}`;
        }
        usedVariables.add(candidate);
        return candidate;
    };

    const computeNullableSet = (cfg) => {
        const nullable = new Set();
        cfg.rules.forEach((rule) => {
            if (rule.right.length === 0) {
                nullable.add(rule.left);
            }
        });

        let changed = true;
        while (changed) {
            changed = false;
            cfg.rules.forEach((rule) => {
                if (!nullable.has(rule.left) && rule.right.every((sym) => nullable.has(sym))) {
                    nullable.add(rule.left);
                    changed = true;
                }
            });
        }
        return nullable;
    };

    const eliminateStart = (cfg) => {
        const newCfg = cloneCFG(cfg);
        const usedVariables = new Set(newCfg.variables);
        const startOnRight = newCfg.rules.some((rule) => rule.right.includes(newCfg.startVariable));
        if (startOnRight) {
            const newStart = ensureUniqueVariableName(`${newCfg.startVariable}_S0`, usedVariables);
            newCfg.variables = Array.from(usedVariables);
            newCfg.rules.push({ left: newStart, right: [newCfg.startVariable] });
            newCfg.startVariable = newStart;
        }
        return newCfg;
    };

    const eliminateNull = (cfg) => {
        const newCfg = cloneCFG(cfg);
        const nullable = computeNullableSet(newCfg);
        const updatedRules = [];

        newCfg.rules.forEach((rule) => {
            if (rule.right.length === 0) {
                return; // Skip ε-productions; combinations cover them
            }
            const nullableIndices = rule.right
                .map((sym, index) => (nullable.has(sym) ? index : -1))
                .filter((index) => index !== -1);
            const nullableIndexMap = new Map();
            nullableIndices.forEach((index, position) => {
                nullableIndexMap.set(index, position);
            });

            const totalCombinations = 1 << nullableIndices.length;
            for (let mask = 0; mask < totalCombinations; mask++) {
                const nextRhs = rule.right.filter((_, idx) => {
                    const position = nullableIndexMap.get(idx);
                    if (position === undefined) return true;
                    return ((mask >> position) & 1) === 0;
                });
                if (nextRhs.length > 0) {
                    updatedRules.push({ left: rule.left, right: nextRhs });
                }
            }
        });

        newCfg.rules = updatedRules;
        return newCfg;
    };

    const eliminateUnit = (cfg) => {
        const newCfg = cloneCFG(cfg);
        const variablesSet = new Set(newCfg.variables);
        const unitPairs = [];

        newCfg.rules.forEach((rule) => {
            if (rule.right.length === 1 && variablesSet.has(rule.right[0])) {
                unitPairs.push([rule.left, rule.right[0]]);
            }
        });

        const closures = {};
        newCfg.variables.forEach((variable) => {
            closures[variable] = new Set([variable]);
        });

        let changed = true;
        while (changed) {
            changed = false;
            unitPairs.forEach(([from, to]) => {
                if (!closures[from].has(to)) {
                    closures[from].add(to);
                    changed = true;
                }
                closures[to]?.forEach((sym) => {
                    if (!closures[from].has(sym)) {
                        closures[from].add(sym);
                        changed = true;
                    }
                });
            });
        }

        const filteredRules = [];
        newCfg.variables.forEach((variable) => {
            const closure = closures[variable] || new Set([variable]);
            newCfg.rules.forEach((rule) => {
                if (closure.has(rule.left) && !(rule.right.length === 1 && variablesSet.has(rule.right[0]))) {
                    filteredRules.push({ left: variable, right: [...rule.right] });
                }
            });
        });

        newCfg.rules = filteredRules;
        return newCfg;
    };

    const separateTerminals = (cfg) => {
        const newCfg = cloneCFG(cfg);
        const terminalSet = new Set(newCfg.terminals);
        const usedVariables = new Set(newCfg.variables);
        const terminalMap = {};
        const newRules = [];

        const sanitizeTerminal = (terminal) => terminal.replace(/[^a-zA-Z0-9]/g, (ch) => `_${ch.charCodeAt(0)}_`);

        const getHelperVariable = (terminal) => {
            if (terminalMap[terminal]) return terminalMap[terminal];
            const base = `T_${sanitizeTerminal(terminal)}`;
            const helper = ensureUniqueVariableName(base, usedVariables);
            terminalMap[terminal] = helper;
            newCfg.variables.push(helper);
            newRules.push({ left: helper, right: [terminal] });
            return helper;
        };

        newCfg.rules.forEach((rule) => {
            if (rule.right.length > 1) {
                const updatedRight = rule.right.map((sym) => (terminalSet.has(sym) ? getHelperVariable(sym) : sym));
                newRules.push({ left: rule.left, right: updatedRight });
            } else {
                newRules.push(rule);
            }
        });

        newCfg.rules = newRules;
        return newCfg;
    };

    const binarize = (cfg) => {
        const newCfg = cloneCFG(cfg);
        const usedVariables = new Set(newCfg.variables);
        const queue = [...newCfg.rules];
        const binarizedRules = [];
        let helperCounter = 1;

        const createHelper = () => {
            const helper = ensureUniqueVariableName(`B${helperCounter}`, usedVariables);
            helperCounter += 1;
            newCfg.variables.push(helper);
            return helper;
        };

        while (queue.length > 0) {
            const rule = queue.shift();
            if (rule.right.length <= 2) {
                binarizedRules.push(rule);
            } else {
                const helper = createHelper();
                binarizedRules.push({ left: rule.left, right: [rule.right[0], helper] });
                queue.unshift({ left: helper, right: rule.right.slice(1) });
            }
        }

        newCfg.rules = binarizedRules;
        return newCfg;
    };

    const removeDuplicates = (cfg) => {
        const newCfg = cloneCFG(cfg);
        const seen = new Set();
        newCfg.rules = newCfg.rules.filter((rule) => {
            const key = `${rule.left}->${rule.right.join(' ')}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
        return newCfg;
    };

    const toCNF = (cfg) => {
        const normalized = normalizeCFG(cfg);
        const nullable = computeNullableSet(normalized);
        const startGeneratesEmpty = nullable.has(normalized.startVariable);

        let cnf = eliminateStart(normalized);
        cnf = eliminateNull(cnf);
        cnf = eliminateUnit(cnf);
        cnf = separateTerminals(cnf);
        cnf = binarize(cnf);
        cnf = removeDuplicates(cnf);

        cnf.rules.sort((a, b) => {
            const leftComparison = a.left.localeCompare(b.left);
            if (leftComparison !== 0) return leftComparison;
            return a.right.join(' ').localeCompare(b.right.join(' '));
        });

        return { cnf, startGeneratesEmpty };
    };

    const cykParse = (cnf, input) => {
        if (!input) return false;
        const symbols = input.split('');
        if (symbols.length === 0) return false;

        const terminalSet = new Set(cnf.terminals);
        if (symbols.some((sym) => !terminalSet.has(sym))) {
            return false;
        }

        const n = symbols.length;
        const table = Array.from({ length: n }, () => Array.from({ length: n }, () => new Set()));

        cnf.rules
            .filter((rule) => rule.right.length === 1 && terminalSet.has(rule.right[0]))
            .forEach((rule) => {
                symbols.forEach((symbol, index) => {
                    if (rule.right[0] === symbol) {
                        table[index][index].add(rule.left);
                    }
                });
            });

        const binaryRules = cnf.rules.filter((rule) => rule.right.length === 2);
        for (let len = 2; len <= n; len += 1) {
            for (let i = 0; i <= n - len; i += 1) {
                const j = i + len - 1;
                for (let k = i; k < j; k += 1) {
                    binaryRules.forEach((rule) => {
                        const [b, c] = rule.right;
                        if (table[i][k].has(b) && table[k + 1][j].has(c)) {
                            table[i][j].add(rule.left);
                        }
                    });
                }
            }
        }

        return table[0][n - 1].has(cnf.startVariable);
    };

    const parseString = () => {
        setDerivationSteps([]);
        setCurrentStep(-1);
        setIsAccepted(null);

        // Convert CFG to CNF
        const { cnf, startGeneratesEmpty } = toCNF(cfg);

        let accepted;
        let description;
        const invalidSymbol = inputString
            .split('')
            .find((symbol) => symbol && !cnf.terminals.includes(symbol));

        if (inputString.length === 0) {
            accepted = startGeneratesEmpty;
            description = `Parsed empty string using CNF grammar. Result: ${accepted ? 'ACCEPTED' : 'REJECTED'}`;
        } else if (invalidSymbol) {
            accepted = false;
            description = `String contains symbol "${invalidSymbol}" not present in the grammar terminals.`;
        } else {
            accepted = cykParse(cnf, inputString);
            description = `Parsed using CNF grammar. Result: ${accepted ? 'ACCEPTED' : 'REJECTED'}`;
        }

        // For now, just set accepted; later add derivation steps from CYK table
        const displayString = inputString.length === 0 ? 'ε' : inputString;
        const steps = [{
            step: 1,
            string: displayString,
            rule: null,
            description
        }];

        setDerivationSteps(steps);
        setIsAccepted(accepted);
        setCurrentStep(0);
    };

    const handleRun = () => {
        if (derivationSteps.length === 0) {
            parseString();
        }
        setIsPlaying(true);
    };

    const handlePause = () => {
        setIsPlaying(false);
    };

    const handleStep = () => {
        if (derivationSteps.length === 0) {
            parseString();
        } else if (currentStep < derivationSteps.length - 1) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handleReset = () => {
        setDerivationSteps([]);
        setCurrentStep(-1);
        setIsPlaying(false);
        setIsAccepted(null);
    };

    const loadExample = (exampleName) => {
        const example = examples[exampleName];
        setCurrentExampleName(exampleName);
        cfg.loadCFG(example);
        setInputString('');
        handleReset();
    };

    const handleLoadTest = (testInput) => {
        setInputString(testInput);
        handleReset();
    };

    return (
        <div className="cfg-simulator-new">
            <div className="cfg-container">
                {/* Header */}
                <div className="cfg-header">
                    <h1 className="cfg-title">CFG Simulator</h1>
                    <p className="cfg-subtitle">
                        Context-Free Grammar - Derivation and parsing visualization
                    </p>
                </div>

                {/* Example Selector */}
                <div className="cfg-example-selector">
                    <label className="cfg-selector-label">Load Example:</label>
                    <div className="cfg-selector-buttons">
                        {Object.entries(examples).map(([key, example]) => (
                            <button
                                key={key}
                                onClick={() => loadExample(key)}
                                className={`cfg-selector-btn ${currentExampleName === key ? 'active' : ''}`}
                            >
                                {example.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Grid */}
                <div className="cfg-grid">
                    {/* Left Column */}
                    <div className="cfg-left-col">
                        {/* Grammar Rules */}
                        <div className="cfg-grammar-card">
                            <h3 className="cfg-card-title">Grammar Rules</h3>
                            <div className="cfg-rules-list">
                                {cfg.rules.map((rule, index) => (
                                    <div key={index} className="cfg-rule">
                                        <span className="cfg-rule-left">{rule.left}</span>
                                        <span className="cfg-rule-arrow">→</span>
                                        <span className="cfg-rule-right">{rule.right}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="cfg-grammar-info">
                                <p><strong>Variables:</strong> {cfg.variables.join(', ')}</p>
                                <p><strong>Terminals:</strong> {cfg.terminals.join(', ')}</p>
                                <p><strong>Start:</strong> {cfg.startVariable}</p>
                            </div>
                        </div>

                        {/* Input String */}
                        <div className="cfg-input-card">
                            <h3 className="cfg-card-title">Test Input String</h3>
                            <div className="cfg-input-group">
                                <input
                                    type="text"
                                    value={inputString}
                                    onChange={(e) => setInputString(e.target.value)}
                                    placeholder="Enter string to parse (e.g., aa)"
                                    className="cfg-input"
                                />
                                <button
                                    onClick={parseString}
                                    className="cfg-btn cfg-btn-primary"
                                >
                                    Parse
                                </button>
                            </div>
                            <p className="cfg-input-help">
                                Terminals: {cfg.terminals.join(', ')}
                            </p>
                            {isAccepted !== null && (
                                <div className={`cfg-result ${isAccepted ? 'accepted' : 'rejected'}`}>
                                    String is {isAccepted ? 'ACCEPTED' : 'REJECTED'}
                                </div>
                            )}
                        </div>

                        {/* Control Panel */}
                        <CFGControlPanel
                            currentStep={currentStep}
                            totalSteps={derivationSteps.length}
                            isPlaying={isPlaying}
                            isComplete={currentStep >= 0 && currentStep === derivationSteps.length - 1}
                            isAccepted={isAccepted}
                            speed={playbackSpeed}
                            onRun={handleRun}
                            onPause={handlePause}
                            onStep={handleStep}
                            onReset={handleReset}
                            onSpeedChange={setPlaybackSpeed}
                        />
                    </div>

                    {/* Right Column */}
                    <div className="cfg-right-col">
                        {/* Test Cases */}
                        <CFGTestCases
                            onLoadTest={handleLoadTest}
                            currentExample={currentExampleName}
                        />

                        {/* Derivation Steps */}
                        {derivationSteps.length > 0 && (
                            <div className="cfg-derivation-card">
                                <h3 className="cfg-card-title">Derivation Steps</h3>
                                <div className="cfg-derivation-steps">
                                    {derivationSteps.map((step, index) => (
                                        <div
                                            key={index}
                                            className={`cfg-derivation-step ${
                                                index === currentStep ? 'current' :
                                                index < currentStep ? 'completed' : 'pending'
                                            }`}
                                        >
                                            <div className="cfg-step-header">
                                                <span className="cfg-step-number">Step {step.step}:</span>
                                                {step.rule && (
                                                    <span className="cfg-step-rule">
                                                        Applied: {step.rule.left} → {step.rule.right}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="cfg-step-string">
                                                {step.string.split('').map((char, charIndex) => (
                                                    <span
                                                        key={charIndex}
                                                        className={`cfg-char ${
                                                            cfg.variables.includes(char) ? 'variable' : 'terminal'
                                                        }`}
                                                    >
                                                        {char}
                                                    </span>
                                                ))}
                                            </div>
                                            <div className="cfg-step-desc">{step.description}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Parse Tree Placeholder */}
                        <div className="cfg-tree-card">
                            <h3 className="cfg-card-title">Parse Tree</h3>
                            <div className="cfg-tree-placeholder">
                                <p>Parse tree visualization would be displayed here.</p>
                                <p>This would show the hierarchical structure of the derivation.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CFGSimulator;