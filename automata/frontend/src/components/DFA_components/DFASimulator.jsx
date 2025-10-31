import React, { useState, useEffect, useCallback } from 'react';
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
                            const dfaDefinition = JSON.parse(e.target.result);
                            dfa.loadDFA({
                                states: dfaDefinition.states || [],
                                alphabet: dfaDefinition.alphabet || [],
                                transitions: dfaDefinition.transitions || {},
                                startState: dfaDefinition.startState || 'q0',
                                acceptStates: new Set(dfaDefinition.acceptStates || [])
                            });
                            setCurrentExampleName(dfaDefinition.name || 'Imported DFA');
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
            
            const exportFileDefaultName = 'dfa_definition.json';
            
            const linkElement = document.createElement('a');
            linkElement.setAttribute('href', dataUri);
            linkElement.setAttribute('download', exportFileDefaultName);
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
                handleReset();
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

                        {/* Input Tester - Compact */}
                        <div className="dfa-input-card-compact">
                            <h3 className="dfa-card-title-compact">Test Input String</h3>
                            <div className="dfa-input-group">
                                <input
                                    type="text"
                                    value={inputString}
                                    onChange={(e) => setInputString(e.target.value)}
                                    placeholder="e.g., aab"
                                    className="dfa-input"
                                />
                                <button 
                                    onClick={simulateString}
                                    className="dfa-btn dfa-btn-primary dfa-btn-compact"
                                >
                                    TEST
                                </button>
                            </div>
                            <p className="dfa-input-help-compact">
                                Alphabet: {dfa.alphabet.join(', ')}
                            </p>
                            {isComplete && (
                                <div className={`dfa-result-indicator ${isAccepted ? 'dfa-result-accepted' : 'dfa-result-rejected'}`}>
                                    {isAccepted ? '✓ ACCEPTED' : '✗ REJECTED'}
                                </div>
                            )}
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
                        {/* States Editor */}
                        <CollapsibleSection title="States Editor" defaultOpen={false}>
                            <StatesEditor dfa={dfa} onUpdate={handleReset} />
                        </CollapsibleSection>

                        {/* Alphabet Editor */}
                        <CollapsibleSection title="Alphabet" defaultOpen={false}>
                            <AlphabetEditor dfa={dfa} onUpdate={handleReset} />
                        </CollapsibleSection>

                        {/* Transitions Editor */}
                        <CollapsibleSection title="Transitions Editor" defaultOpen={false}>
                            <TransitionsEditor dfa={dfa} onUpdate={handleReset} />
                        </CollapsibleSection>

                        {/* Test Cases */}
                        <CollapsibleSection title="Example Test Cases" defaultOpen={false}>
                            <DFATestCases 
                                onLoadTest={handleLoadTest}
                                currentExample={currentExampleName}
                            />
                        </CollapsibleSection>

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

                        {/* Transition Table - Collapsible */}
                        <CollapsibleSection title="Transition Table" defaultOpen={!currentExampleName}>
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
                        </CollapsibleSection>

                        {/* New Transitions Editor - Collapsible */}
                        <CollapsibleSection title="Transitions" defaultOpen={!currentExampleName}>
                            <TransitionsEditor dfa={dfa} onUpdate={handleReset} />
                        </CollapsibleSection>

                        {/* New States Editor - Collapsible */}
                        <CollapsibleSection title="States" defaultOpen={!currentExampleName}>
                            <StatesEditor dfa={dfa} onUpdate={handleReset} />
                        </CollapsibleSection>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DFASimulatorNew;


