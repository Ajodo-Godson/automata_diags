import React, { useState, useEffect, useCallback } from 'react';
import './stylings/NFASimulator.css';
import NFAGraph from './NFAGraph';
import { NFAControlPanel } from './NFAControlPanel';
import { NFATestCases } from './NFATestCases';
import { NFATransitionsEditor } from './TransitionsEditor';
import { NFAStatesEditor } from './StatesEditor';
import { NFAAlphabetEditor } from './AlphabetEditor';
import { CollapsibleSection } from '../shared/CollapsibleSection';
import { useExamples } from './examples';
import { useNFA } from './useNFA';
import { validateNFAChallenge } from '../Tutorial_components/ChallengeValidator';
import { CheckCircle, XCircle, Target } from 'lucide-react';

const NFASimulator = ({ challenge }) => {
    const { examples } = useExamples();
    const [currentExampleName, setCurrentExampleName] = useState(challenge ? null : 'basic_nfa');
    const [currentExampleDescription, setCurrentExampleDescription] = useState(null);
    const [validationResults, setValidationResults] = useState(null);
    
    // Start with minimal blank setup in challenge mode
    const initialConfig = challenge ? {
        states: ['q0'],
        alphabet: ['0', '1'],
        transitions: [],
        startState: 'q0',
        acceptStates: [],
    } : {
        states: examples['basic_nfa'].states,
        alphabet: examples['basic_nfa'].alphabet,
        transitions: examples['basic_nfa'].transitions,
        startState: examples['basic_nfa'].startState,
        acceptStates: examples['basic_nfa'].acceptStates,
    };
    
    const nfa = useNFA(initialConfig);

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
        const pathColors = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#8b5cf6'];
        let activePaths = [{
            id: 0,
            state: nfa.startState,
            color: pathColors[0],
            history: [nfa.startState]
        }];

        const startClosure = getEpsilonClosure(new Set([nfa.startState]), nfa.transitions);
        const newPaths = [];
        startClosure.forEach(state => {
            if (state !== nfa.startState) {
                newPaths.push({
                    id: activePaths.length + newPaths.length,
                    state: state,
                    color: pathColors[(activePaths.length + newPaths.length) % pathColors.length],
                    history: [nfa.startState, state]
                });
            }
        });
        activePaths[0].state = Array.from(startClosure)[0];
        activePaths = [...activePaths, ...newPaths];

        steps.push({
            paths: activePaths.map(p => ({ ...p })),
            states: Array.from(new Set(activePaths.map(p => p.state))),
            remainingInput: inputString,
            description: `Starting in state(s): ${Array.from(new Set(activePaths.map(p => p.state))).join(', ')}`,
            activeTransitions: [],
            accepted: false
        });

        for (let i = 0; i < inputString.length; i++) {
            const symbol = inputString[i];
            const nextPaths = [];
            const activeTransitions = [];

            activePaths.forEach(path => {
                const validTransitions = nfa.transitions.filter(t => t.from === path.state && t.symbol === symbol);
                if (validTransitions.length === 0) return;
                validTransitions.forEach((trans) => {
                    const closure = getEpsilonClosure(new Set([trans.to]), nfa.transitions);
                    closure.forEach((closureState) => {
                        const pathId = nextPaths.length;
                        const newPath = {
                            id: pathId,
                            state: closureState,
                            color: path.color,
                            history: [...path.history, closureState],
                            parentId: path.id
                        };
                        nextPaths.push(newPath);
                        activeTransitions.push({
                            from: trans.from,
                            to: trans.to,
                            symbol: symbol,
                            color: path.color,
                            pathId: pathId
                        });
                        if (closureState !== trans.to) {
                            activeTransitions.push({ from: trans.to, to: closureState, symbol: 'ε', color: path.color, pathId: pathId });
                        }
                    });
                });
            });

            activePaths = nextPaths;
            const currentStates = Array.from(new Set(activePaths.map(p => p.state)));
            steps.push({
                paths: activePaths.map(p => ({ ...p })),
                states: currentStates,
                remainingInput: inputString.slice(i + 1),
                description: `Read '${symbol}' → ${currentStates.length} active path(s) in state(s): ${currentStates.join(', ')}`,
                activeTransitions: activeTransitions,
                accepted: false
            });
        }

        const finalAccepted = activePaths.some(path => nfa.acceptStates.includes(path.state));
        if (steps.length > 0) {
            steps[steps.length - 1].accepted = finalAccepted;
            steps[steps.length - 1].description += finalAccepted ? ' ✓ ACCEPTED' : ' ✗ REJECTED';
        }
        setSimulationSteps(steps);
        setCurrentStep(0);
    };

    const getEpsilonClosure = (states, transitions) => {
        const closure = new Set(states);
        const stack = Array.from(states);
        while (stack.length > 0) {
            const state = stack.pop();
            const epsilonTransitions = transitions.filter(t => t.from === state && (t.symbol === 'ε' || t.symbol === 'epsilon'));
            epsilonTransitions.forEach(t => {
                if (!closure.has(t.to)) {
                    closure.add(t.to);
                    stack.push(t.to);
                }
            });
        }
        return closure;
    };

    const loadExample = useCallback((exampleName) => {
        const example = examples[exampleName];
        if (example) {
            setCurrentExampleName(exampleName);
            setCurrentExampleDescription(example?.description || null);
            nfa.loadDefinition(example);
            setInputString('');
            setSimulationSteps([]);
            setCurrentStep(-1);
            setIsPlaying(false);
        }
    }, [examples, nfa]);

    const resetSimulation = useCallback(() => {
        setCurrentStep(-1);
        setSimulationSteps([]);
        setIsPlaying(false);
    }, []);

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
                            const nfaDefinition = JSON.parse(e.target.result);
                            nfa.setStates(nfaDefinition.states || []);
                            nfa.setAlphabet(nfaDefinition.alphabet || []);
                            nfa.setTransitions(nfaDefinition.transitions || []);
                            nfa.setStartState(nfaDefinition.startState || 'q0');
                            nfa.setAcceptStates(nfaDefinition.acceptStates || []);
                            setCurrentExampleName(nfaDefinition.name || 'Imported NFA');
                            setCurrentExampleDescription(nfaDefinition.description || null);
                            resetSimulation();
                        } catch (error) {
                            alert('Invalid JSON file or NFA definition format');
                        }
                    };
                    reader.readAsText(file);
                }
            };
            input.click();
        };

        const handleExport = () => {
            const nfaDefinition = {
                name: currentExampleName || 'Custom NFA',
                description: currentExampleDescription || 'Exported NFA definition',
                states: nfa.states,
                alphabet: nfa.alphabet,
                transitions: nfa.transitions,
                startState: nfa.startState,
                acceptStates: nfa.acceptStates
            };
            const dataStr = JSON.stringify(nfaDefinition, null, 2);
            const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
            const linkElement = document.createElement('a');
            linkElement.setAttribute('href', dataUri);
            linkElement.setAttribute('download', 'nfa_definition.json');
            linkElement.click();
        };

        const handleClearAll = () => {
            if (window.confirm('Are you sure you want to clear all and start fresh?')) {
                nfa.loadDefinition({ states: ['q0'], alphabet: ['0', '1'], transitions: [], startState: 'q0', acceptStates: [] });
                setCurrentExampleName(null);
                setCurrentExampleDescription(null);
                resetSimulation();
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
    }, [nfa, currentExampleName, currentExampleDescription, resetSimulation]);

    // Reset to blank when challenge mode is activated
    useEffect(() => {
        if (challenge) {
            nfa.loadDefinition({
                states: ['q0'],
                alphabet: challenge.challenge?.alphabet || ['0', '1'],
                transitions: [],
                startState: 'q0',
                acceptStates: [],
            });
            setInputString('');
            resetSimulation();
            setValidationResults(null);
        }
    }, [challenge]);

    const handleValidateChallenge = () => {
        if (!challenge || !challenge.challenge || !challenge.challenge.testCases) {
            alert('No challenge data available');
            return;
        }
        const userNFA = { states: nfa.states, alphabet: nfa.alphabet, transitions: nfa.transitions, startState: nfa.startState, acceptStates: nfa.acceptStates };
        const results = validateNFAChallenge(userNFA, challenge.challenge.testCases);
        setValidationResults(results);
        if (window.opener && challenge.returnTo === 'tutorial') {
            window.opener.postMessage({ type: 'CHALLENGE_RESULT', results: results }, window.location.origin);
        }
    };

    const stepForward = () => { if (currentStep < simulationSteps.length - 1) setCurrentStep(currentStep + 1); };
    const stepBackward = () => { if (currentStep > -1) setCurrentStep(currentStep - 1); };
    const togglePlayback = () => { if (simulationSteps.length === 0) simulateString(); setIsPlaying(!isPlaying); };

    return (
        <div className="nfa-simulator-new">
            <div className="nfa-container">
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
                    <div className="nfa-header">
                        <h1 className="nfa-title">NFA Simulator</h1>
                        <p className="nfa-subtitle">Interactive Non-deterministic Finite Automaton with ε-transitions</p>
                    </div>
                )}

                {!challenge && (
                    <div className="nfa-example-selector">
                        <label className="nfa-selector-label">Load Example:</label>
                        <div className="nfa-selector-buttons">
                            {Object.entries(examples).map(([key, example]) => (
                                <button key={key} className={`nfa-selector-btn ${currentExampleName === key ? 'active' : ''}`} onClick={() => loadExample(key)}>
                                    {example.name}
                                </button>
                            ))}
                        </div>
                        {currentExampleDescription && (
                            <div className="nfa-example-description"><strong>Description:</strong> {currentExampleDescription}</div>
                        )}
                    </div>
                )}

                <div className="nfa-grid">
                    <div className="nfa-left-col">
                        <div className="nfa-input-card">
                            <h3 className="nfa-card-title">Test Input String</h3>
                            <div className="nfa-input-group">
                                <input type="text" value={inputString} onChange={(e) => setInputString(e.target.value)} placeholder="Enter input string (e.g., 010)" className="nfa-input" />
                                <button onClick={simulateString} className="nfa-btn nfa-btn-primary">Test</button>
                            </div>
                            <p className="nfa-input-help">Alphabet: {nfa.alphabet.join(', ')} (ε for epsilon)</p>
                            {isComplete && (
                                <div className={`nfa-result-indicator ${isAccepted ? 'nfa-result-accepted' : 'nfa-result-rejected'}`}>
                                    {isAccepted ? '✓ ACCEPTED' : '✗ REJECTED'}
                                </div>
                            )}
                        </div>

                        <NFAControlPanel 
                            onTogglePlayback={togglePlayback}
                            onStepForward={stepForward}
                            onStepBackward={stepBackward}
                            onReset={resetSimulation}
                            isPlaying={isPlaying}
                            canStepForward={currentStep < simulationSteps.length - 1}
                            canStepBackward={currentStep > -1}
                            speed={playbackSpeed}
                            onSpeedChange={setPlaybackSpeed}
                        />

                        <div className="nfa-graph-card">
                            <h3 className="nfa-card-title">State Diagram</h3>
                            <NFAGraph nfa={nfa} currentStates={currentStep >= 0 ? simulationSteps[currentStep]?.states || [] : []} activeTransitions={currentStep >= 0 ? simulationSteps[currentStep]?.activeTransitions || [] : []} />
                        </div>
                    </div>

                    <div className="nfa-right-col">
                        <CollapsibleSection title="States Editor" defaultOpen={challenge ? true : false}>
                            <NFAStatesEditor nfa={nfa} onUpdate={resetSimulation} />
                        </CollapsibleSection>
                        <CollapsibleSection title="Alphabet" defaultOpen={challenge ? true : false}>
                            <NFAAlphabetEditor nfa={nfa} onUpdate={resetSimulation} />
                        </CollapsibleSection>
                        <CollapsibleSection title="Transitions Editor" defaultOpen={challenge ? true : false}>
                            <NFATransitionsEditor nfa={nfa} onUpdate={resetSimulation} />
                        </CollapsibleSection>
                        {!challenge && (
                            <CollapsibleSection title="Example Test Cases" defaultOpen={false}>
                                <NFATestCases nfa={nfa} currentExample={currentExampleName} onTestString={(testString) => { setInputString(testString); setSimulationSteps([]); setCurrentStep(-1); setIsPlaying(false); }} />
                            </CollapsibleSection>
                        )}
                        {simulationSteps.length > 0 && (
                            <div className="nfa-steps-card">
                                <h3 className="nfa-card-title">Simulation Progress</h3>
                                <div className="nfa-step-display">
                                    {currentStep >= 0 && currentStep < simulationSteps.length && (
                                        <>
                                            <div className="nfa-step-info"><strong>Step {currentStep + 1} of {simulationSteps.length}</strong></div>
                                            <div className="nfa-step-state">Current States: <span className="nfa-highlight">{simulationSteps[currentStep].states.join(', ')}</span></div>
                                            <div className="nfa-step-remaining">Remaining Input: <code>"{simulationSteps[currentStep].remainingInput}"</code></div>
                                            <div className="nfa-step-desc">{simulationSteps[currentStep].description}</div>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                        <CollapsibleSection title="Transition Table" defaultOpen={!currentExampleName}>
                            <div className="nfa-table-wrapper">
                                <table className="nfa-table">
                                    <thead>
                                        <tr>
                                            <th>State</th>
                                            {nfa.alphabet.map(symbol => (<th key={symbol}>{symbol}</th>))}
                                            <th>ε</th>
                                            <th>Accept?</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {nfa.states.map(state => {
                                            const isCurrentState = currentStep >= 0 && simulationSteps[currentStep]?.states.includes(state);
                                            return (
                                                <tr key={state} className={isCurrentState ? 'nfa-current-state' : ''}>
                                                    <td className="nfa-state-cell">{state}</td>
                                                    {nfa.alphabet.map(symbol => {
                                                        const transitions = nfa.transitions.filter(t => t.from === state && t.symbol === symbol);
                                                        return <td key={`${state}-${symbol}`}>{transitions.map(t => t.to).join(', ') || '—'}</td>;
                                                    })}
                                                    <td>
                                                        {nfa.transitions.filter(t => t.from === state && (t.symbol === 'ε' || t.symbol === 'epsilon')).map(t => t.to).join(', ') || '—'}
                                                    </td>
                                                    <td>{nfa.acceptStates.includes(state) ? '✓' : ''}</td>
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

export default NFASimulator;
