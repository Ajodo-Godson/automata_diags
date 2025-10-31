import React, { useState, useEffect, useCallback } from 'react';
import './stylings/CFGSimulator.css';
import { CFGControlPanel } from './CFGControlPanel';
import { CFGTestCases } from './CFGTestCases';
import { ParseTree } from './ParseTree';
import { CollapsibleSection } from '../shared/CollapsibleSection';
import { useExamples } from './examples';
import { useCFG } from './useCFG';

const CFGSimulator = () => {
    const { examples } = useExamples();
    const [currentExampleName, setCurrentExampleName] = useState(null);

    // Start with a blank CFG
    const cfg = useCFG({
        variables: ['S'],
        terminals: ['a', 'b'],
        rules: [],
        startVariable: 'S',
    });

    const [inputString, setInputString] = useState('');
    const [derivationSteps, setDerivationSteps] = useState([]);
    const [currentStep, setCurrentStep] = useState(-1);
    const [isPlaying, setIsPlaying] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(1000);
    const [isAccepted, setIsAccepted] = useState(null);

    // Event listeners for toolbox actions
    useEffect(() => {
        const handleExport = () => {
            const cfgDefinition = {
                name: currentExampleName || 'Custom CFG',
                description: 'Exported CFG definition',
                variables: cfg.variables,
                terminals: cfg.terminals,
                rules: cfg.rules,
                startVariable: cfg.startVariable
            };
            
            const dataStr = JSON.stringify(cfgDefinition, null, 2);
            const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
            
            const exportFileDefaultName = 'cfg_definition.json';
            
            const linkElement = document.createElement('a');
            linkElement.setAttribute('href', dataUri);
            linkElement.setAttribute('download', exportFileDefaultName);
            linkElement.click();
        };

        const handleAddProduction = () => {
            const variable = prompt(`Enter variable (left-hand side of production):\nAvailable variables: ${cfg.variables.join(', ')}`);
            if (!variable || !cfg.variables.includes(variable.trim())) {
                if (variable) alert(`Variable "${variable}" does not exist. Add it first using "Add Variable".`);
                return;
            }
            
            const production = prompt(`Enter production (right-hand side):\nUse variables: ${cfg.variables.join(', ')}\nUse terminals: ${cfg.terminals.join(', ')}\nUse ε for epsilon\nExample: aSb or ab or ε`);
            if (!production) return;
            
            cfg.addProduction(variable.trim(), production.trim());
            resetDerivation();
        };

        const handleDeleteProduction = () => {
            if (cfg.rules.length === 0) {
                alert('No production rules to delete');
                return;
            }
            
            const rulesList = cfg.rules.map((r, idx) => `${idx + 1}. ${r.left} → ${r.right}`).join('\n');
            const index = prompt(`Enter rule number to delete:\n${rulesList}`);
            
            if (index && !isNaN(index)) {
                const idx = parseInt(index) - 1;
                if (idx >= 0 && idx < cfg.rules.length) {
                    cfg.deleteProduction(idx);
                    resetDerivation();
                } else {
                    alert('Invalid rule number');
                }
            }
        };

        const handleAddVariable = () => {
            const variable = prompt('Enter new variable (single uppercase letter, e.g., A, B):');
            if (variable && variable.trim()) {
                const v = variable.trim();
                if (v.length === 1 && /[A-Z]/.test(v)) {
                    cfg.addVariable(v);
                    resetDerivation();
                } else {
                    alert('Variable must be a single uppercase letter');
                }
            }
        };

        const handleSetStartSymbol = () => {
            const newStartSymbol = prompt(`Enter the variable to set as start symbol:\nAvailable variables: ${cfg.variables.join(', ')}`);
            if (newStartSymbol && cfg.variables.includes(newStartSymbol.trim())) {
                cfg.setStartVariable(newStartSymbol.trim());
                resetDerivation();
            } else if (newStartSymbol) {
                alert(`Variable "${newStartSymbol}" does not exist`);
            }
        };

        const handleClearAll = () => {
            if (window.confirm('Are you sure you want to clear all and start fresh?')) {
                cfg.loadCFG({
                    variables: ['S'],
                    terminals: ['a', 'b'],
                    rules: [],
                    startVariable: 'S'
                });
                setCurrentExampleName(null);
                resetDerivation();
            }
        };

        const resetDerivation = () => {
            setDerivationSteps([]);
            setCurrentStep(-1);
            setIsPlaying(false);
            setIsAccepted(null);
        };

        window.addEventListener('export', handleExport);
        window.addEventListener('addProduction', handleAddProduction);
        window.addEventListener('deleteProduction', handleDeleteProduction);
        window.addEventListener('addVariable', handleAddVariable);
        window.addEventListener('setStartSymbol', handleSetStartSymbol);
        window.addEventListener('clearAll', handleClearAll);

        return () => {
            window.removeEventListener('export', handleExport);
            window.removeEventListener('addProduction', handleAddProduction);
            window.removeEventListener('deleteProduction', handleDeleteProduction);
            window.removeEventListener('addVariable', handleAddVariable);
            window.removeEventListener('setStartSymbol', handleSetStartSymbol);
            window.removeEventListener('clearAll', handleClearAll);
        };
    }, [cfg, currentExampleName]);

    // Auto-play derivation steps
    useEffect(() => {
        let timer;
        if (isPlaying && currentStep < derivationSteps.length - 1) {
            timer = setTimeout(() => {
                setCurrentStep(currentStep + 1);
            }, playbackSpeed);
        } else if (currentStep >= derivationSteps.length - 1) {
            setIsPlaying(false);
        }
        return () => clearTimeout(timer);
    }, [isPlaying, currentStep, derivationSteps.length, playbackSpeed]);

    // Helper functions for CNF conversion and CYK parsing
    const normalizeCFG = (cfg) => {
        const newCfg = JSON.parse(JSON.stringify(cfg));
        if (!Array.isArray(newCfg.rules)) newCfg.rules = [];
        newCfg.rules = newCfg.rules.map(r => ({
            left: r.left,
            right: r.right === 'ε' ? [] : r.right.split('')
        }));
        return newCfg;
    };

    const toCNF = (cfg) => {
        let cnf = normalizeCFG(cfg); // Normalize first

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

        // Remove duplicates
        cnf = removeDuplicates(cnf);

        //Sort productions
        cnf.rules.sort((a, b) => {
            const leftComparison = a.left.localeCompare(b.left);
            if (leftComparison !== 0) return leftComparison;
            return a.right.join(' ').localeCompare(b.right.join(' '));
        });

        console.log(cnf);

        return cnf;
    };

    const eliminateStart = (cfg) => {
        const newCfg = JSON.parse(JSON.stringify(cfg));
        // Defensive guards for malformed input
        if (!Array.isArray(newCfg.rules)) newCfg.rules = [];
        if (!Array.isArray(newCfg.variables)) newCfg.variables = [];
        // Ensure each rule has a right-hand side array
        newCfg.rules = newCfg.rules.map(r => ({ left: r.left, right: Array.isArray(r.right) ? r.right : (r.right === 'ε' ? [] : (typeof r.right === 'string' ? r.right.split('') : [])) }));

        if (newCfg.rules.some(r => r.right.includes(newCfg.startVariable))) {
            const newStart = newCfg.startVariable + '0';
            if (!newCfg.variables.includes(newStart)) newCfg.variables.push(newStart);
            newCfg.rules.push({ left: newStart, right: [newCfg.startVariable] });
            newCfg.startVariable = newStart;
        }
        return newCfg;
    };

    const eliminateNull = (cfg) => {
        const newCfg = JSON.parse(JSON.stringify(cfg));
        if (!Array.isArray(newCfg.rules)) newCfg.rules = [];
        const nullable = new Set();
        newCfg.rules.forEach(r => {
            const rhs = Array.isArray(r.right) ? r.right : (r.right === 'ε' ? [] : (typeof r.right === 'string' ? r.right.split('') : []));
            if (rhs.length === 0) nullable.add(r.left);
            // normalize rule RHS
            r.right = rhs;
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
            if (r.right.length === 0) return; // Skip null rules
            const nullableIndices = [];
            r.right.forEach((sym, i) => {
                if (nullable.has(sym)) nullableIndices.push(i);
            });
            const numCombos = 1 << nullableIndices.length;
            for (let i = 0; i < numCombos; i++) {
                const newRhs = [...r.right];
                for (let j = 0; j < nullableIndices.length; j++) {
                    if ((i >> j) & 1) {
                        newRhs[nullableIndices[j]] = null;
                    }
                }
                const finalRhs = newRhs.filter(sym => sym !== null);
                if (finalRhs.length > 0) {
                    newRules.push({ left: r.left, right: finalRhs });
                }
            }
        });
        newCfg.rules = newRules;
        return newCfg;
    };

    const eliminateUnit = (cfg) => {
        const newCfg = JSON.parse(JSON.stringify(cfg));
        if (!Array.isArray(newCfg.rules)) newCfg.rules = [];
        if (!Array.isArray(newCfg.variables)) newCfg.variables = [];
        const unitPairs = new Set();
        newCfg.rules.forEach(r => {
            if (!Array.isArray(r.right)) r.right = (r.right === 'ε' ? [] : (typeof r.right === 'string' ? r.right.split('') : []));
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
        for (let A of newCfg.variables) {
            const closureA = closures[A] || new Set([A]);
            for (let B of closureA) {
                newCfg.rules.forEach(p => {
                    if (p.left === B && !(p.right.length === 1 && newCfg.variables.includes(p.right[0]))) {
                        newRules.push({ left: A, right: p.right });
                    }
                });
            }
        }
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
        newCfg.rules = newCfg.rules.map(r => {
            if (r.right.length > 1) {
                return {
                    left: r.left,
                    right: r.right.map(sym => terminalMap[sym] || sym)
                };
            } else {
                return r;
            }
        });
        return newCfg;
    };

    const binarize = (cfg) => {
        const newCfg = JSON.parse(JSON.stringify(cfg));
        const newRules = [];
        const productionsToProcess = [...newCfg.rules];
        const binarizationVars = ['P', 'Q', 'R', 'T'];
        let varCounter = 0;

        while (productionsToProcess.length > 0) {
            const p = productionsToProcess.shift();
            if (p.right.length > 2) {
                let newVar;
                if (varCounter < binarizationVars.length) {
                    newVar = binarizationVars[varCounter];
                    varCounter++;
                } else {
                    newVar = 'BIN_' + varCounter;
                    varCounter++;
                }
                newCfg.variables.push(newVar);
                newRules.push({ left: p.left, right: [p.right[0], newVar] });
                productionsToProcess.push({ left: newVar, right: p.right.slice(1) });
            } else {
                newRules.push(p);
            }
        }

        // Remove duplicates
        const uniqueRules = [];
        const seen = new Set();
        newRules.forEach(r => {
            const key = `${r.left}-${r.right.join(',')}`;
            if (!seen.has(key)) {
                seen.add(key);
                uniqueRules.push(r);
            }
        });

        newCfg.rules = uniqueRules;
        return newCfg;
    };

    const removeDuplicates = (cfg) => {
        const seen = new Set();
        cfg.rules = cfg.rules.filter(r => {
            const key = `${r.left}->${r.right.join(' ')}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
        return cfg;
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

        // Try leftmost derivation
        const steps = generateLeftmostDerivation(cfg, inputString);
        
        if (steps.length > 0) {
            setDerivationSteps(steps);
            setIsAccepted(true);
            setCurrentStep(0);
        } else {
            // If leftmost derivation fails, try CYK parsing
            const cnfGrammar = toCNF(cfg);
            const accepted = cykParse(cnfGrammar, inputString);
            
            const steps = [{
                step: 1,
                string: inputString,
                production: null,
                description: `No derivation found. CYK Result: ${accepted ? 'ACCEPTED' : 'REJECTED'}`
            }];
            
            setDerivationSteps(steps);
            setIsAccepted(accepted);
            setCurrentStep(0);
        }
    };

    // Generate leftmost derivation steps with backtracking
    const generateLeftmostDerivation = (cfg, target) => {
        const maxSteps = 50; // Prevent infinite loops
        const maxLength = target.length * 3; // Prevent strings from growing too long
        
        // Recursive backtracking function
        const derive = (current, steps, depth) => {
            // Base case: reached target
            if (current === target) {
                return steps;
            }
            
            // Prevent excessive depth or length
            if (depth >= maxSteps || current.length > maxLength) {
                return null;
            }
            
            // Find the leftmost variable
            let variableIndex = -1;
            let variable = null;
            for (let i = 0; i < current.length; i++) {
                if (cfg.variables.includes(current[i])) {
                    variableIndex = i;
                    variable = current[i];
                    break;
                }
            }
            
            // No more variables to expand
            if (variable === null) {
                // No variables left but haven't reached target
                return null;
            }
            
            // Find applicable rules for this variable
            const applicableRules = cfg.rules.filter(r => r.left === variable);
            if (applicableRules.length === 0) {
                return null; // No rules for this variable
            }
            
            // Try each applicable rule (backtracking)
            for (const rule of applicableRules) {
                const replacement = rule.right === 'ε' ? '' : rule.right;
                const newString = current.substring(0, variableIndex) + replacement + current.substring(variableIndex + 1);
                
                // Skip if the terminal prefix doesn't match target
                const terminalPrefix = newString.split('').filter((_, idx) => {
                    return idx < variableIndex || !cfg.variables.includes(newString[idx]);
                }).join('').substring(0, variableIndex);
                
                if (terminalPrefix && !target.startsWith(terminalPrefix)) {
                    continue; // Prune this branch
                }
                
                // Create new step
                const newSteps = [...steps, {
                    step: depth,
                    string: newString,
                    production: rule,
                    highlightIndices: Array.from({ length: replacement.length }, (_, i) => variableIndex + i),
                    description: `Apply ${rule.left} → ${rule.right}`
                }];
                
                // Recursively try to derive from this point
                const result = derive(newString, newSteps, depth + 1);
                if (result !== null) {
                    return result;
                }
            }
            
            // No rule worked, backtrack
            return null;
        };
        
        // Start with the start variable
        const initialSteps = [{
            step: 0,
            string: cfg.startVariable,
            production: null,
            description: `Start with ${cfg.startVariable}`
        }];
        
        return derive(cfg.startVariable, initialSteps, 1) || [];
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

    const handleReset = useCallback(() => {
        setDerivationSteps([]);
        setCurrentStep(-1);
        setIsPlaying(false);
        setIsAccepted(null);
    }, []);

    const loadExample = useCallback((exampleName) => {
        const example = examples[exampleName];
        setCurrentExampleName(exampleName);
        cfg.loadCFG(example);
        setInputString('');
        handleReset();
    }, [examples, cfg, setCurrentExampleName, setInputString, handleReset]);

    const handleLoadTest = (testInput) => {
        setInputString(testInput);
        handleReset();
    };

    // Event listeners for toolbox actions
    useEffect(() => {
        const handleAddRule = () => {
            alert('Adding rules is not implemented for CFG. Use Import to load a custom CFG.');
        };

        const handleEditRule = () => {
            alert('Editing rules is not implemented for CFG. Use Import to load a custom CFG.');
        };

        const handleSetStartSymbol = () => {
            alert('Setting start symbol is not implemented for CFG. Use Import to load a custom CFG.');
        };

        const handleConvertCNF = () => {
            alert('Converting to CNF is not implemented in the toolbox. Use the Convert to CNF button in the simulator.');
        };

        const handleClearAll = () => {
            // Reset to first example
            const firstExample = Object.keys(examples)[0];
            loadExample(firstExample);
        };

        window.addEventListener('addRule', handleAddRule);
        window.addEventListener('editRule', handleEditRule);
        window.addEventListener('setStartSymbol', handleSetStartSymbol);
        window.addEventListener('convertCNF', handleConvertCNF);
        window.addEventListener('clearAll', handleClearAll);

        return () => {
            window.removeEventListener('addRule', handleAddRule);
            window.removeEventListener('editRule', handleEditRule);
            window.removeEventListener('setStartSymbol', handleSetStartSymbol);
            window.removeEventListener('convertCNF', handleConvertCNF);
            window.removeEventListener('clearAll', handleClearAll);
        };
    }, [examples, loadExample]);

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
                        <CollapsibleSection title="Example Test Cases" defaultOpen={false}>
                            <CFGTestCases
                                onLoadTest={handleLoadTest}
                                currentExample={currentExampleName}
                            />
                        </CollapsibleSection>

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

                        {/* Parse Tree */}
                        <div className="cfg-tree-card">
                            <h3 className="cfg-card-title">Parse Tree</h3>
                            <ParseTree 
                                derivationSteps={derivationSteps}
                                currentStep={currentStep}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CFGSimulator;