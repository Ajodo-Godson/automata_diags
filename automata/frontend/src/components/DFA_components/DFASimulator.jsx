import React, { useState, useEffect, useCallback } from 'react';
import './stylings/DFASimulator.css';
import DFAGraph from './DFAGraph';
import { DFAControlPanel } from './DFAControlPanel';
import { DFATestCases } from './DFATestCases';
import { TransitionsEditor } from './TransitionsEditor';
import { StatesEditor } from './StatesEditor';
import { useExamples } from './examples';
import { useDFA } from './useDFA';

const DFASimulatorNew = () => {
    const { examples } = useExamples();
    const [currentExampleName, setCurrentExampleName] = useState(null);
    
    // Start with a blank DFA
    const dfa = useDFA({
        states: ['q0'],
        alphabet: ['0', '1'],
        transitions: {},
        startState: 'q0',
        acceptStates: new Set(),
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
                alert(`Invalid symbol: ${symbol}`);
                return;
            }

            if (!dfa.hasTransition(currentState, symbol)) {
                alert(`No transition defined from state ${currentState} with symbol ${symbol}`);
                return;
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
        steps[steps.length - 1].accepted = accepted;
        steps[steps.length - 1].description += ` → ${accepted ? 'ACCEPTED' : 'REJECTED'}`;

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
        setCurrentExampleName(exampleName);
        dfa.loadDFA(example);
        setInputString('');
        handleReset();
    }, [examples, dfa, setCurrentExampleName, setInputString, handleReset]);

    const handleLoadTest = (testInput) => {
        setInputString(testInput);
        handleReset();
    };

    // Event listeners for toolbox actions
    useEffect(() => {
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
            
            const exportFileDefaultName = 'dfa_definition.json';
            
            const linkElement = document.createElement('a');
            linkElement.setAttribute('href', dataUri);
            linkElement.setAttribute('download', exportFileDefaultName);
            linkElement.click();
        };

        const handleAddState = () => {
            const stateName = prompt('Enter new state name (e.g., q1, q2):');
            if (stateName && stateName.trim()) {
                dfa.addState(stateName.trim());
                handleReset();
            }
        };

        const handleAddTransition = () => {
            const from = prompt(`Enter source state:\nAvailable states: ${dfa.states.join(', ')}`);
            if (!from || !dfa.states.includes(from.trim())) {
                if (from) alert(`State "${from}" does not exist`);
                return;
            }
            
            const symbol = prompt(`Enter input symbol:\nAlphabet: ${dfa.alphabet.join(', ')}`);
            if (!symbol || !dfa.alphabet.includes(symbol.trim())) {
                if (symbol) alert(`Symbol "${symbol}" is not in alphabet`);
                return;
            }
            
            const to = prompt(`Enter destination state:\nAvailable states: ${dfa.states.join(', ')}`);
            if (!to || !dfa.states.includes(to.trim())) {
                if (to) alert(`State "${to}" does not exist`);
                return;
            }
            
            dfa.updateTransition(from.trim(), symbol.trim(), to.trim());
            handleReset();
        };

        const handleDeleteState = () => {
            const stateName = prompt(`Enter state to delete:\nAvailable states: ${dfa.states.join(', ')}`);
            if (stateName && dfa.states.includes(stateName.trim())) {
                if (dfa.states.length <= 1) {
                    alert('Cannot delete the only state');
                    return;
                }
                dfa.deleteState(stateName.trim());
                handleReset();
            } else if (stateName) {
                alert(`State "${stateName}" does not exist`);
            }
        };

        const handleSetStartState = () => {
            const newStartState = prompt(`Enter the state to set as start state:\nAvailable states: ${dfa.states.join(', ')}`);
            if (newStartState && dfa.states.includes(newStartState.trim())) {
                dfa.loadDFA({
                    states: dfa.states,
                    alphabet: dfa.alphabet,
                    transitions: dfa.transitions,
                    startState: newStartState.trim(),
                    acceptStates: dfa.acceptStates
                });
                handleReset();
            } else if (newStartState) {
                alert(`State "${newStartState}" does not exist`);
            }
        };

        const handleToggleAccept = () => {
            const stateName = prompt(`Enter state to toggle accept status:\nAvailable states: ${dfa.states.join(', ')}\nCurrent accept states: ${Array.from(dfa.acceptStates).join(', ') || 'none'}`);
            if (stateName && dfa.states.includes(stateName.trim())) {
                dfa.toggleAcceptState(stateName.trim());
                handleReset();
            } else if (stateName) {
                alert(`State "${stateName}" does not exist`);
            }
        };

        const handleClearAll = () => {
            // Create a blank DFA
            if (window.confirm('Are you sure you want to clear all and start fresh?')) {
                dfa.loadDFA({
                    states: ['q0'],
                    alphabet: ['0', '1'],
                    transitions: {},
                    startState: 'q0',
                    acceptStates: new Set()
                });
                setCurrentExampleName(null);
                handleReset();
            }
        };

        window.addEventListener('export', handleExport);
        window.addEventListener('addState', handleAddState);
        window.addEventListener('addTransition', handleAddTransition);
        window.addEventListener('deleteState', handleDeleteState);
        window.addEventListener('setStartState', handleSetStartState);
        window.addEventListener('toggleAccept', handleToggleAccept);
        window.addEventListener('clearAll', handleClearAll);

        return () => {
            window.removeEventListener('export', handleExport);
            window.removeEventListener('addState', handleAddState);
            window.removeEventListener('addTransition', handleAddTransition);
            window.removeEventListener('deleteState', handleDeleteState);
            window.removeEventListener('setStartState', handleSetStartState);
            window.removeEventListener('toggleAccept', handleToggleAccept);
            window.removeEventListener('clearAll', handleClearAll);
        };
    }, [dfa, currentExampleName, handleReset]);

    return (
        <div className="dfa-simulator-new">
            <div className="dfa-container">
                {/* Header */}
                <div className="dfa-header">
                    <h1 className="dfa-title">DFA Simulator</h1>
                    <p className="dfa-subtitle">
                        Deterministic Finite Automaton - Step-by-step visualization
                    </p>
                </div>

                {/* Example Selector - Dropdown */}
                <div className="dfa-example-selector">
                    <label className="dfa-selector-label">Quick Load Example:</label>
                    <select 
                        onChange={(e) => {
                            if (e.target.value) {
                                loadExample(e.target.value);
                            }
                        }}
                        value={currentExampleName || ''}
                        className="dfa-example-dropdown"
                    >
                        <option value="">-- Select an example --</option>
                        {Object.entries(examples).map(([key, example]) => (
                            <option key={key} value={key}>
                                {example.name}
                            </option>
                        ))}
                    </select>
                    {currentExampleName && (
                        <span className="dfa-current-example">
                            Current: {examples[currentExampleName]?.name || 'Custom'}
                        </span>
                    )}
                </div>

                {/* Main Grid */}
                <div className="dfa-grid">
                    {/* Left Column */}
                    <div className="dfa-left-col">
                        {/* Graph Visualization */}
                        <div className="dfa-graph-card">
                            <h3 className="dfa-card-title">State Diagram</h3>
                            <DFAGraph
                                states={dfa.states}
                                transitions={dfa.transitions}
                                startState={dfa.startState}
                                acceptStates={dfa.acceptStates}
                                currentState={simulationSteps.length > 0 && currentStep >= 0 
                                    ? simulationSteps[currentStep].state 
                                    : null}
                                currentTransition={simulationSteps.length > 0 && currentStep >= 0 
                                    ? simulationSteps[currentStep].transition 
                                    : null}
                                isPlaying={isPlaying}
                            />
                        </div>

                        {/* Input Tester */}
                        <div className="dfa-input-card">
                            <h3 className="dfa-card-title">Test Input String</h3>
                            <div className="dfa-input-group">
                                <input
                                    type="text"
                                    value={inputString}
                                    onChange={(e) => setInputString(e.target.value)}
                                    placeholder="Enter input string (e.g., aab)"
                                    className="dfa-input"
                                />
                                <button 
                                    onClick={simulateString}
                                    className="dfa-btn dfa-btn-primary"
                                >
                                    Test
                                </button>
                            </div>
                            <p className="dfa-input-help">
                                Alphabet: {dfa.alphabet.join(', ')}
                            </p>
                        </div>

                        {/* Control Panel */}
                        <DFAControlPanel
                            currentState={simulationSteps.length > 0 && currentStep >= 0 
                                ? simulationSteps[currentStep].state 
                                : dfa.startState}
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
                    </div>

                    {/* Right Column */}
                    <div className="dfa-right-col">
                        {/* Test Cases */}
                        <DFATestCases 
                            onLoadTest={handleLoadTest}
                            currentExample={currentExampleName}
                        />

                        {/* Simulation Steps */}
                        {simulationSteps.length > 0 && (
                            <div className="dfa-steps-card">
                                <h3 className="dfa-card-title">Simulation Progress</h3>
                                <div className="dfa-step-display">
                                    {currentStep >= 0 && currentStep < simulationSteps.length && (
                                        <>
                                            <div className="dfa-step-info">
                                                <strong>Step {currentStep + 1} of {simulationSteps.length}</strong>
                                            </div>
                                            <div className="dfa-step-state">
                                                Current State: <span className="dfa-highlight">{simulationSteps[currentStep].state}</span>
                                            </div>
                                            <div className="dfa-step-remaining">
                                                Remaining Input: <code>"{simulationSteps[currentStep].remainingInput}"</code>
                                            </div>
                                            <div className="dfa-step-desc">
                                                {simulationSteps[currentStep].description}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Transition Table */}
                        <div className="dfa-table-card">
                            <h3 className="dfa-card-title">Transition Table</h3>
                            <div className="dfa-table-wrapper">
                                <table className="dfa-table">
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
                                        {dfa.states.map(state => {
                                            // Get the current step data
                                            const currentStepData = currentStep >= 0 && currentStep < simulationSteps.length 
                                                ? simulationSteps[currentStep] 
                                                : null;
                                            
                                            // Current state (where we are now)
                                            const isCurrentState = currentStepData && currentStepData.state === state;
                                            
                                            // Get the transition that was taken to reach the current state
                                            const currentTransition = currentStepData?.transition;
                                            
                                            // Previous state (where we came from) - only if there was a transition
                                            const isPreviousState = currentTransition && currentTransition.from === state;
                                            
                                            return (
                                                <tr 
                                                    key={state}
                                                    className={
                                                        isCurrentState ? 'dfa-current-state' : 
                                                        isPreviousState ? 'dfa-previous-state' : ''
                                                    }
                                                >
                                                    <td className="dfa-state-cell">{state}</td>
                                                    {dfa.alphabet.map(symbol => {
                                                        // Highlight the transition cell that was just used
                                                        // This is the cell at [from_state][symbol] that led to current state
                                                        const isCurrentTransitionCell = currentTransition && 
                                                            currentTransition.from === state && 
                                                            currentTransition.symbol === symbol;
                                                        
                                                        return (
                                                            <td 
                                                                key={`${state}-${symbol}`}
                                                                className={isCurrentTransitionCell ? 'dfa-current-transition' : ''}
                                                                title={isCurrentTransitionCell ? `Just used: ${state} --${symbol}--> ${currentTransition.to}` : ''}
                                                            >
                                                                {dfa.hasTransition(state, symbol) 
                                                                    ? dfa.transitions[state][symbol]
                                                                    : '—'
                                                                }
                                                            </td>
                                                        );
                                                    })}
                                                    <td>
                                                        {dfa.acceptStates.has(state) ? '✓' : ''}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* New Transitions Editor */}
                        <TransitionsEditor dfa={dfa} onUpdate={handleReset} />

                        {/* New States Editor */}
                        <StatesEditor dfa={dfa} onUpdate={handleReset} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DFASimulatorNew;


