import React, { useState, useEffect } from 'react';
import './stylings/DFASimulator.css';
import DFAGraph from './DFAGraph';
import { DFAControlPanel } from './DFAControlPanel';
import { DFATestCases } from './DFATestCases';
import { useExamples } from './examples';
import { useDFA } from './useDFA';
import { validateDFAChallenge } from '../Tutorial_components/ChallengeValidator';
import { CheckCircle, XCircle, Target } from 'lucide-react';

const DFASimulatorNew = ({ challenge }) => {
    const { examples } = useExamples();
    const [currentExampleName, setCurrentExampleName] = useState('ends_with_ab');
    const [validationResults, setValidationResults] = useState(null);
    
    const dfa = useDFA({
        states: examples['ends_with_ab'].states,
        alphabet: examples['ends_with_ab'].alphabet,
        transitions: examples['ends_with_ab'].transitions,
        startState: examples['ends_with_ab'].startState,
        acceptStates: examples['ends_with_ab'].acceptStates,
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

    const handleReset = () => {
        setSimulationSteps([]);
        setCurrentStep(-1);
        setIsPlaying(false);
    };

    const loadExample = (exampleName) => {
        const example = examples[exampleName];
        setCurrentExampleName(exampleName);
        dfa.loadDFA(example);
        setInputString('');
        handleReset();
    };

    const handleLoadTest = (testInput) => {
        setInputString(testInput);
        handleReset();
    };

    const handleValidateChallenge = () => {
        if (!challenge || !challenge.challenge || !challenge.challenge.testCases) {
            alert('No challenge data available');
            return;
        }

        // Build DFA object for validation
        const userDFA = {
            states: dfa.states,
            alphabet: dfa.alphabet,
            transitions: dfa.transitions,
            startState: dfa.startState,
            acceptStates: dfa.acceptStates
        };

        // Validate against test cases
        const results = validateDFAChallenge(userDFA, challenge.challenge.testCases);
        setValidationResults(results);

        // Send results back to tutorial window (if opened from tutorial)
        if (window.opener && challenge.returnTo === 'tutorial') {
            window.opener.postMessage({
                type: 'CHALLENGE_RESULT',
                results: results
            }, window.location.origin);
        }
    };

    return (
        <div className="dfa-simulator-new">
            <div className="dfa-container">
                {/* Challenge Banner */}
                {challenge && challenge.challenge && (
                    <div className="challenge-banner">
                        <div className="challenge-banner-content">
                            <h2><Target size={28} /> Tutorial Challenge</h2>
                            <p><strong>Task:</strong> {challenge.challenge.description}</p>
                            <p><strong>Test Cases:</strong> {challenge.challenge.testCases.length} tests to pass</p>
                        </div>
                        <button 
                            className="validate-challenge-btn"
                            onClick={handleValidateChallenge}
                        >
                            <CheckCircle size={20} style={{ marginRight: '8px' }} />
                            Validate Challenge
                        </button>
                        {validationResults && (
                            <div className="validation-results">
                                <h3>
                                    {validationResults.passed === validationResults.total ? (
                                        <><CheckCircle size={24} /> All Tests Passed!</>
                                    ) : (
                                        <><XCircle size={24} /> Some Tests Failed</>
                                    )}
                                </h3>
                                <p>Passed: {validationResults.passed} / {validationResults.total} ({validationResults.percentage}%)</p>
                                <div className="test-results-list">
                                    {validationResults.results.map((result, idx) => (
                                        <div key={idx} className={`test-result ${result.passed ? 'pass' : 'fail'}`}>
                                            <span className="test-icon">
                                                {result.passed ? <CheckCircle size={16} /> : <XCircle size={16} />}
                                            </span>
                                            <span className="test-input">"{result.input || 'ε'}"</span>
                                            <span className="test-expected">
                                                Expected: {result.expected ? 'Accept' : 'Reject'}
                                            </span>
                                            <span className="test-actual">
                                                Got: {result.actual ? 'Accept' : 'Reject'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Header */}
                <div className="dfa-header">
                    <h1 className="dfa-title">DFA Simulator</h1>
                    <p className="dfa-subtitle">
                        Deterministic Finite Automaton - Step-by-step visualization
                    </p>
                </div>

                {/* Example Selector */}
                <div className="dfa-example-selector">
                    <label className="dfa-selector-label">Load Example:</label>
                    <div className="dfa-selector-buttons">
                        {Object.entries(examples).map(([key, example]) => (
                            <button
                                key={key}
                                onClick={() => loadExample(key)}
                                className={`dfa-selector-btn ${currentExampleName === key ? 'active' : ''}`}
                            >
                                {example.name}
                            </button>
                        ))}
                    </div>
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
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DFASimulatorNew;