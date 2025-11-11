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
        
        // Track individual computation paths with unique IDs and colors
        const pathColors = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#8b5cf6'];
        let activePaths = [{
            id: 0,
            state: nfa.startState,
            color: pathColors[0],
            history: [nfa.startState]
        }];

        // Add epsilon closure for start state
        const startClosure = getEpsilonClosure(new Set([nfa.startState]), nfa.transitions);
        
        // Expand paths for epsilon closure
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

        // Initial step
        steps.push({
            paths: activePaths.map(p => ({ ...p })),
            states: Array.from(new Set(activePaths.map(p => p.state))),
            remainingInput: inputString,
            description: `Starting in state(s): ${Array.from(new Set(activePaths.map(p => p.state))).join(', ')}`,
            activeTransitions: [],
            accepted: false
        });

        // Process each symbol
        for (let i = 0; i < inputString.length; i++) {
            const symbol = inputString[i];
            const newPaths = [];
            const activeTransitions = [];

            // For each active path, find all possible transitions
            activePaths.forEach(path => {
                const validTransitions = nfa.transitions.filter(t => 
                    t.from === path.state && t.symbol === symbol
                );
                
                if (validTransitions.length === 0) {
                    // Dead path - don't continue it
                    return;
                }
                
                validTransitions.forEach((trans, idx) => {
                    // Get epsilon closure for the target state
                    const closure = getEpsilonClosure(new Set([trans.to]), nfa.transitions);
                    
                    closure.forEach((closureState, closureIdx) => {
                        const pathId = newPaths.length;
                        const newPath = {
                            id: pathId,
                            state: closureState,
                            color: path.color, // Inherit color from parent path
                            history: [...path.history, closureState],
                            parentId: path.id
                        };
                        newPaths.push(newPath);
                        
                        // Record the transition for highlighting
                        activeTransitions.push({
                            from: trans.from,
                            to: trans.to,
                            symbol: symbol,
                            color: path.color,
                            pathId: pathId
                        });
                        
                        // Add epsilon transitions to highlighting if closure was used
                        if (closureState !== trans.to) {
                            activeTransitions.push({
                                from: trans.to,
                                to: closureState,
                                symbol: 'ε',
                                color: path.color,
                                pathId: pathId
                            });
                        }
                    });
                });
            });

            activePaths = newPaths;
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

        // Final acceptance check
        const finalAccepted = activePaths.some(path => 
            nfa.acceptStates.includes(path.state)
        );
        
        if (steps.length > 0) {
            steps[steps.length - 1].accepted = finalAccepted;
            steps[steps.length - 1].description += finalAccepted ? ' ✓ ACCEPTED' : ' ✗ REJECTED';
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
                                activeTransitions={currentStep >= 0 ? simulationSteps[currentStep]?.activeTransitions || [] : []}
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
                                                Active Paths: <span className="nfa-highlight">{simulationSteps[currentStep].paths?.length || 0}</span>
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
                                            
                                            {/* Show individual paths */}
                                            {simulationSteps[currentStep].paths && simulationSteps[currentStep].paths.length > 0 && (
                                                <div className="nfa-paths-list">
                                                    <div style={{fontSize: '0.75rem', fontWeight: '600', marginTop: '0.75rem', marginBottom: '0.5rem'}}>
                                                        Computation Paths:
                                                    </div>
                                                    {simulationSteps[currentStep].paths.map((path, idx) => (
                                                        <div key={idx} className="nfa-path-item" style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '0.5rem',
                                                            padding: '0.35rem 0.5rem',
                                                            margin: '0.25rem 0',
                                                            background: `${path.color}15`,
                                                            borderLeft: `3px solid ${path.color}`,
                                                            borderRadius: '4px',
                                                            fontSize: '0.7rem'
                                                        }}>
                                                            <div style={{
                                                                width: '12px',
                                                                height: '12px',
                                                                borderRadius: '50%',
                                                                background: path.color,
                                                                flexShrink: 0
                                                            }}></div>
                                                            <div style={{flex: 1}}>
                                                                Path {idx + 1}: {path.history.join(' → ')}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
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