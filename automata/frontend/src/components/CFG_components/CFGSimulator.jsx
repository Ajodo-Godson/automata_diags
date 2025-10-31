import React, { useState, useEffect } from 'react';
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

    // Auto-play derivation
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

    const parseString = () => {
        setDerivationSteps([]);
        setCurrentStep(-1);
        setIsAccepted(null);

        const steps = [];
        let globalPosition = { value: 0 };

    // Failure cache to avoid infinite recursion on left-recursive grammars.
    // Keys are `${nonTerminal}@${position}` for attempts that failed.
    const failureCache = new Set();
    // Tracks nonterminals currently being attempted at a given input position
    // to detect and prevent immediate left-recursive re-entry.
    const inProgress = new Set();

    // Try to parse the string starting from the start variable
    const success = parseNonTerminal(cfg.startVariable, 0, steps, globalPosition);

        // Check if we successfully parsed the entire string
        const accepted = success && globalPosition.value >= inputString.length;

        // Add final status to last step
        if (steps.length > 0) {
            steps[steps.length - 1].description += accepted ? ' → ACCEPTED' : ' → REJECTED';
        }

        setDerivationSteps(steps);
        setIsAccepted(accepted);
        setCurrentStep(0);

        // Recursive function to parse a non-terminal at a specific position
        function parseNonTerminal(nonTerminal, startPos, derivationSteps, position) {
            const keyFor = (nt, pos) => `${nt}@${pos}`;
            const startKey = keyFor(nonTerminal, startPos);

            if (failureCache.has(startKey)) {
                // Previously failed to parse this nonterminal at this position.
                return false;
            }

            if (inProgress.has(startKey)) {
                // Already attempting this nonTerminal at this position -> likely left recursion.
                return false;
            }

            inProgress.add(startKey);

            // Try each production rule for this non-terminal
            for (const rule of cfg.rules) {
                if (rule.left !== nonTerminal) continue;

                const stepNum = derivationSteps.length + 1;
                // Create a snapshot of the current parsing state
                const snapshotPos = position.value;

                // Add derivation step
                derivationSteps.push({
                    step: stepNum,
                    string: inputString.substring(0, snapshotPos) +
                           `[${rule.left} → ${rule.right}]` +
                           inputString.substring(snapshotPos),
                    rule: rule,
                    description: `Trying rule ${rule.left} → ${rule.right} at position ${snapshotPos}`
                });

                let success = true;
                position.value = snapshotPos; // Reset position for this attempt

                // Try to match the right-hand side
                if (rule.right === 'ε' || rule.right === '') {
                    // Epsilon production - matches without consuming input
                    derivationSteps[derivationSteps.length - 1].description +=
                        ' → Matched ε (empty string)';
                } else {
                    // Parse each symbol in the RHS
                    // Split into symbols: variables are single uppercase tokens; terminals may be multi-char
                    const symbols = rule.right.split(/([A-Z]|\(|\)|\+|\*)/).filter(s => s && s.trim());
                    for (const symbol of symbols) {
                        if (cfg.variables.includes(symbol)) {
                            // Non-terminal - recursively parse
                            const attemptKey = keyFor(symbol, position.value);
                            if (inProgress.has(attemptKey)) {
                                // Avoid immediate recursion into a nonTerminal already on the stack
                                success = false;
                                break;
                            }

                            if (!parseNonTerminal(symbol, position.value, derivationSteps, position)) {
                                success = false;
                                break;
                            }
                        } else {
                            // Terminal - match against input
                            if (position.value >= inputString.length || inputString[position.value] !== symbol) {
                                success = false;
                                break;
                            }
                            position.value++;
                        }
                    }
                }

                if (success) {
                    derivationSteps[derivationSteps.length - 1].description +=
                        ` → Success, advanced to position ${position.value}`;
                    inProgress.delete(startKey);
                    return true;
                }

                // Backtrack - remove this derivation step
                derivationSteps.pop();
                position.value = snapshotPos; // Restore position
                // Continue trying other rules
            }

            // All rules failed for this nonTerminal at this position
            inProgress.delete(startKey);
            failureCache.add(startKey);
            return false;
        }
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