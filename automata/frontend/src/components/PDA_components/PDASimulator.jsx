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
        let maxIterations = 1000; // Prevent infinite loops
        let iterationCount = 0;

        // Add initial step
        steps.push({
            state: currentState,
            stack: [...stack],
            remainingInput: inputString,
            inputPosition: 0,
            description: `Start: state ${currentState}, stack [${stack.join(', ')}]`,
            transition: null,
            accepted: false
        });

        while (inputPosition <= inputString.length && iterationCount < maxIterations) {
            iterationCount++;
            const topOfStack = stack[stack.length - 1];
            
            // Try regular input symbol first (if not at end)
            let applicableTransition = null;
            if (inputPosition < inputString.length) {
                const inputSymbol = inputString[inputPosition];
                for (const t of pda.transitions) {
                    if (t.from === currentState && t.input === inputSymbol && t.pop === topOfStack) {
                        applicableTransition = t;
                        break;
                    }
                }
            }

            // If no regular transition found, try epsilon transition
            if (!applicableTransition) {
                for (const t of pda.transitions) {
                    if (t.from === currentState && t.input === 'ε' && t.pop === topOfStack) {
                        applicableTransition = t;
                        break;
                    }
                }
            }

            if (!applicableTransition) {
                // No transition found - check if we can accept
                const stackIsEmpty = stack.length === 1 && stack[0] === pda.startStackSymbol;
                const accepted = inputPosition >= inputString.length && 
                                pda.acceptStates.has(currentState) && 
                                stackIsEmpty;
                
                if (steps.length > 0) {
                    steps[steps.length - 1].accepted = accepted;
                    steps[steps.length - 1].description += ` → ${accepted ? 'ACCEPTED' : 'REJECTED'}`;
                } else {
                    steps.push({
                        state: currentState,
                        stack: [...stack],
                        remainingInput: inputString.slice(inputPosition),
                        inputPosition: inputPosition,
                        description: `No transition available → ${accepted ? 'ACCEPTED' : 'REJECTED'}`,
                        transition: null,
                        accepted: accepted
                    });
                }
                break;
            }

            // Apply transition
            const inputSymbol = applicableTransition.input;
            const newState = applicableTransition.to;
            const newStack = [...stack];
            newStack.pop(); // Pop symbol

            // Push symbols (in reverse order since stack is LIFO)
            if (applicableTransition.push !== 'ε') {
                const pushSymbols = applicableTransition.push.split('').reverse();
                newStack.push(...pushSymbols);
            }

            const newInputPosition = inputSymbol !== 'ε' ? inputPosition + 1 : inputPosition;
            const stackIsEmpty = newStack.length === 1 && newStack[0] === pda.startStackSymbol;

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

            // Check for acceptance: must be at end of input, in accept state, and stack only has start symbol
            if (inputPosition >= inputString.length && 
                pda.acceptStates.has(currentState) && 
                stackIsEmpty) {
                steps[steps.length - 1].accepted = true;
                steps[steps.length - 1].description += ' → ACCEPTED';
                break;
            }
        }

        // If we exhausted iterations without accepting, mark as rejected
        if (iterationCount >= maxIterations && steps.length > 0) {
            steps[steps.length - 1].accepted = false;
            steps[steps.length - 1].description += ' → REJECTED (max iterations reached)';
        }

        // If we finished input but didn't accept, mark as rejected
        if (inputPosition >= inputString.length && steps.length > 0 && !steps[steps.length - 1].accepted) {
            const lastStep = steps[steps.length - 1];
            if (!lastStep.description.includes('REJECTED') && !lastStep.description.includes('ACCEPTED')) {
                lastStep.accepted = false;
                lastStep.description += ' → REJECTED';
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

        window.addEventListener('import', handleImport);
        window.addEventListener('export', handleExport);
        window.addEventListener('clearAll', handleClearAll);

        return () => {
            window.removeEventListener('import', handleImport);
            window.removeEventListener('export', handleExport);
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

                {/* Example Selector */}
                <div className="pda-example-selector">
                    <label className="pda-selector-label">Load Example:</label>
                    <div className="pda-selector-buttons">
                        {Object.entries(examples).map(([key, example]) => (
                            <button
                                key={key}
                                onClick={() => loadExample(key)}
                                className={`pda-selector-btn ${currentExampleName === key ? 'active' : ''}`}
                            >
                                {example.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Grid */}
                <div className="pda-grid">
                    {/* Left Column */}
                    <div className="pda-left-col">
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