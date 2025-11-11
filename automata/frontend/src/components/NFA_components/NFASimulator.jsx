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

const NFASimulator = () => {
    const { examples } = useExamples();
    const [currentExampleName, setCurrentExampleName] = useState(null);
    
    // Start with a blank NFA
    const nfa = useNFA({
        states: ['q0'],
        alphabet: ['0', '1'],
        transitions: [],
        startState: 'q0',
        acceptStates: [],
    });

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
        let currentStates = new Set([nfa.startState]);

        // Add epsilon closure for start state
        currentStates = getEpsilonClosure(currentStates, nfa.transitions);

        // Initial step
        steps.push({
            states: Array.from(currentStates),
            remainingInput: inputString,
            description: `Starting in states ${Array.from(currentStates).join(', ')}`,
            transition: null,
            accepted: false
        });

        // Process each symbol
        for (let i = 0; i < inputString.length; i++) {
            const symbol = inputString[i];
            const nextStates = new Set();

            // Find all transitions for current symbol from current states
            currentStates.forEach(state => {
                const validTransitions = nfa.transitions.filter(t => 
                    t.from === state && t.symbol === symbol
                );
                validTransitions.forEach(t => nextStates.add(t.to));
            });

            // Add epsilon closure for next states
            const closureStates = getEpsilonClosure(nextStates, nfa.transitions);
            currentStates = closureStates;

            steps.push({
                states: Array.from(currentStates),
                remainingInput: inputString.slice(i + 1),
                description: `Read '${symbol}', now in states ${Array.from(currentStates).join(', ')}`,
                transition: { symbol, from: steps[i].states, to: Array.from(currentStates) },
                accepted: false
            });
        }

        // Final acceptance check
        const finalAccepted = Array.from(currentStates).some(state => 
            nfa.acceptStates.includes(state)
        );
        
        if (steps.length > 0) {
            steps[steps.length - 1].accepted = finalAccepted;
            steps[steps.length - 1].description += finalAccepted ? ' - ACCEPTED' : ' - REJECTED';
        }

        setSimulationSteps(steps);
    };

    const getEpsilonClosure = (states, transitions) => {
        const closure = new Set(states);
        const stack = Array.from(states);

        while (stack.length > 0) {
            const state = stack.pop();
            const epsilonTransitions = transitions.filter(t => 
                t.from === state && (t.symbol === 'ε' || t.symbol === 'epsilon')
            );
            
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
            nfa.loadDefinition(example);
            setInputString('');
            setSimulationSteps([]);
            setCurrentStep(-1);
            setIsPlaying(false);
        }
    }, [examples, nfa, setCurrentExampleName, setInputString, setSimulationSteps, setCurrentStep, setIsPlaying]);

    const resetSimulation = useCallback(() => {
        setCurrentStep(-1);
        setSimulationSteps([]);
        setIsPlaying(false);
    }, []);

    // Event listeners for toolbox actions (Import, Export, and Clear All)
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
                description: 'Exported NFA definition',
                states: nfa.states,
                alphabet: nfa.alphabet,
                transitions: nfa.transitions,
                startState: nfa.startState,
                acceptStates: nfa.acceptStates
            };
            
            const dataStr = JSON.stringify(nfaDefinition, null, 2);
            const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
            
            const exportFileDefaultName = 'nfa_definition.json';
            
            const linkElement = document.createElement('a');
            linkElement.setAttribute('href', dataUri);
            linkElement.setAttribute('download', exportFileDefaultName);
            linkElement.click();
        };

        const handleClearAll = () => {
            // Create a blank NFA
            if (window.confirm('Are you sure you want to clear all and start fresh?')) {
                nfa.loadDefinition({
                    states: ['q0'],
                    alphabet: ['0', '1'],
                    transitions: [],
                    startState: 'q0',
                    acceptStates: []
                });
                setCurrentExampleName(null);
                resetSimulation();
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
    }, [nfa, currentExampleName, resetSimulation]);

    const stepForward = () => {
        if (currentStep < simulationSteps.length - 1) {
            setCurrentStep(currentStep + 1);
        }
    };

    const stepBackward = () => {
        if (currentStep > -1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const togglePlayback = () => {
        if (simulationSteps.length === 0) {
            simulateString();
        }
        setIsPlaying(!isPlaying);
    };

    return (
        <div className="nfa-simulator-new">
            <div className="nfa-container">
                <div className="nfa-header">
                    <h1 className="nfa-title">NFA Simulator</h1>
                    <p className="nfa-subtitle">
                        Interactive Non-deterministic Finite Automaton with ε-transitions
                    </p>
                </div>

                <div className="nfa-example-selector">
                    <label className="nfa-selector-label">Quick Load Example:</label>
                    <select 
                        onChange={(e) => {
                            if (e.target.value) {
                                loadExample(e.target.value);
                            }
                        }}
                        value={currentExampleName || ''}
                        className="nfa-example-dropdown"
                    >
                        <option value="">-- Select an example --</option>
                        {Object.keys(examples).map(name => (
                            <option key={name} value={name}>
                                {examples[name].name}
                            </option>
                        ))}
                    </select>
                    {currentExampleName && (
                        <span className="nfa-current-example">
                            Current: {examples[currentExampleName]?.name || currentExampleName || 'Custom'}
                        </span>
                    )}
                </div>

                {/* Main Grid - Same layout as DFA */}
                <div className="nfa-grid">
                    {/* Left Column */}
                    <div className="nfa-left-col">
                        {/* Input Tester */}
                        <div className="nfa-input-card">
                            <h3 className="nfa-card-title">Test Input String</h3>
                            <div className="nfa-input-group">
                                <input
                                    type="text"
                                    value={inputString}
                                    onChange={(e) => setInputString(e.target.value)}
                                    placeholder="Enter input string (e.g., 010)"
                                    className="nfa-input"
                                />
                                <button 
                                    onClick={simulateString}
                                    className="nfa-btn nfa-btn-primary"
                                >
                                    Test
                                </button>
                            </div>
                            <p className="nfa-input-help">
                                Alphabet: {nfa.alphabet.join(', ')} (ε for epsilon)
                            </p>
                            {isComplete && (
                                <div className={`nfa-result-indicator ${isAccepted ? 'nfa-result-accepted' : 'nfa-result-rejected'}`}>
                                    {isAccepted ? '✓ ACCEPTED' : '✗ REJECTED'}
                                </div>
                            )}
                        </div>

                        {/* Control Panel */}
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

                        {/* Graph Visualization */}
                        <div className="nfa-graph-card">
                            <h3 className="nfa-card-title">State Diagram</h3>
                            <NFAGraph 
                                nfa={nfa} 
                                currentStates={currentStep >= 0 ? simulationSteps[currentStep]?.states || [] : []}
                                highlightTransition={currentStep >= 0 ? simulationSteps[currentStep]?.transition : null}
                            />
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="nfa-right-col">

                        {/* Alphabet Editor */}
                        <CollapsibleSection title="Alphabet" defaultOpen={false}>
                            <NFAAlphabetEditor nfa={nfa} onUpdate={resetSimulation} />
                        </CollapsibleSection>
                        
                        {/* States Editor */}
                        <CollapsibleSection title="States Editor" defaultOpen={false}>
                            <NFAStatesEditor nfa={nfa} onUpdate={resetSimulation} />
                        </CollapsibleSection>

                        {/* Transitions Editor */}
                        <CollapsibleSection title="Transitions Editor" defaultOpen={false}>
                            <NFATransitionsEditor nfa={nfa} onUpdate={resetSimulation} />
                        </CollapsibleSection>

                        {/* Test Cases */}
                        <CollapsibleSection title="Example Test Cases" defaultOpen={false}>
                            <NFATestCases 
                                nfa={nfa}
                                currentExample={currentExampleName}
                                onTestString={(testString) => {
                                    setInputString(testString);
                                    setSimulationSteps([]);
                                    setCurrentStep(-1);
                                    setIsPlaying(false);
                                }}
                            />
                        </CollapsibleSection>

                        {/* Simulation Progress */}
                        {simulationSteps.length > 0 && (
                            <div className="nfa-steps-card">
                                <h3 className="nfa-card-title">Simulation Progress</h3>
                                <div className="nfa-step-display">
                                    {currentStep >= 0 && currentStep < simulationSteps.length && (
                                        <>
                                            <div className="nfa-step-info">
                                                <strong>Step {currentStep + 1} of {simulationSteps.length}</strong>
                                            </div>
                                            <div className="nfa-step-state">
                                                Current States: <span className="nfa-highlight">{simulationSteps[currentStep].states.join(', ')}</span>
                                            </div>
                                            <div className="nfa-step-remaining">
                                                Remaining Input: <code>"{simulationSteps[currentStep].remainingInput}"</code>
                                            </div>
                                            <div className="nfa-step-desc">
                                                {simulationSteps[currentStep].description}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Transition Table */}
                        <div className="nfa-table-card">
                            <h3 className="nfa-card-title">Transition Table</h3>
                            <div className="nfa-table-wrapper">
                                <table className="nfa-table">
                                    <thead>
                                        <tr>
                                            <th>State</th>
                                            {nfa.alphabet.map(symbol => (
                                                <th key={symbol}>{symbol}</th>
                                            ))}
                                            <th>ε</th>
                                            <th>Accept?</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {nfa.states.map(state => {
                                            const isCurrentState = currentStep >= 0 && 
                                                simulationSteps[currentStep]?.states.includes(state);
                                            
                                            return (
                                                <tr 
                                                    key={state}
                                                    className={isCurrentState ? 'nfa-current-state' : ''}
                                                >
                                                    <td className="nfa-state-cell">{state}</td>
                                                    {nfa.alphabet.map(symbol => {
                                                        const transitions = nfa.transitions.filter(t => 
                                                            t.from === state && t.symbol === symbol
                                                        );
                                                        const toStates = transitions.map(t => t.to).join(', ');
                                                        
                                                        return (
                                                            <td key={`${state}-${symbol}`}>
                                                                {toStates || '—'}
                                                            </td>
                                                        );
                                                    })}
                                                    <td>
                                                        {(() => {
                                                            const epsilonTransitions = nfa.transitions.filter(t => 
                                                                t.from === state && (t.symbol === 'ε' || t.symbol === 'epsilon')
                                                            );
                                                            const toStates = epsilonTransitions.map(t => t.to).join(', ');
                                                            return toStates || '—';
                                                        })()}
                                                    </td>
                                                    <td>
                                                        {nfa.acceptStates.includes(state) ? '✓' : ''}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NFASimulator;