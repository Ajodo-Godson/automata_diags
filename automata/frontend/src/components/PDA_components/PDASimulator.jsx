import React, { useState, useEffect, useCallback } from 'react';
import './stylings/PDASimulator.css';
import { PDAControlPanel } from './PDAControlPanel';
import { PDATestCases } from './PDATestCases';
import { PDAStatesEditor } from './StatesEditor';
import { PDATransitionsEditor } from './TransitionsEditor';
import { PDAAlphabetEditor } from './AlphabetEditor';
import { CollapsibleSection } from '../shared/CollapsibleSection';
import { useExamples } from './examples';
import { usePDA } from './usePDA';

const PDASimulator = () => {
    const { examples } = useExamples();
    const [currentExampleName, setCurrentExampleName] = useState(null);

    // Start with a blank PDA
    const pda = usePDA({
        states: ['q0'],
        alphabet: ['0', '1'],
        stackAlphabet: ['Z', 'X'],
        transitions: [],
        startState: 'q0',
        startStackSymbol: 'Z',
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
        let currentState = pda.startState;
        let stack = [pda.startStackSymbol];
        let inputPosition = 0;

        while (inputPosition <= inputString.length) {
            const inputSymbol = inputPosition < inputString.length ? inputString[inputPosition] : 'ε';
            const topOfStack = stack[stack.length - 1];

            // Find applicable transition
            let applicableTransition = null;
            for (const t of pda.transitions) {
                if (t.from === currentState && t.input === inputSymbol && t.pop === topOfStack) {
                    applicableTransition = t;
                    break;
                }
            }

            if (!applicableTransition) {
                // No transition found
                const accepted = pda.acceptStates.has(currentState) && stack.length === 1 && stack[0] === pda.startStackSymbol;
                steps[steps.length - 1].accepted = accepted;
                steps[steps.length - 1].description += ` → ${accepted ? 'ACCEPTED' : 'REJECTED'}`;
                break;
            }

            // Apply transition
            const newState = applicableTransition.to;
            const newStack = [...stack];
            newStack.pop(); // Pop symbol

            // Push symbols (in reverse order since stack is LIFO)
            if (applicableTransition.push !== 'ε') {
                const pushSymbols = applicableTransition.push.split('').reverse();
                newStack.push(...pushSymbols);
            }

            const newInputPosition = inputSymbol !== 'ε' ? inputPosition + 1 : inputPosition;

            steps.push({
                state: newState,
                stack: [...newStack],
                remainingInput: inputString.slice(newInputPosition),
                inputPosition: newInputPosition,
                description: `Read '${inputSymbol}', popped '${topOfStack}', pushed '${applicableTransition.push}', moved to ${newState}`,
                transition: applicableTransition,
                accepted: false
            });

            currentState = newState;
            stack = newStack;
            inputPosition = newInputPosition;

            // Check for acceptance by empty stack and final state
            if (inputPosition >= inputString.length && pda.acceptStates.has(currentState)) {
                steps[steps.length - 1].accepted = true;
                steps[steps.length - 1].description += ' → ACCEPTED';
                break;
            }
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
        setCurrentExampleName(exampleName);
        pda.loadPDA(example);
        setInputString('');
        handleReset();
    }, [examples, pda, setCurrentExampleName, setInputString, handleReset]);

    const handleLoadTest = (testInput) => {
        setInputString(testInput);
        handleReset();
    };

    // Event listeners for toolbox actions
    useEffect(() => {
        const handleExport = () => {
            const pdaDefinition = {
                name: currentExampleName || 'Custom PDA',
                description: 'Exported PDA definition',
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
            
            const exportFileDefaultName = 'pda_definition.json';
            
            const linkElement = document.createElement('a');
            linkElement.setAttribute('href', dataUri);
            linkElement.setAttribute('download', exportFileDefaultName);
            linkElement.click();
        };

        const handleAddState = () => {
            const stateName = prompt('Enter new state name (e.g., q1, q2):');
            if (stateName && stateName.trim()) {
                pda.addState(stateName.trim());
                handleReset();
            }
        };

        const handleAddTransition = () => {
            const from = prompt(`Enter source state:\nAvailable states: ${pda.states.join(', ')}`);
            if (!from || !pda.states.includes(from.trim())) {
                if (from) alert(`State "${from}" does not exist`);
                return;
            }
            
            const input = prompt(`Enter input symbol (or ε for epsilon):\nAlphabet: ${pda.alphabet.join(', ')}, ε`);
            if (!input) return;
            
            const pop = prompt(`Enter symbol to pop from stack:\nStack alphabet: ${pda.stackAlphabet.join(', ')}`);
            if (!pop) return;
            
            const to = prompt(`Enter destination state:\nAvailable states: ${pda.states.join(', ')}`);
            if (!to || !pda.states.includes(to.trim())) {
                if (to) alert(`State "${to}" does not exist`);
                return;
            }
            
            const push = prompt(`Enter symbol(s) to push onto stack (or ε for nothing):\nStack alphabet: ${pda.stackAlphabet.join(', ')}, ε`);
            if (!push) return;
            
            pda.addTransition(from.trim(), to.trim(), input.trim(), pop.trim(), push.trim());
            handleReset();
        };

        const handleDeleteState = () => {
            const stateName = prompt(`Enter state to delete:\nAvailable states: ${pda.states.join(', ')}`);
            if (stateName && pda.states.includes(stateName.trim())) {
                if (pda.states.length <= 1) {
                    alert('Cannot delete the only state');
                    return;
                }
                pda.removeState(stateName.trim());
                handleReset();
            } else if (stateName) {
                alert(`State "${stateName}" does not exist`);
            }
        };

        const handleSetStartState = () => {
            const newStartState = prompt(`Enter the state to set as start state:\nAvailable states: ${pda.states.join(', ')}`);
            if (newStartState && pda.states.includes(newStartState.trim())) {
                pda.setStart(newStartState.trim());
                handleReset();
            } else if (newStartState) {
                alert(`State "${newStartState}" does not exist`);
            }
        };

        const handleToggleAccept = () => {
            const stateName = prompt(`Enter state to toggle accept status:\nAvailable states: ${pda.states.join(', ')}\nCurrent accept states: ${Array.from(pda.acceptStates).join(', ') || 'none'}`);
            if (stateName && pda.states.includes(stateName.trim())) {
                pda.toggleAcceptState(stateName.trim());
                handleReset();
            } else if (stateName) {
                alert(`State "${stateName}" does not exist`);
            }
        };

        const handleClearAll = () => {
            // Create a blank PDA
            if (window.confirm('Are you sure you want to clear all and start fresh?')) {
                pda.loadPDA({
                    states: ['q0'],
                    alphabet: ['0', '1'],
                    stackAlphabet: ['Z', 'X'],
                    transitions: [],
                    startState: 'q0',
                    startStackSymbol: 'Z',
                    acceptStates: []
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
    }, [pda, currentExampleName, handleReset]);

    return (
        <div className="pda-simulator-new">
            <div className="pda-container">
                {/* Header */}
                <div className="pda-header">
                    <h1 className="pda-title">PDA Simulator</h1>
                    <p className="pda-subtitle">
                        Pushdown Automaton - Step-by-step visualization with stack operations
                    </p>
                </div>

                {/* Example Selector - Dropdown */}
                <div className="pda-example-selector">
                    <label className="pda-selector-label">Quick Load Example:</label>
                    <select 
                        onChange={(e) => {
                            if (e.target.value) {
                                loadExample(e.target.value);
                            }
                        }}
                        value={currentExampleName || ''}
                        className="pda-example-dropdown"
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
                <div className="pda-grid">
                    {/* Left Column */}
                    <div className="pda-left-col">
                        {/* Stack Visualization */}
                        <div className="pda-stack-card">
                            <h3 className="pda-card-title">Stack Visualization</h3>
                            <div className="pda-stack-container">
                                {simulationSteps.length > 0 && currentStep >= 0 ? (
                                    <div className="pda-stack">
                                        {simulationSteps[currentStep].stack.length === 0 ? (
                                            <div className="pda-stack-empty">Stack is empty</div>
                                        ) : (
                                            simulationSteps[currentStep].stack.map((symbol, index) => (
                                                <div
                                                    key={index}
                                                    className={`pda-stack-item ${
                                                        index === simulationSteps[currentStep].stack.length - 1
                                                            ? 'pda-stack-top'
                                                            : ''
                                                    }`}
                                                >
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

                        {/* Input String Visualization */}
                        <div className="pda-input-card">
                            <h3 className="pda-card-title">Input String</h3>
                            <div className="pda-input-group">
                                <input
                                    type="text"
                                    value={inputString}
                                    onChange={(e) => setInputString(e.target.value)}
                                    placeholder="Enter input string (e.g., (())"
                                    className="pda-input"
                                />
                                <button
                                    onClick={simulateString}
                                    className="pda-btn pda-btn-primary"
                                >
                                    Test
                                </button>
                            </div>
                            <p className="pda-input-help">
                                Alphabet: {pda.alphabet.join(', ')}
                            </p>
                            {isComplete && (
                                <div className={`pda-result-indicator ${isAccepted ? 'pda-result-accepted' : 'pda-result-rejected'}`}>
                                    {isAccepted ? '✓ ACCEPTED' : '✗ REJECTED'}
                                </div>
                            )}
                            {simulationSteps.length > 0 && currentStep >= 0 && (
                                <div className="pda-input-visualization">
                                    {inputString.split('').map((char, index) => (
                                        <span
                                            key={index}
                                            className={`pda-input-char ${
                                                index < simulationSteps[currentStep].inputPosition
                                                    ? 'pda-processed'
                                                    : index === simulationSteps[currentStep].inputPosition
                                                    ? 'pda-current'
                                                    : 'pda-remaining'
                                            }`}
                                        >
                                            {char}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Control Panel */}
                        <PDAControlPanel
                            currentState={simulationSteps.length > 0 && currentStep >= 0
                                ? simulationSteps[currentStep].state
                                : pda.startState}
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
                    <div className="pda-right-col">
                        {/* States Editor */}
                        <CollapsibleSection title="States Editor" defaultOpen={false}>
                            <PDAStatesEditor pda={pda} onUpdate={handleReset} />
                        </CollapsibleSection>

                        {/* Alphabet Editor */}
                        <CollapsibleSection title="Alphabets" defaultOpen={false}>
                            <PDAAlphabetEditor pda={pda} onUpdate={handleReset} />
                        </CollapsibleSection>

                        {/* Transitions Editor */}
                        <CollapsibleSection title="Transitions Editor" defaultOpen={false}>
                            <PDATransitionsEditor pda={pda} onUpdate={handleReset} />
                        </CollapsibleSection>

                        {/* Test Cases */}
                        <CollapsibleSection title="Example Test Cases" defaultOpen={false}>
                            <PDATestCases
                                onLoadTest={handleLoadTest}
                                currentExample={currentExampleName}
                            />
                        </CollapsibleSection>

                        {/* Simulation Steps */}
                        {simulationSteps.length > 0 && (
                            <div className="pda-steps-card">
                                <h3 className="pda-card-title">Simulation Progress</h3>
                                <div className="pda-step-display">
                                    {currentStep >= 0 && currentStep < simulationSteps.length && (
                                        <>
                                            <div className="pda-step-info">
                                                <strong>Step {currentStep + 1} of {simulationSteps.length}</strong>
                                            </div>
                                            <div className="pda-step-state">
                                                Current State: <span className="pda-highlight">{simulationSteps[currentStep].state}</span>
                                            </div>
                                            <div className="pda-step-stack">
                                                Stack: [{simulationSteps[currentStep].stack.join(', ')}]
                                            </div>
                                            <div className="pda-step-remaining">
                                                Remaining Input: <code>"{simulationSteps[currentStep].remainingInput}"</code>
                                            </div>
                                            <div className="pda-step-desc">
                                                {simulationSteps[currentStep].description}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Transition Table */}
                        <div className="pda-table-card">
                            <h3 className="pda-card-title">Transition Table</h3>
                            <div className="pda-table-wrapper">
                                <table className="pda-table">
                                    <thead>
                                        <tr>
                                            <th>From</th>
                                            <th>Input</th>
                                            <th>Pop</th>
                                            <th>To</th>
                                            <th>Push</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pda.transitions.map((transition, index) => {
                                            const isCurrentTransition = simulationSteps.length > 0 &&
                                                currentStep >= 0 &&
                                                simulationSteps[currentStep].transition === transition;

                                            return (
                                                <tr
                                                    key={index}
                                                    className={isCurrentTransition ? 'pda-current-transition' : ''}
                                                >
                                                    <td className="pda-state-cell">{transition.from}</td>
                                                    <td>{transition.input}</td>
                                                    <td>{transition.pop}</td>
                                                    <td className="pda-state-cell">{transition.to}</td>
                                                    <td>{transition.push}</td>
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

export default PDASimulator;