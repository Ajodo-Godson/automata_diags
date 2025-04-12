import React, { useState, useEffect } from 'react';
import './DFASimulator.css';
import DFAGraph from './DFAGraph';
import { useExamples } from './examples';
import { useDFA } from './useDFA';
// import { useSimulation } from './useSimulation'; // We can create this later

const DFASimulator = () => {
    const { examples } = useExamples();
    const dfa = useDFA({
        states: ['q0'],
        alphabet: ['a', 'b'],
        transitions: { q0: { a: 'q0', b: 'q0' } },
        startState: 'q0',
        acceptStates: new Set(),
    });

    const [inputString, setInputString] = useState('');
    const [result, setResult] = useState(null);
    const [simulationSteps, setSimulationSteps] = useState([]);
    const [currentStep, setCurrentStep] = useState(-1);
    const [isPlaying, setIsPlaying] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(1000); // milliseconds per step
    const [isEditingTransitions, setIsEditingTransitions] = useState(false);

    const loadExample = (exampleName) => {
        const example = examples[exampleName];
        dfa.loadDFA(example);
        setInputString('');
        setResult(null);
        setSimulationSteps([]);
        setCurrentStep(-1);
    };

    const simulateString = () => {
        // Reset simulation state first
        setSimulationSteps([]);
        setCurrentStep(-1);

        let steps = [];
        let currentState = dfa.startState;

        // First step shows the initial state
        steps.push({
            state: currentState,
            remainingInput: inputString,
            description: `Starting in state ${currentState}`,
            transition: null
        });

        // Process each symbol
        for (let i = 0; i < inputString.length; i++) {
            const symbol = inputString[i];
            if (!dfa.alphabet.includes(symbol)) {
                setResult({
                    accepted: false,
                    message: `Invalid symbol: ${symbol}`
                });
                return;
            }

            if (!dfa.hasTransition(currentState, symbol)) {
                setResult({
                    accepted: false,
                    message: `No transition defined from state ${currentState} with symbol ${symbol}`
                });
                return;
            }

            const fromState = currentState;
            const nextState = dfa.transitions[currentState][symbol];

            // Add step showing the transition
            steps.push({
                state: nextState,
                remainingInput: inputString.slice(i + 1),
                description: `Read '${symbol}', moved from ${fromState} to ${nextState}`,
                transition: {
                    from: fromState,
                    to: nextState,
                    symbol: symbol
                }
            });

            currentState = nextState;
        }

        const accepted = dfa.acceptStates.has(currentState);
        // Add final step
        steps.push({
            state: currentState,
            remainingInput: '',
            description: `Finished in state ${currentState}. String is ${accepted ? 'accepted' : 'rejected'}.`,
            transition: null
        });

        setSimulationSteps(steps);
        setCurrentStep(0);
        setResult({
            accepted,
            message: `String ${accepted ? 'accepted' : 'rejected'}`
        });
    };

    const nextStep = () => {
        if (currentStep < simulationSteps.length - 1) {
            console.log('Moving to next step:', {
                from: currentStep,
                to: currentStep + 1,
                state: simulationSteps[currentStep + 1].state
            });
            setCurrentStep(currentStep + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 0) {
            console.log('Moving to previous step:', {
                from: currentStep,
                to: currentStep - 1,
                state: simulationSteps[currentStep - 1].state
            });
            setCurrentStep(currentStep - 1);
        }
    };

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

    const playSimulation = () => {
        setIsPlaying(true);
    };

    const pauseSimulation = () => {
        setIsPlaying(false);
    };

    const restartSimulation = () => {
        setIsPlaying(false);
        setCurrentStep(0);
    };

    useEffect(() => {
        const handleAddState = () => dfa.addState();
        const handleAddSymbol = () => {
            const symbol = prompt('Enter new symbol:');
            if (symbol && symbol.trim()) {
                dfa.addSymbol(symbol.trim());
            }
        };
        const handleAddCustomState = () => {
            const newState = prompt('Enter state name (e.g., q0, q1):');
            if (newState && newState.trim()) {
                dfa.addState(newState.trim());
            }
        };
        const handleAddTransition = () => {
            setIsEditingTransitions(true);
            // Scroll to transition table
            document.querySelector('.transition-table').scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        };
        const handleClearAll = () => dfa.clearAll();
        const handleUndo = () => dfa.undo();
        const handleRedo = () => dfa.redo();

        window.addEventListener('addState', handleAddState);
        window.addEventListener('addSymbol', handleAddSymbol);
        window.addEventListener('addCustomState', handleAddCustomState);
        window.addEventListener('addTransition', handleAddTransition);
        window.addEventListener('clearAll', handleClearAll);
        window.addEventListener('undo', handleUndo);
        window.addEventListener('redo', handleRedo);

        return () => {
            window.removeEventListener('addState', handleAddState);
            window.removeEventListener('addSymbol', handleAddSymbol);
            window.removeEventListener('addCustomState', handleAddCustomState);
            window.removeEventListener('addTransition', handleAddTransition);
            window.removeEventListener('clearAll', handleClearAll);
            window.removeEventListener('undo', handleUndo);
            window.removeEventListener('redo', handleRedo);
        };
    }, [dfa]);

    return (
        <div className="dfa-simulator">
            <h2>DFA Simulator</h2>

            <div className="main-content">
                <div className="left-column">
                    <div className="dfa-graph">
                        <h3>DFA Visualization</h3>
                        <DFAGraph
                            states={dfa.states}
                            transitions={dfa.transitions}
                            startState={dfa.startState}
                            acceptStates={dfa.acceptStates}
                            currentState={simulationSteps.length > 0 && currentStep >= 0 ? simulationSteps[currentStep].state : null}
                            currentTransition={simulationSteps.length > 0 && currentStep >= 0 ? simulationSteps[currentStep].transition : null}
                            isPlaying={isPlaying}
                        />
                    </div>

                    <div className="string-tester">
                        <h3>Test String</h3>
                        <input
                            type="text"
                            value={inputString}
                            onChange={(e) => setInputString(e.target.value)}
                            placeholder="Enter string to test"
                        />
                        <button onClick={simulateString}>Test</button>
                        {result && (
                            <div className={`result ${result.accepted ? 'accepted' : 'rejected'}`}>
                                {result.message}
                            </div>
                        )}
                    </div>
                </div>

                <div className="right-column">
                    <div className="examples-panel">
                        <h3>Load Example</h3>
                        {Object.entries(examples).map(([name, example]) => (
                            <div key={name} className="example-item">
                                <button onClick={() => loadExample(name)}>{name}</button>
                                <span className="example-description">{example.description}</span>
                            </div>
                        ))}
                    </div>

                    <div className={`transition-table ${isEditingTransitions ? 'editing' : ''}`}>
                        <h3>Transition Table</h3>
                        <table>
                            <thead>
                                <tr>
                                    <th>State</th>
                                    {dfa.alphabet.map(symbol => (
                                        <th key={symbol}>{symbol}</th>
                                    ))}
                                    <th>Accept?</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dfa.states.map(state => (
                                    <tr key={state} className={
                                        currentStep >= 0 && simulationSteps[currentStep].state === state
                                            ? 'current-state'
                                            : ''
                                    }>
                                        <td>{state}</td>
                                        {dfa.alphabet.map(symbol => (
                                            <td key={`${state}-${symbol}`}>
                                                <select
                                                    value={dfa.hasTransition(state, symbol) ? dfa.transitions[state][symbol] : ''}
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        if (value === '') {
                                                            dfa.removeTransition(state, symbol);
                                                        } else {
                                                            dfa.updateTransition(state, symbol, value);
                                                        }
                                                    }}
                                                >
                                                    <option value="">None</option>
                                                    {dfa.states.map(s => (
                                                        <option key={s} value={s}>{s}</option>
                                                    ))}
                                                </select>
                                            </td>
                                        ))}
                                        <td>
                                            <input
                                                type="checkbox"
                                                checked={dfa.acceptStates.has(state)}
                                                onChange={() => dfa.toggleAcceptState(state)}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {simulationSteps.length > 0 && (
                        <div className="simulation-steps">
                            <h3>Simulation Steps</h3>
                            <div className="step-display">
                                {currentStep >= 0 && currentStep < simulationSteps.length && (
                                    <>
                                        <div>Step {currentStep + 1} of {simulationSteps.length}</div>
                                        <div>Current State: {simulationSteps[currentStep].state}</div>
                                        <div>Remaining Input: "{simulationSteps[currentStep].remainingInput}"</div>
                                        <div>{simulationSteps[currentStep].description}</div>
                                    </>
                                )}
                            </div>
                            <div className="simulation-controls">
                                <div className="playback-controls">
                                    <button
                                        onClick={restartSimulation}
                                        className="control-button"
                                    >
                                        <span role="img" aria-label="restart">⏮</span>
                                    </button>
                                    {isPlaying ? (
                                        <button
                                            onClick={pauseSimulation}
                                            className="control-button"
                                        >
                                            <span role="img" aria-label="pause">⏸</span>
                                        </button>
                                    ) : (
                                        <button
                                            onClick={playSimulation}
                                            className="control-button"
                                            disabled={currentStep >= simulationSteps.length - 1}
                                        >
                                            <span role="img" aria-label="play">▶️</span>
                                        </button>
                                    )}
                                    <button
                                        onClick={prevStep}
                                        disabled={currentStep <= 0}
                                        className="control-button"
                                    >
                                        <span role="img" aria-label="previous">⏪</span>
                                    </button>
                                    <button
                                        onClick={nextStep}
                                        disabled={currentStep >= simulationSteps.length - 1}
                                        className="control-button"
                                    >
                                        <span role="img" aria-label="next">⏩</span>
                                    </button>
                                </div>
                                <div className="speed-control">
                                    <label>Speed: </label>
                                    <select
                                        value={playbackSpeed}
                                        onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                                    >
                                        <option value={2000}>Slow</option>
                                        <option value={1000}>Normal</option>
                                        <option value={500}>Fast</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DFASimulator; 