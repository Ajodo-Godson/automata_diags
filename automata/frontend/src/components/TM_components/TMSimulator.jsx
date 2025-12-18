import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { TapeVisualizer } from './TapeVisualizer';
import { ControlPanel } from './ControlPanel';
import { ProgramEditor } from './ProgramEditor';
import { ExampleTestCases } from './ExampleTestCases';
import { useExamples } from './examples';
import { validateTMChallenge } from '../Tutorial_components/ChallengeValidator';
import { CheckCircle, XCircle, Target } from 'lucide-react';
import './stylings/TMSimulator.css';

export default function TMSimulator({ challenge }) {
  const { examples } = useExamples();
  const [currentExampleName, setCurrentExampleName] = useState(challenge ? null : 'Binary Incrementer');
  const [currentExampleDescription, setCurrentExampleDescription] = useState(null);
  const [validationResults, setValidationResults] = useState(null);
  
  // Memoize initial setup
  const initialData = useMemo(() => {
    const rules = challenge ? [] : examples["Binary Incrementer"].rules;
    const tape = challenge ? ['□', '□', '□', '□', '□', '□'] : ['1', '0', '1', '□', '□', '□'];
    const input = challenge ? '' : '101';
    return { rules, tape, input };
  }, [challenge, examples]);
  
  const [rules, setRules] = useState(initialData.rules);
  const [machineState, setMachineState] = useState({
    tape: initialData.tape,
    headPosition: 0,
    currentState: 'q0',
    stepCount: 0,
    isRunning: false,
    isHalted: false
  });

  const [speed, setSpeed] = useState(500);
  const [activeRuleId, setActiveRuleId] = useState(null);
  const [initialInput, setInitialInput] = useState(initialData.input);
  const [acceptState, setAcceptState] = useState('qaccept');
  const [rejectState, setRejectState] = useState('qreject');
  const [blankSymbol, setBlankSymbol] = useState('□');
  const [startState, setStartState] = useState('q0');

  // Maximum steps before timeout
  const MAX_STEPS = 5000; // Lowered safety cutoff

  const handleReset = useCallback(() => {
    const newTape = initialInput.split('');
    const normalizedTape = newTape.map(cell => (cell === undefined || cell === '') ? blankSymbol : cell);
    while (normalizedTape.length < 7) {
      normalizedTape.push(blankSymbol);
    }

    setMachineState({
      tape: normalizedTape,
      headPosition: 0,
      currentState: startState,
      stepCount: 0,
      isRunning: false,
      isHalted: false,
      haltReason: undefined
    });
    setActiveRuleId(null);
  }, [initialInput, blankSymbol, startState]);

  // Event listeners for toolbox actions
  useEffect(() => {
    const handleExport = () => {
      const tmDefinition = {
        name: currentExampleName || 'Custom TM',
        description: currentExampleDescription || 'Exported TM definition',
        rules: rules,
        acceptState: acceptState,
        rejectState: rejectState,
        blankSymbol: blankSymbol,
        startState: startState,
        initialInput: initialInput
      };
      const dataStr = JSON.stringify(tmDefinition, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', 'tm_definition.json');
      linkElement.click();
    };

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
              const tmDefinition = JSON.parse(e.target.result);
              if (tmDefinition.rules) setRules(tmDefinition.rules);
              if (tmDefinition.acceptState) setAcceptState(tmDefinition.acceptState);
              if (tmDefinition.rejectState) setRejectState(tmDefinition.rejectState);
              if (tmDefinition.blankSymbol) setBlankSymbol(tmDefinition.blankSymbol);
              if (tmDefinition.startState) setStartState(tmDefinition.startState);
              if (tmDefinition.initialInput) setInitialInput(tmDefinition.initialInput);
              setCurrentExampleName(tmDefinition.name || 'Imported TM');
              setCurrentExampleDescription(tmDefinition.description || null);
              handleReset();
            } catch (error) {
              alert('Invalid JSON file or TM definition format');
            }
          };
          reader.readAsText(file);
        }
      };
      input.click();
    };

    const handleClearAll = () => {
      if (window.confirm('Are you sure you want to clear all and start fresh?')) {
        setRules([]);
        setAcceptState('qaccept');
        setRejectState('qreject');
        setBlankSymbol('□');
        setStartState('q0');
        setInitialInput('');
        setCurrentExampleName(null);
        setCurrentExampleDescription(null);
        setMachineState({
          tape: ['□', '□', '□', '□', '□', '□'],
          headPosition: 0,
          currentState: 'q0',
          stepCount: 0,
          isRunning: false,
          isHalted: false,
          haltReason: undefined
        });
        setActiveRuleId(null);
        setValidationResults(null);
      }
    };

    window.addEventListener('export', handleExport);
    window.addEventListener('import', handleImport);
    window.addEventListener('clearAll', handleClearAll);

    return () => {
      window.removeEventListener('export', handleExport);
      window.removeEventListener('import', handleImport);
      window.removeEventListener('clearAll', handleClearAll);
    };
  }, [rules, acceptState, rejectState, blankSymbol, initialInput, startState, currentExampleName, currentExampleDescription, handleReset]);

  // Reset to blank when challenge mode is activated
  useEffect(() => {
    if (challenge) {
      setRules([]);
      setMachineState({
        tape: ['□', '□', '□', '□', '□', '□'],
        headPosition: 0,
        currentState: 'q0',
        stepCount: 0,
        isRunning: false,
        isHalted: false
      });
      setInitialInput('');
      setValidationResults(null);
    }
  }, [challenge]);

  const executeStep = useCallback(() => {
    setMachineState(prev => {
      if (prev.stepCount >= MAX_STEPS) {
        setActiveRuleId(null);
        return { ...prev, isRunning: false, isHalted: true, haltReason: 'reject' };
      }

      const tape = [...prev.tape];
      const head = prev.headPosition;
      const currentSymbol = tape[head] === undefined || tape[head] === '' ? blankSymbol : tape[head];

      const matchingRule = rules.find(
        r => r.currentState === prev.currentState && r.readSymbol === currentSymbol
      );

      if (!matchingRule) {
        const haltReason = prev.currentState === acceptState ? 'accept' : 'reject';
        setActiveRuleId(null);
        return { ...prev, isRunning: false, isHalted: true, haltReason };
      }

      setActiveRuleId(matchingRule.id);
      tape[head] = matchingRule.writeSymbol;
      let newHead = head + (matchingRule.moveDirection === 'R' ? 1 : -1);

      if (newHead < 0) {
        tape.unshift(blankSymbol);
        newHead = 0;
      }
      if (newHead >= tape.length) tape.push(blankSymbol);

      const newState = matchingRule.newState;
      const isAccept = newState === acceptState;
      const isReject = newState === rejectState;
      const halted = isAccept || isReject;

      return {
        ...prev,
        tape,
        headPosition: newHead,
        currentState: newState,
        stepCount: prev.stepCount + 1,
        isRunning: !halted,
        isHalted: halted,
        haltReason: isAccept ? 'accept' : isReject ? 'reject' : undefined
      };
    });
  }, [rules, acceptState, rejectState, blankSymbol]);

  // Simulation timer
  useEffect(() => {
    if (!machineState.isRunning || machineState.isHalted) return;
    const timer = setTimeout(executeStep, speed);
    return () => clearTimeout(timer);
  }, [machineState.isRunning, machineState.isHalted, machineState.stepCount, speed, executeStep]);

  const handleRun = () => {
    if (machineState.isHalted) handleReset();
    setMachineState(prev => ({ ...prev, isRunning: true }));
  };

  const handlePause = () => {
    setMachineState(prev => ({ ...prev, isRunning: false }));
  };

  const handleStep = () => {
    if (machineState.isHalted || machineState.isRunning) return;
    executeStep();
  };

  const handleInitialInputChange = (input) => {
    setInitialInput(input);
    const newTape = input.split('');
    const normalizedTape = newTape.map(cell => (cell === undefined || cell === '') ? blankSymbol : cell);
    while (normalizedTape.length < 7) normalizedTape.push(blankSymbol);
    setMachineState(prev => ({
      ...prev,
      tape: normalizedTape,
      headPosition: 0,
      currentState: startState,
      stepCount: 0,
      isRunning: false,
      isHalted: false
    }));
    setActiveRuleId(null);
  };

  const handleLoadExample = (input) => {
    setInitialInput(input);
    const newTape = input.split('');
    const normalizedTape = newTape.map(cell => (cell === undefined || cell === '') ? blankSymbol : cell);
    while (normalizedTape.length < 7) normalizedTape.push(blankSymbol);
    setMachineState(prev => ({
      ...prev,
      tape: normalizedTape,
      headPosition: 0,
      currentState: startState,
      stepCount: 0,
      isRunning: false,
      isHalted: false
    }));
    setActiveRuleId(null);
  };

  const loadPresetExample = (exampleName) => {
    const example = examples[exampleName];
    if (!example) return;

    setCurrentExampleName(exampleName);
    setCurrentExampleDescription(example?.description || null);
    setRules(example.rules);
    setAcceptState(example.acceptState);
    setRejectState(example.rejectState);
    setBlankSymbol(example.blankSymbol);
    setStartState(example.startState);
    
    const defaultInput = exampleName === 'Test: Write 3 ones' ? '' :
                        exampleName === 'Binary Incrementer' ? '101' :
                        exampleName === 'Palindrome Checker' ? '101' :
                        exampleName === '0^n 1^n' ? '0011' :
                        exampleName === 'Busy Beaver (3-state)' ? '' :
                        exampleName === 'Copy Machine' ? '101' :
                        exampleName === 'Unary Addition' ? '111+11' :
                        exampleName === 'Unary Doubling' ? '111' :
                        exampleName === 'String Reversal' ? 'abc' :
                        exampleName === 'Unary Multiplication' ? '11*111' :
                        '';
    
    setInitialInput(defaultInput);
    const newTape = defaultInput.split('');
    const normalizedTape = newTape.map(cell => (cell === undefined || cell === '') ? example.blankSymbol : cell);
    while (normalizedTape.length < 7) normalizedTape.push(example.blankSymbol);

    setMachineState({
      tape: normalizedTape,
      headPosition: 0,
      currentState: example.startState,
      stepCount: 0,
      isRunning: false,
      isHalted: false,
      haltReason: undefined
    });
    setActiveRuleId(null);
  };

  const handleValidateChallenge = () => {
    if (!challenge || !challenge.challenge || !challenge.challenge.testCases) {
      alert('No challenge data available');
      return;
    }
    const userTM = { rules, startState: 'q0', acceptState, rejectState, blankSymbol };
    const results = validateTMChallenge(userTM, challenge.challenge.testCases);
    setValidationResults(results);
    if (window.opener && challenge.returnTo === 'tutorial') {
      window.opener.postMessage({ type: 'CHALLENGE_RESULT', results: results }, window.location.origin);
    }
  };

  return (
    <div className="tm-simulator">
      <div className="tm-container">
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
          <div className="tm-header">
            <h1 className="tm-title">Turing Machine Simulator</h1>
            <p className="tm-subtitle">Visualize and understand how a Turing machine operates step-by-step</p>
          </div>
        )}

        {!challenge && (
          <div className="example-selector">
            <label className="selector-label">Load Example:</label>
            <div className="selector-buttons">
              {Object.entries(examples).map(([key, example]) => (
                <button key={key} onClick={() => loadPresetExample(key)} className={`selector-btn ${currentExampleName === key ? 'active' : ''}`} title={example.description || example.name || key}>
                  {example.name || key}
                </button>
              ))}
            </div>
            {currentExampleDescription && (
              <div className="tm-example-description"><strong>Description:</strong> {currentExampleDescription}</div>
            )}
          </div>
        )}

        <div className="tm-grid">
          <div className="tm-left-col">
            <TapeVisualizer tape={machineState.tape} headPosition={machineState.headPosition} currentState={machineState.currentState} initialInput={initialInput} onInitialInputChange={handleInitialInputChange} isHalted={machineState.isHalted} haltReason={machineState.haltReason} />
            <ControlPanel currentState={machineState.currentState} stepCount={machineState.stepCount} isRunning={machineState.isRunning} isHalted={machineState.isHalted} haltReason={machineState.haltReason} speed={speed} onRun={handleRun} onPause={handlePause} onStep={handleStep} onReset={handleReset} onSpeedChange={setSpeed} />
            {!challenge && <ExampleTestCases onLoadExample={handleLoadExample} currentExample={currentExampleName} />}
          </div>
          <div className="tm-right-col">
            <ProgramEditor rules={rules} activeRuleId={activeRuleId} onRulesChange={setRules} />
          </div>
        </div>
      </div>
    </div>
  );
}
