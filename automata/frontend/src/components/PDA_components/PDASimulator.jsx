import React, { useState, useEffect, useCallback, useMemo } from 'react';
import '../shared/SimulatorShell.css';
import './stylings/PDASimulator.css';
import StateDiagram from '../shared/StateDiagram';
import Transport from '../shared/Transport';
import { PDATestCases } from './PDATestCases';
import { PDAStatesEditor } from './StatesEditor';
import { PDATransitionsEditor } from './TransitionsEditor';
import { PDAAlphabetEditor } from './AlphabetEditor';
import { CollapsibleSection } from '../shared/CollapsibleSection';
import { useExamples } from './examples';
import { usePDA } from './usePDA';
import { validatePDAChallenge } from '../Tutorial_components/ChallengeValidator';
import { CheckCircle, Target } from 'lucide-react';

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
    
        // Initial Path Construction
        const initialPath = [{
            state: pda.startState,
            stack: [pda.startStackSymbol],
            remainingInput: inputString,
            inputPosition: 0,
            description: `Start: state ${pda.startState}, stack [${pda.startStackSymbol}]`,
            transition: null,
            accepted: false
        }];
    
        // Queue for BFS
        const configurations = [{
            state: pda.startState,
            stack: [pda.startStackSymbol],
            inputPosition: 0,
            path: initialPath
        }];
    
        const visited = new Set();
        const maxIterations = 10000; // Increased limit
        let iterationCount = 0;
        
        // TRACKER: Keep track of the 'best' failure to show if we reject
        let longestRejectedPath = initialPath;
    
        while (configurations.length > 0 && iterationCount < maxIterations) {
            iterationCount++;
            const config = configurations.shift(); // Dequeue
            const { state, stack, inputPosition, path } = config;
    
            // Update "best attempt" if this path went further in the input
            if (path.length > longestRejectedPath.length || inputPosition > longestRejectedPath[longestRejectedPath.length-1].inputPosition) {
                longestRejectedPath = path;
            }
    
            // 1. Stack Depth Guard (prevent browser crash on infinite push loops)
            if (stack.length > inputString.length + 50) continue;
    
            // 2. Exact State Match for Visited Set
            // FIX: Removed .slice(-20) to ensure deep stacks are unique configurations
            const configKey = `${state}|${stack.join(',')}|${inputPosition}`;
            
            if (visited.has(configKey)) continue;
            visited.add(configKey);
    
            // 3. Acceptance Check
            // Standard Definition: Empty Input AND Final State
            if (inputPosition === inputString.length && pda.acceptStates.has(state)) {
                const successPath = [...path];
                successPath[successPath.length - 1].accepted = true;
                successPath[successPath.length - 1].description += ' → ACCEPTED';
                setSimulationSteps(successPath);
                setCurrentStep(0);
                return; // Stop searching immediately on first success
            }
    
            // 4. Find Transitions
            const topOfStack = stack.length > 0 ? stack[stack.length - 1] : 'ε';
            const currentInput = inputPosition < inputString.length ? inputString[inputPosition] : null;
    
            const applicableTransitions = pda.transitions.filter(t => {
                if (t.from !== state) return false;
                
                // Input Match: Specific char OR Epsilon
                const inputMatches = (t.input === currentInput) || (t.input === 'ε' || t.input === '');
                if (!inputMatches) return false;
    
                // Stack Match: Specific char OR Epsilon (Stack ignored if pop is ε)
                const popMatches = (t.pop === 'ε' || t.pop === '') || (t.pop === topOfStack);
                
                return popMatches;
            });
    
            // 5. Generate Next Configurations
            for (const transition of applicableTransitions) {
                const newState = transition.to;
                const newStack = [...stack];
    
                // POP logic
                if (transition.pop && transition.pop !== 'ε') {
                    newStack.pop(); 
                }
    
                // PUSH logic 
                // We reverse the string so the first char becomes the new Top of Stack
                if (transition.push && transition.push !== 'ε') {
                    const pushSymbols = transition.push.split('').reverse();
                    newStack.push(...pushSymbols);
                }
    
                const consumesInput = (transition.input && transition.input !== 'ε');
                const newInputPosition = consumesInput ? inputPosition + 1 : inputPosition;
                const remaining = inputString.slice(newInputPosition);
    
                const newPath = [...path, {
                    state: newState,
                    stack: [...newStack],
                    remainingInput: remaining === '' ? '(empty)' : remaining,
                    inputPosition: newInputPosition,
                    description: `Read '${transition.input || 'ε'}', popped '${transition.pop || 'ε'}', pushed '${transition.push || 'ε'}', -> ${newState}`,
                    transition: transition,
                    accepted: false
                }];
    
                configurations.push({
                    state: newState,
                    stack: newStack,
                    inputPosition: newInputPosition,
                    path: newPath
                });
            }
        }
    
        // If we exit the loop, no accepting path was found
        let finalPath = [...longestRejectedPath];
        const lastStep = finalPath[finalPath.length - 1];
        
        if (iterationCount >= maxIterations) {
            lastStep.description += ' (Simulation Halted: Too many steps)';
        } else {
            lastStep.description += ' → REJECTED (No valid transitions remaining)';
        }
        
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


    /* Flatten the PDA transition list for the shared diagram. Each edge is
     * labelled in the standard notation: input, pop → push. */
    const diagramTransitions = useMemo(
        () =>
            pda.transitions.map((t) => ({
                from: t.from,
                to: t.to,
                label: `${t.input || 'ε'}, ${t.pop || 'ε'} → ${t.push || 'ε'}`,
            })),
        [pda.transitions]
    );

    const step = currentStep >= 0 ? simulationSteps[currentStep] : null;
    const stack = step ? step.stack : [pda.startStackSymbol];
    const atEnd = isComplete;

    const activeTransition = step?.transition
        ? {
              from: step.transition.from,
              to: step.transition.to,
              label: `${step.transition.input || 'ε'}, ${step.transition.pop || 'ε'} → ${
                  step.transition.push || 'ε'
              }`,
          }
        : null;

    return (
        <div className="sim">
            <div>
                {challenge?.challenge && (
                    <div className="sim-challenge">
                        <Target size={16} aria-hidden="true" />
                        <span className="sim-challenge-text">
                            <strong>Challenge:</strong> {challenge.challenge.description}
                        </span>
                        {validationResults && (
                            <span
                                className={`verdict ${
                                    validationResults.passed === validationResults.total
                                        ? 'verdict-accept'
                                        : 'verdict-reject'
                                }`}
                            >
                                {validationResults.passed}/{validationResults.total} passing
                            </span>
                        )}
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={handleValidateChallenge}
                        >
                            <CheckCircle size={14} aria-hidden="true" />
                            Validate
                        </button>
                    </div>
                )}

                <div className="sim-toolbar">
                    <div className="sim-identity">
                        <h1 className="sim-title">Pushdown Automaton</h1>
                        <p className="sim-subtitle">
                            Input {'{'}
                            {pda.alphabet.join(', ')}
                            {'}'} · Stack {'{'}
                            {pda.stackAlphabet.join(', ')}
                            {'}'} · {pda.states.length} states
                        </p>
                    </div>

                    <div className="sim-run">
                        <label className="sr-only" htmlFor="pda-input">
                            Input string
                        </label>
                        <input
                            id="pda-input"
                            className="field"
                            value={inputString}
                            placeholder="Type a string, e.g. (())"
                            onChange={(e) => {
                                setInputString(e.target.value);
                                handleReset();
                            }}
                            onKeyDown={(e) => e.key === 'Enter' && simulateString()}
                        />
                        <button type="button" className="btn btn-primary" onClick={simulateString}>
                            Test
                        </button>
                    </div>

                    {isComplete && (
                        <div
                            className={`verdict ${
                                isAccepted ? 'verdict-accept' : 'verdict-reject'
                            } sim-verdict`}
                        >
                            {isAccepted ? 'Accepted' : 'Rejected'}
                            <span className="verdict-note">
                                {isAccepted
                                    ? 'Input consumed, stack resolved.'
                                    : 'No accepting computation exists.'}
                            </span>
                        </div>
                    )}
                </div>

                {!challenge && (
                    <div className="sim-examples">
                        <span className="eyebrow sim-examples-label">Examples</span>
                        <div className="sim-examples-list">
                            {Object.entries(examples).map(([key, example]) => (
                                <button
                                    key={key}
                                    type="button"
                                    className="chip"
                                    aria-pressed={currentExampleName === key}
                                    onClick={() => loadExample(key)}
                                >
                                    {example.name}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {!challenge && currentExampleDescription && (
                    <p className="sim-example-note">{currentExampleDescription}</p>
                )}
            </div>

            <div className="sim-body">
                <div className="sim-stage">
                    <div className="card sim-diagram-card">
                        <div className="card-header">
                            <h2 className="card-title">State diagram</h2>
                            {step && (
                                <span className="hint">
                                    Step {currentStep + 1} of {simulationSteps.length}
                                </span>
                            )}
                        </div>
                        <div className="card-body">
                            <StateDiagram
                                states={pda.states}
                                transitions={diagramTransitions}
                                startState={pda.startState}
                                acceptStates={pda.acceptStates}
                                currentState={step?.state}
                                activeTransition={activeTransition}
                                onDeleteState={pda.removeState}
                            />
                        </div>
                    </div>

                    <div className="card">
                        <Transport
                            isPlaying={isPlaying}
                            canPlay={!atEnd}
                            canStep={!atEnd}
                            onRun={() => {
                                if (simulationSteps.length === 0) simulateString();
                                setIsPlaying(true);
                            }}
                            onPause={() => setIsPlaying(false)}
                            onStep={() => {
                                if (simulationSteps.length === 0) simulateString();
                                else if (currentStep < simulationSteps.length - 1)
                                    setCurrentStep(currentStep + 1);
                            }}
                            onReset={handleReset}
                            speed={playbackSpeed}
                            onSpeedChange={setPlaybackSpeed}
                            readouts={[
                                { label: 'State', value: step?.state ?? pda.startState },
                                { label: 'Depth', value: stack.length },
                                {
                                    label: 'Step',
                                    value: `${Math.max(currentStep + 1, 0)}/${
                                        simulationSteps.length || 0
                                    }`,
                                },
                            ]}
                        />

                        {step && (
                            <div className="card-body" style={{ paddingTop: 0 }}>
                                <div className="stack">
                                    <div className="sim-tape-strip">
                                        {inputString.length === 0 ? (
                                            <span className="hint">ε (empty string)</span>
                                        ) : (
                                            [...inputString].map((symbol, i) => (
                                                <span
                                                    key={`${symbol}-${i}`}
                                                    className={`sim-symbol ${
                                                        i < step.inputPosition ? 'is-consumed' : ''
                                                    } ${i === step.inputPosition ? 'is-current' : ''}`}
                                                >
                                                    {symbol}
                                                </span>
                                            ))
                                        )}
                                    </div>
                                    <p className="sim-step-note">{step.description}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <aside className="sim-panel">
                    {/*
                      * The stack is what distinguishes a PDA from an NFA, so it
                      * leads the panel rather than hiding in an accordion.
                      */}
                    <section className="card">
                        <div className="card-header">
                            <h2 className="card-title">Stack</h2>
                            <span className="hint">top first</span>
                        </div>
                        <div className="card-body">
                            {stack.length === 0 ? (
                                <p className="empty">Stack is empty.</p>
                            ) : (
                                <ol className="pda-stack">
                                    {[...stack].reverse().map((symbol, i) => (
                                        <li
                                            key={`${symbol}-${stack.length - i}`}
                                            className={`pda-stack-cell ${i === 0 ? 'is-top' : ''}`}
                                        >
                                            <span className="pda-stack-symbol">{symbol}</span>
                                            {i === 0 && <span className="pda-stack-tag">top</span>}
                                        </li>
                                    ))}
                                </ol>
                            )}
                        </div>
                    </section>

                    <CollapsibleSection title="States" defaultOpen={!!challenge}>
                        <PDAStatesEditor pda={pda} onUpdate={handleReset} />
                    </CollapsibleSection>

                    <CollapsibleSection title="Alphabets" defaultOpen={false}>
                        <PDAAlphabetEditor pda={pda} onUpdate={handleReset} />
                    </CollapsibleSection>

                    <CollapsibleSection title="Transitions" defaultOpen>
                        <PDATransitionsEditor pda={pda} onUpdate={handleReset} />
                    </CollapsibleSection>

                    {!challenge && (
                        <CollapsibleSection title="Test cases" defaultOpen={false}>
                            <PDATestCases
                                onLoadTest={(t) => {
                                    setInputString(t);
                                    handleReset();
                                }}
                                currentExample={currentExampleName}
                            />
                        </CollapsibleSection>
                    )}
                </aside>
            </div>
        </div>
    );
};

export default PDASimulator;
