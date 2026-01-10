import React, { useState, useEffect, useCallback, useMemo } from 'react';
import './stylings/PDASimulator.css';
import { PDAControlPanel } from './PDAControlPanel';
import { PDATestCases } from './PDATestCases';
import { PDAStatesEditor } from './StatesEditor';
import { PDATransitionsEditor } from './TransitionsEditor';
import { PDAAlphabetEditor } from './AlphabetEditor';
import PDAGraph from './PDAGraph';
import { CollapsibleSection } from '../shared/CollapsibleSection';
import { useExamples } from './examples';
import { usePDA } from './usePDA';
import { validatePDAChallenge } from '../Tutorial_components/ChallengeValidator';
import { CheckCircle, XCircle, Target } from 'lucide-react';

const PDASimulator = ({ challenge }) => {
    const { examples } = useExamples();
    const [currentExampleName, setCurrentExampleName] = useState(challenge ? null : 'balanced_parentheses');
    const [currentExampleDescription, setCurrentExampleDescription] = useState(null);
    const [validationResults, setValidationResults] = useState(null);

    // Memoize initialConfig
    const initialConfig = useMemo(() => challenge ? {
        states: ['q0'],
        alphabet: challenge.challenge?.alphabet || ['0', '1'],
        stackAlphabet: challenge.challenge?.stackAlphabet || ['Z', 'X'],
        transitions: [],
        startState: 'q0',
        startStackSymbol: 'Z',
        acceptStates: new Set(),
    } : {
        states: examples['balanced_parentheses'].states,
        alphabet: examples['balanced_parentheses'].alphabet,
        stackAlphabet: examples['balanced_parentheses'].stackAlphabet,
        transitions: examples['balanced_parentheses'].transitions,
        startState: examples['balanced_parentheses'].startState,
        startStackSymbol: examples['balanced_parentheses'].startStackSymbol,
        acceptStates: examples['balanced_parentheses'].acceptStates,
    }, [challenge, examples]);

    const pda = usePDA(initialConfig);

    const [inputString, setInputString] = useState('');
    const [simulationSteps, setSimulationSteps] = useState([]);
    const [currentStep, setCurrentStep] = useState(-1);
    const [isPlaying, setIsPlaying] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(500);

    const isComplete = currentStep >= 0 && currentStep === simulationSteps.length - 1;
    const isAccepted = isComplete && simulationSteps[currentStep]?.accepted;

    // Auto-play simulation
    useEffect(() => {
        let timer;
        if (isPlaying && currentStep < simulationSteps.length - 1) {
            timer = setTimeout(() => {
                setCurrentStep(currentStep + 1);
            }, playbackSpeed);
        } else if (currentStep >= simulationSteps.length - 1) {
            setIsPlaying(false);
        }
        return () => clearTimeout(timer);
    }, [isPlaying, currentStep, simulationSteps.length, playbackSpeed]);

    const handleReset = useCallback(() => {
        setSimulationSteps([]);
        setCurrentStep(-1);
        setIsPlaying(false);
    }, []);

    const loadExample = useCallback((exampleName) => {
        const example = examples[exampleName];
        if (example) {
            setCurrentExampleName(exampleName);
            setCurrentExampleDescription(example?.description || null);
            pda.loadPDA(example);
            setInputString('');
            handleReset();
        }
    }, [examples, pda.loadPDA, handleReset]);

    const simulateString = () => {
        setSimulationSteps([]);
        setCurrentStep(-1);

        const initialPath = [{
            state: pda.startState,
            stack: [pda.startStackSymbol],
            remainingInput: inputString,
            inputPosition: 0,
            description: `Start: state ${pda.startState}, stack [${pda.startStackSymbol}]`,
            transition: null,
            accepted: false
        }];

        const configurations = [{
            state: pda.startState,
            stack: [pda.startStackSymbol],
            inputPosition: 0,
            path: initialPath
        }];

        const visited = new Set();
        const maxIterations = 5000;
        let iterationCount = 0;
        let lastKnownPath = initialPath;

        while (configurations.length > 0 && iterationCount < maxIterations) {
            iterationCount++;
            const config = configurations.shift();
            const { state, stack, inputPosition, path } = config;
            lastKnownPath = path;
            
            if (stack.length > inputString.length + 20) continue;

            const topOfStack = stack[stack.length - 1] || 'ε';
            const configKey = `${state}|${stack.slice(-20).join(',')}|${inputPosition}`;
            if (visited.has(configKey)) continue;
            visited.add(configKey);

            // Final state acceptance check (Accept if input exhausted and state is accepting)
            if (inputPosition === inputString.length && pda.acceptStates.has(state)) {
                path[path.length - 1].accepted = true;
                path[path.length - 1].description += ' → ACCEPTED';
                setSimulationSteps(path);
                setCurrentStep(0);
                return;
            }

            const applicableTransitions = [];
            const currentInput = inputPosition < inputString.length ? inputString[inputPosition] : null;

            for (const t of pda.transitions) {
                // Match State
                if (t.from !== state) continue;

                // Match Input (Symbol or ε)
                const inputMatch = (currentInput !== null && t.input === currentInput) || (t.input === 'ε' || t.input === 'epsilon' || t.input === '');
                if (!inputMatch) continue;

                // Match Pop (Symbol or ε)
                // If t.pop is not epsilon, it MUST match the top of the stack.
                const popMatch = (t.pop === 'ε' || t.pop === 'epsilon' || t.pop === '') || (t.pop === topOfStack);
                if (!popMatch) continue;

                applicableTransitions.push(t);
            }

            for (const transition of applicableTransitions) {
                const newState = transition.to;
                const newStack = [...stack];
                
                // Perform Pop if required
                if (transition.pop && transition.pop !== 'ε' && transition.pop !== 'epsilon') {
                    newStack.pop();
                }
                
                // Perform Push if required
                if (transition.push && transition.push !== 'ε' && transition.push !== 'epsilon') {
                    // Standard PDA: left-most symbol in push string becomes the new top
                    const pushSymbols = transition.push.split('').reverse();
                    newStack.push(...pushSymbols);
                }
                
                const consumesInput = transition.input && transition.input !== 'ε' && transition.input !== 'epsilon';
                const newInputPosition = consumesInput ? inputPosition + 1 : inputPosition;
                
                const newPath = [...path, {
                    state: newState,
                    stack: [...newStack],
                    remainingInput: inputString.slice(newInputPosition),
                    inputPosition: newInputPosition,
                    description: `Read '${transition.input || 'ε'}', popped '${transition.pop || 'ε'}', pushed '${transition.push || 'ε'}', moved to ${newState}`,
                    transition: transition,
                    accepted: false
                }];
                configurations.push({ state: newState, stack: newStack, inputPosition: newInputPosition, path: newPath });
            }
        }

        let finalPath = [...lastKnownPath];
        finalPath[finalPath.length-1].description += iterationCount >= maxIterations ? ' (Timeout/Complex)' : ' → REJECTED';
        setSimulationSteps(finalPath);
        setCurrentStep(0);
    };

    // Event listeners for toolbox actions
    useEffect(() => {
        const handleImport = () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';
            input.onchange = (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        try {
                            const pdaDefinition = JSON.parse(e.target.result);
                            pda.loadPDA({
                                states: pdaDefinition.states || [],
                                alphabet: pdaDefinition.alphabet || [],
                                stackAlphabet: pdaDefinition.stackAlphabet || [],
                                transitions: pdaDefinition.transitions || [],
                                startState: pdaDefinition.startState || 'q0',
                                startStackSymbol: pdaDefinition.startStackSymbol || 'Z',
                                acceptStates: new Set(pdaDefinition.acceptStates || [])
                            });
                            setCurrentExampleName(pdaDefinition.name || 'Imported PDA');
                            setCurrentExampleDescription(pdaDefinition.description || null);
                            handleReset();
                        } catch (error) {
                            alert('Invalid JSON file or PDA definition format');
                        }
                    };
                    reader.readAsText(file);
                }
            };
            input.click();
        };

        const handleExport = () => {
            const pdaDefinition = {
                name: currentExampleName || 'Custom PDA',
                description: currentExampleDescription || 'Exported PDA definition',
                states: pda.states,
                alphabet: pda.alphabet,
                stackAlphabet: pda.stackAlphabet,
                transitions: pda.transitions,
                startState: pda.startState,
                startStackSymbol: pda.startStackSymbol,
                acceptStates: Array.from(pda.acceptStates)
            };
            const dataStr = JSON.stringify(pdaDefinition, null, 2);
            const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
            const linkElement = document.createElement('a');
            linkElement.setAttribute('href', dataUri);
            linkElement.setAttribute('download', 'pda_definition.json');
            linkElement.click();
        };

        const handleClearAll = () => {
            if (window.confirm('Are you sure you want to clear all and start fresh?')) {
                pda.loadPDA({
                    states: ['q0'],
                    alphabet: ['0', '1'],
                    stackAlphabet: ['Z', 'X'],
                    transitions: [],
                    startState: 'q0',
                    startStackSymbol: 'Z',
                    acceptStates: new Set()
                });
                setCurrentExampleName(null);
                setCurrentExampleDescription(null);
                handleReset();
                setValidationResults(null);
            }
        };

        window.addEventListener('import', handleImport);
        window.addEventListener('export', handleExport);
        window.addEventListener('clearAll', handleClearAll);
        return () => {
            window.removeEventListener('import', handleImport);
            window.removeEventListener('export', handleExport);
            window.removeEventListener('clearAll', handleClearAll);
        };
    }, [pda.loadPDA, pda.states, pda.alphabet, pda.stackAlphabet, pda.transitions, pda.startState, pda.startStackSymbol, pda.acceptStates, currentExampleName, currentExampleDescription, handleReset]);

    // Reset to blank when challenge mode is activated
    useEffect(() => {
        if (challenge) {
            pda.loadPDA({
                states: ['q0'],
                alphabet: challenge.challenge?.alphabet || ['0', '1'],
                stackAlphabet: challenge.challenge?.stackAlphabet || ['Z', 'X'],
                transitions: [],
                startState: 'q0',
                startStackSymbol: 'Z',
                acceptStates: new Set(),
            });
            setInputString('');
            handleReset();
            setValidationResults(null);
        }
    }, [challenge]);

    const handleValidateChallenge = () => {
        if (!challenge || !challenge.challenge || !challenge.challenge.testCases) {
            alert('No challenge data available');
            return;
        }
        const userPDA = { states: pda.states, alphabet: pda.alphabet, stackAlphabet: pda.stackAlphabet, transitions: pda.transitions, startState: pda.startState, startStackSymbol: pda.startStackSymbol, acceptStates: pda.acceptStates };
        const results = validatePDAChallenge(userPDA, challenge.challenge.testCases);
        setValidationResults(results);
        if (window.opener && challenge.returnTo === 'tutorial') {
            window.opener.postMessage({ type: 'CHALLENGE_RESULT', results: results }, window.location.origin);
        }
    };

    return (
        <div className="pda-simulator-new">
            <div className="pda-container">
                {/* Compact Challenge Header */}
                {challenge && challenge.challenge && (
                    <div className="compact-challenge-header">
                        <div className="challenge-info">
                            <Target size={20} />
                            <span><strong>Challenge:</strong> {challenge.challenge.description}</span>
                        </div>
                        <button className="validate-btn-compact" onClick={handleValidateChallenge}>
                            <CheckCircle size={16} /> Validate
                        </button>
                        {validationResults && (
                            <div className={`mini-results ${validationResults.passed === validationResults.total ? 'pass' : 'fail'}`}>
                                {validationResults.passed}/{validationResults.total} Passed
                            </div>
                        )}
                    </div>
                )}

                {!challenge && (
                    <div className="pda-header">
                        <h1 className="pda-title">PDA Simulator</h1>
                        <p className="pda-subtitle">Pushdown Automaton - Step-by-step visualization with stack operations</p>
                    </div>
                )}

                {!challenge && (
                    <div className="pda-example-selector">
                        <label className="pda-selector-label">Load Example:</label>
                        <div className="pda-selector-buttons">
                            {Object.entries(examples).map(([key, example]) => (
                                <button key={key} className={`pda-selector-btn ${currentExampleName === key ? 'active' : ''}`} onClick={() => loadExample(key)}>
                                    {example.name}
                                </button>
                            ))}
                        </div>
                        {currentExampleDescription && (
                            <div className="pda-example-description"><strong>Description:</strong> {currentExampleDescription}</div>
                        )}
                    </div>
                )}

                <div className="pda-grid">
                    <div className="pda-left-col">
                        <div className="pda-input-card">
                            <h3 className="pda-card-title">Input String</h3>
                            <div className="pda-input-group">
                                <input type="text" value={inputString} onChange={(e) => setInputString(e.target.value)} placeholder="Enter input string (e.g., (())" className="pda-input" />
                                <button onClick={simulateString} className="pda-btn pda-btn-primary">Test</button>
                            </div>
                            <p className="pda-input-help">Alphabet: {pda.alphabet.join(', ')}</p>
                            {isComplete && (
                                <div className={`pda-result-indicator ${isAccepted ? 'pda-result-accepted' : 'pda-result-rejected'}`}>
                                    {isAccepted ? '✓ ACCEPTED' : '✗ REJECTED'}
                                </div>
                            )}
                        </div>

                        <PDAControlPanel
                            currentState={simulationSteps.length > 0 && currentStep >= 0 ? simulationSteps[currentStep].state : pda.startState}
                            stepCount={currentStep + 1}
                            isPlaying={isPlaying}
                            isComplete={isComplete}
                            isAccepted={isAccepted}
                            speed={playbackSpeed}
                            onRun={() => { if (simulationSteps.length === 0) simulateString(); setIsPlaying(true); }}
                            onPause={() => setIsPlaying(false)}
                            onStep={() => { if (simulationSteps.length === 0) simulateString(); else if (currentStep < simulationSteps.length - 1) setCurrentStep(currentStep + 1); }}
                            onReset={handleReset}
                            onSpeedChange={setPlaybackSpeed}
                        />

                        <div className="pda-stack-card">
                            <h3 className="pda-card-title">Stack Visualization</h3>
                            <div className="pda-stack-container">
                                {simulationSteps.length > 0 && currentStep >= 0 ? (
                                    <div className="pda-stack">
                                        {simulationSteps[currentStep].stack.length === 0 ? (
                                            <div className="pda-stack-empty">Stack is empty</div>
                                        ) : (
                                            simulationSteps[currentStep].stack.map((symbol, index) => (
                                                <div key={index} className={`pda-stack-item ${index === simulationSteps[currentStep].stack.length - 1 ? 'pda-stack-top' : ''}`}>
                                                    {symbol}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                ) : (
                                    <div className="pda-stack-initial">
                                        <div className="pda-stack-item pda-stack-top">{pda.startStackSymbol}</div>
                                    </div>
                                )}
                                <div className="pda-stack-label">Top of Stack</div>
                            </div>
                        </div>
                    </div>

                    <div className="pda-right-col">
                        {/* PDA Graph Visualization - at the top of right column */}
                        <CollapsibleSection title="State Diagram" defaultOpen={true}>
                            <div className="pda-graph-card">
                                <PDAGraph
                                    states={pda.states}
                                    transitions={pda.transitions}
                                    startState={pda.startState}
                                    acceptStates={pda.acceptStates}
                                    currentState={simulationSteps.length > 0 && currentStep >= 0 ? simulationSteps[currentStep].state : pda.startState}
                                />
                            </div>
                        </CollapsibleSection>
                        <CollapsibleSection title="States Editor" defaultOpen={challenge ? true : false}>
                            <PDAStatesEditor pda={pda} onUpdate={handleReset} />
                        </CollapsibleSection>
                        <CollapsibleSection title="Alphabets" defaultOpen={challenge ? true : false}>
                            <PDAAlphabetEditor pda={pda} onUpdate={handleReset} />
                        </CollapsibleSection>
                        <CollapsibleSection title="Transitions Editor" defaultOpen={challenge ? true : false}>
                            <PDATransitionsEditor pda={pda} onUpdate={handleReset} />
                        </CollapsibleSection>
                        {!challenge && (
                            <CollapsibleSection title="Example Test Cases" defaultOpen={false}>
                                <PDATestCases onLoadTest={(ti) => { setInputString(ti); handleReset(); }} currentExample={currentExampleName} />
                            </CollapsibleSection>
                        )}
                        {simulationSteps.length > 0 && (
                            <div className="pda-steps-card">
                                <h3 className="pda-card-title">Simulation Progress</h3>
                                <div className="pda-step-display">
                                    {currentStep >= 0 && currentStep < simulationSteps.length && (
                                        <>
                                            <div className="pda-step-info"><strong>Step {currentStep + 1} of {simulationSteps.length}</strong></div>
                                            <div className="pda-step-state">Current State: <span className="pda-highlight">{simulationSteps[currentStep].state}</span></div>
                                            <div className="pda-step-stack">Stack: [{simulationSteps[currentStep].stack.join(', ')}]</div>
                                            <div className="pda-step-remaining">Remaining Input: <code>"{simulationSteps[currentStep].remainingInput}"</code></div>
                                            <div className="pda-step-desc">{simulationSteps[currentStep].description}</div>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PDASimulator;
