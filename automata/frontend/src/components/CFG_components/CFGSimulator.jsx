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
    const toCNF = (cfg) => {
        let cnf = JSON.parse(JSON.stringify(cfg)); // Deep copy

        // Eliminate start symbol from RHS
        cnf = eliminateStart(cnf);

        // Eliminate null productions
        cnf = eliminateNull(cnf);

        // Eliminate unit productions
        cnf = eliminateUnit(cnf);

        // Separate terminals
        cnf = separateTerminals(cnf);

        // Binarize
        cnf = binarize(cnf);

        return cnf;
    };

    const eliminateStart = (cfg) => {
        const newCfg = JSON.parse(JSON.stringify(cfg));
        if (newCfg.rules.some(r => r.right.includes(newCfg.startVariable))) {
            const newStart = newCfg.startVariable + '0';
            newCfg.variables.push(newStart);
            newCfg.rules.push({ left: newStart, right: [newCfg.startVariable] });
            newCfg.startVariable = newStart;
        }
        return newCfg;
    };

    const eliminateNull = (cfg) => {
        const newCfg = JSON.parse(JSON.stringify(cfg));
        const nullable = new Set();
        newCfg.rules.forEach(r => {
            if (r.right.length === 0) nullable.add(r.left);
        });
        let changed = true;
        while (changed) {
            changed = false;
            for (let r of newCfg.rules) {
                if (r.right.every(sym => nullable.has(sym))) {
                    if (!nullable.has(r.left)) {
                        nullable.add(r.left);
                        changed = true;
                    }
                }
            }
        }
        const newRules = [];
        newCfg.rules.forEach(r => {
            if (r.right.length === 0) return; // Remove null rules
            const combos = generateCombos(r.right, nullable);
            combos.forEach(combo => {
                newRules.push({ left: r.left, right: combo });
            });
        });
        newCfg.rules = newRules;
        return newCfg;
    };

    const generateCombos = (rhs, nullable) => {
        const combos = [[]];
        rhs.forEach(sym => {
            const newCombos = [];
            combos.forEach(combo => {
                newCombos.push([...combo, sym]);
                if (nullable.has(sym)) {
                    newCombos.push(combo);
                }
            });
            combos.splice(0, combos.length, ...newCombos);
        });
        return combos.filter(c => c.length > 0);
    };

    const eliminateUnit = (cfg) => {
        const newCfg = JSON.parse(JSON.stringify(cfg));
        const unitPairs = new Set();
        newCfg.rules.forEach(r => {
            if (r.right.length === 1 && newCfg.variables.includes(r.right[0])) {
                unitPairs.add(`${r.left}-${r.right[0]}`);
            }
        });
        // Compute transitive closure (simplified)
        const closures = {};
        newCfg.variables.forEach(v => closures[v] = new Set([v]));
        unitPairs.forEach(pair => {
            const [a, b] = pair.split('-');
            closures[a].add(b);
        });
        let changed = true;
        while (changed) {
            changed = false;
            for (let a of newCfg.variables) {
                for (let b of newCfg.variables) {
                    if (closures[a].has(b)) {
                        for (let c of closures[b]) {
                            if (!closures[a].has(c)) {
                                closures[a].add(c);
                                changed = true;
                            }
                        }
                    }
                }
            }
        }
        const newRules = [];
        newCfg.rules.forEach(r => {
            if (r.right.length !== 1 || !newCfg.variables.includes(r.right[0])) {
                closures[r.left].forEach(nt => {
                    newRules.push({ left: nt, right: r.right });
                });
            }
        });
        newCfg.rules = newRules;
        return newCfg;
    };

    const separateTerminals = (cfg) => {
        const newCfg = JSON.parse(JSON.stringify(cfg));
        const terminalMap = {};
        newCfg.terminals.forEach(t => {
            const nt = 'X' + t.toUpperCase();
            newCfg.variables.push(nt);
            terminalMap[t] = nt;
            newCfg.rules.push({ left: nt, right: [t] });
        });
        newCfg.rules = newCfg.rules.map(r => ({
            left: r.left,
            right: r.right.map(sym => terminalMap[sym] || sym)
        }));
        return newCfg;
    };

    const binarize = (cfg) => {
        const newCfg = JSON.parse(JSON.stringify(cfg));
        const newRules = [];
        let varCounter = 0;
        newCfg.rules.forEach(r => {
            if (r.right.length <= 2) {
                newRules.push(r);
            } else {
                let current = r.left;
                for (let i = 0; i < r.right.length - 2; i++) {
                    const newVar = 'BIN' + varCounter++;
                    newCfg.variables.push(newVar);
                    newRules.push({ left: current, right: [r.right[i], newVar] });
                    current = newVar;
                }
                newRules.push({ left: current, right: [r.right[r.right.length - 2], r.right[r.right.length - 1]] });
            }
        });
        newCfg.rules = newRules;
        return newCfg;
    };

    const cykParse = (cnf, input) => {
        const n = input.length;
        const table = Array.from({ length: n }, () => Array.from({ length: n }, () => new Set()));

        // Fill diagonal (length 1)
        for (let i = 0; i < n; i++) {
            cnf.rules.forEach(r => {
                if (r.right.length === 1 && r.right[0] === input[i]) {
                    table[i][i].add(r.left);
                }
            });
        }

        // Fill for lengths 2 to n
        for (let len = 2; len <= n; len++) {
            for (let i = 0; i <= n - len; i++) {
                const j = i + len - 1;
                for (let k = i; k < j; k++) {
                    cnf.rules.forEach(r => {
                        if (r.right.length === 2) {
                            const [b, c] = r.right;
                            if (table[i][k].has(b) && table[k + 1][j].has(c)) {
                                table[i][j].add(r.left);
                            }
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
        const cnfGrammar = toCNF(cfg);

        // Use CYK to parse
        const accepted = cykParse(cnfGrammar, inputString);

        // For now, just set accepted; later add derivation steps from CYK table
        const steps = [{
            step: 1,
            string: inputString,
            rule: null,
            description: `Parsed using CNF grammar. Result: ${accepted ? 'ACCEPTED' : 'REJECTED'}`
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