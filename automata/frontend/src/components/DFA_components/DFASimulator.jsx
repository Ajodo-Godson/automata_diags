import React, { useState, useEffect, useCallback, useMemo } from 'react';
import './stylings/DFASimulator.css';
import DFAGraph from './DFAGraph';
import { DFAControlPanel } from './DFAControlPanel';
import { DFATestCases } from './DFATestCases';
import { TransitionsEditor } from './TransitionsEditor';
import { StatesEditor } from './StatesEditor';
import { AlphabetEditor } from './AlphabetEditor';
import { CollapsibleSection } from '../shared/CollapsibleSection';
import { useExamples } from './examples';
import { useDFA } from './useDFA';
import { validateDFAChallenge } from '../Tutorial_components/ChallengeValidator';
import { CheckCircle, XCircle, Target } from 'lucide-react';

const DFASimulatorNew = ({ challenge }) => {
    const { examples } = useExamples();
    const [currentExampleName, setCurrentExampleName] = useState(challenge ? null : 'ends_with_ab');
    const [currentExampleDescription, setCurrentExampleDescription] = useState(null);
    const [validationResults, setValidationResults] = useState(null);
    
    // Memoize initialConfig
    const initialConfig = useMemo(() => challenge ? {
        states: ['q0'],
        alphabet: challenge.challenge?.alphabet || ['0', '1'],
        transitions: {},
        startState: 'q0',
        acceptStates: new Set(),
    } : {
        states: examples['ends_with_ab'].states,
        alphabet: examples['ends_with_ab'].alphabet,
        transitions: examples['ends_with_ab'].transitions,
        startState: examples['ends_with_ab'].startState,
        acceptStates: examples['ends_with_ab'].acceptStates,
    }, [challenge, examples]);
    
    const dfa = useDFA(initialConfig);

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

    const simulateString = () => {
        setSimulationSteps([]);
        setCurrentStep(-1);

        let steps = [];
        let currentState = dfa.startState;

        // Initial step
        steps.push({
            state: currentState,
            remainingInput: inputString,
            description: `Starting in state ${currentState}`,
            transition: null,
            accepted: false
        });

        // Process each symbol
        for (let i = 0; i < inputString.length; i++) {
            const symbol = inputString[i];
            
            if (!dfa.alphabet.includes(symbol)) {
                // Ignore invalid symbols for smoother experience, or could alert
                break;
            }

            if (!dfa.hasTransition(currentState, symbol)) {
                break;
            }

            const fromState = currentState;
            const nextState = dfa.transitions[currentState][symbol];

            steps.push({
                state: nextState,
                remainingInput: inputString.slice(i + 1),
                description: `Read '${symbol}', moved from ${fromState} to ${nextState}`,
                transition: {
                    from: fromState,
                    to: nextState,
                    symbol: symbol
                },
                accepted: false
            });

            currentState = nextState;
        }

        // Final step with acceptance check
        const accepted = dfa.acceptStates.has(currentState);
        if (steps.length > 0) {
            steps[steps.length - 1].accepted = accepted;
            steps[steps.length - 1].description += ` → ${accepted ? 'ACCEPTED' : 'REJECTED'}`;
        }

        setSimulationSteps(steps);
        setCurrentStep(0);
    };

    const handleRun = () => {
        if (simulationSteps.length === 0) {
            simulateString();
        }
        setIsPlaying(true);
    };

    const handlePause = () => {
        setIsPlaying(false);
    };

    const handleStep = () => {
        if (simulationSteps.length === 0) {
            simulateString();
        } else if (currentStep < simulationSteps.length - 1) {
            setCurrentStep(currentStep + 1);
        }
    };

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
            dfa.loadDFA(example);
            setInputString('');
            handleReset();
        }
    }, [examples, dfa.loadDFA, handleReset]);

    const handleLoadTest = (testInput) => {
        setInputString(testInput);
        handleReset();
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
                            const dfaDefinition = JSON.parse(e.target.result);
                            dfa.loadDFA({
                                states: dfaDefinition.states || [],
                                alphabet: dfaDefinition.alphabet || [],
                                transitions: dfaDefinition.transitions || {},
                                startState: dfaDefinition.startState || 'q0',
                                acceptStates: new Set(dfaDefinition.acceptStates || [])
                            });
                            setCurrentExampleName(dfaDefinition.name || 'Imported DFA');
                            setCurrentExampleDescription(dfaDefinition.description || null);
                            handleReset();
                        } catch (error) {
                            alert('Invalid JSON file or DFA definition format');
                        }
                    };
                    reader.readAsText(file);
                }
            };
            input.click();
        };

        const handleExport = () => {
            const dfaDefinition = {
                name: currentExampleName || 'Custom DFA',
                description: 'Exported DFA definition',
                states: dfa.states,
                alphabet: dfa.alphabet,
                transitions: dfa.transitions,
                startState: dfa.startState,
                acceptStates: Array.from(dfa.acceptStates)
            };
            const dataStr = JSON.stringify(dfaDefinition, null, 2);
            const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
            const linkElement = document.createElement('a');
            linkElement.setAttribute('href', dataUri);
            linkElement.setAttribute('download', 'dfa_definition.json');
            linkElement.click();
        };

        const handleClearAll = () => {
            if (window.confirm('Are you sure you want to clear all and start fresh?')) {
                dfa.loadDFA({
                    states: ['q0'],
                    alphabet: ['0', '1'],
                    transitions: {},
                    startState: 'q0',
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
    }, [dfa.loadDFA, dfa.states, dfa.alphabet, dfa.transitions, dfa.startState, dfa.acceptStates, currentExampleName, handleReset]);

    // Reset to blank when challenge mode is activated
    useEffect(() => {
        if (challenge) {
            dfa.loadDFA({
                states: ['q0'],
                alphabet: challenge.challenge?.alphabet || ['0', '1'],
                transitions: {},
                startState: 'q0',
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
        const userDFA = { states: dfa.states, alphabet: dfa.alphabet, transitions: dfa.transitions, startState: dfa.startState, acceptStates: dfa.acceptStates };
        const results = validateDFAChallenge(userDFA, challenge.challenge.testCases);
        setValidationResults(results);
        if (window.opener && challenge.returnTo === 'tutorial') {
            window.opener.postMessage({ type: 'CHALLENGE_RESULT', results: results }, window.location.origin);
        }
    };

    return (
        <div className="dfa-simulator-new">
            <div className="dfa-container">
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
                    <div className="dfa-header">
                        <h1 className="dfa-title">DFA Simulator</h1>
                        <p className="dfa-subtitle">Deterministic Finite Automaton - Step-by-step visualization</p>
                    </div>
                )}

                {!challenge && (
                    <div className="dfa-example-selector">
                        <label className="dfa-selector-label">Load Example:</label>
                        <div className="dfa-selector-buttons">
                            {Object.entries(examples).map(([key, example]) => (
                                <button key={key} onClick={() => loadExample(key)} className={`dfa-selector-btn ${currentExampleName === key ? 'active' : ''}`}>
                                    {example.name}
                                </button>
                            ))}
                        </div>
                        {currentExampleDescription && (
                            <div className="dfa-example-description"><strong>Description:</strong> {currentExampleDescription}</div>
                        )}
                    </div>
                )}

                <div className="dfa-grid">
                    <div className="dfa-left-col">
                        <div className="dfa-input-card-compact">
                            <h3 className="dfa-card-title-compact">Test Input String</h3>
                            <div className="dfa-input-group">
                                <input type="text" value={inputString} onChange={(e) => setInputString(e.target.value)} placeholder="e.g., aab" className="dfa-input" />
                                <button onClick={simulateString} className="dfa-btn dfa-btn-primary dfa-btn-compact">TEST</button>
                            </div>
                            <p className="dfa-input-help-compact">Alphabet: {dfa.alphabet.join(', ')}</p>
                            {isComplete && (
                                <div className={`dfa-result-indicator ${isAccepted ? 'dfa-result-accepted' : 'dfa-result-rejected'}`}>
                                    {isAccepted ? '✓ ACCEPTED' : '✗ REJECTED'}
                                </div>
                            )}
                        </div>

                        <DFAControlPanel
                            currentState={simulationSteps.length > 0 && currentStep >= 0 ? simulationSteps[currentStep].state : dfa.startState}
                            stepCount={currentStep + 1}
                            isPlaying={isPlaying}
                            isComplete={isComplete}
                            isAccepted={isAccepted}
                            speed={playbackSpeed}
                            onRun={handleRun}
                            onPause={handlePause}
                            onStep={handleStep}
                            onReset={handleReset}
                            onSpeedChange={setPlaybackSpeed}
                        />

                        <div className="dfa-graph-card">
                            <h3 className="dfa-card-title">State Diagram</h3>
                            <DFAGraph states={dfa.states} transitions={dfa.transitions} startState={dfa.startState} acceptStates={dfa.acceptStates} currentState={simulationSteps.length > 0 && currentStep >= 0 ? simulationSteps[currentStep].state : null} currentTransition={simulationSteps.length > 0 && currentStep >= 0 ? simulationSteps[currentStep].transition : null} isPlaying={isPlaying} />
                        </div>
                    </div>

                    <div className="dfa-right-col">
                        <CollapsibleSection title="States Editor" defaultOpen={challenge ? true : false}>
                            <StatesEditor dfa={dfa} onUpdate={handleReset} />
                        </CollapsibleSection>
                        <CollapsibleSection title="Alphabet" defaultOpen={challenge ? true : false}>
                            <AlphabetEditor dfa={dfa} onUpdate={handleReset} />
                        </CollapsibleSection>
                        <CollapsibleSection title="Transitions Editor" defaultOpen={challenge ? true : false}>
                            <TransitionsEditor dfa={dfa} onUpdate={handleReset} />
                        </CollapsibleSection>
                        {!challenge && (
                            <CollapsibleSection title="Example Test Cases" defaultOpen={false}>
                                <DFATestCases onLoadTest={handleLoadTest} currentExample={currentExampleName} />
                            </CollapsibleSection>
                        )}
                        {simulationSteps.length > 0 && (
                            <div className="dfa-steps-card">
                                <h3 className="dfa-card-title">Simulation Progress</h3>
                                <div className="dfa-step-display">
                                    {currentStep >= 0 && currentStep < simulationSteps.length && (
                                        <>
                                            <div className="dfa-step-info"><strong>Step {currentStep + 1} of {simulationSteps.length}</strong></div>
                                            <div className="dfa-step-state">Current State: <span className="dfa-highlight">{simulationSteps[currentStep].state}</span></div>
                                            <div className="dfa-step-remaining">Remaining Input: <code>"{simulationSteps[currentStep].remainingInput}"</code></div>
                                            <div className="dfa-step-desc">{simulationSteps[currentStep].description}</div>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                        <CollapsibleSection title="Transition Table" defaultOpen={!currentExampleName}>
                            <div className="dfa-table-wrapper">
                                <table className="dfa-table">
                                    <thead>
                                        <tr>
                                            <th>State</th>
                                            {dfa.alphabet.map(symbol => (<th key={symbol}>{symbol}</th>))}
                                            <th>Accept?</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {dfa.states.map(state => {
                                            const currentStepData = currentStep >= 0 && currentStep < simulationSteps.length ? simulationSteps[currentStep] : null;
                                            const isCurrentState = currentStepData && currentStepData.state === state;
                                            return (
                                                <tr key={state} className={isCurrentState ? 'dfa-current-state' : ''}>
                                                    <td className="dfa-state-cell">{state}</td>
                                                    {dfa.alphabet.map(symbol => (
                                                        <td key={`${state}-${symbol}`}>{dfa.hasTransition(state, symbol) ? dfa.transitions[state][symbol] : '—'}</td>
                                                    ))}
                                                    <td>{dfa.acceptStates.has(state) ? '✓' : ''}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </CollapsibleSection>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DFASimulatorNew;
