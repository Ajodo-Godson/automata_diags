import React, { useState, useEffect, useCallback } from 'react';
import { TapeVisualizer } from './TapeVisualizer';
import { ControlPanel } from './ControlPanel';
import { ProgramEditor } from './ProgramEditor';
import { ExampleTestCases } from './ExampleTestCases';
import { CollapsibleSection } from '../shared/CollapsibleSection';
import { useExamples } from './examples';
import './stylings/TMSimulator.css';

export default function TMSimulator() {
  const { examples } = useExamples();
  const [currentExampleName, setCurrentExampleName] = useState(null);
  const [currentExampleDescription, setCurrentExampleDescription] = useState(null);
  
  // Start with a blank TM
  const [rules, setRules] = useState([]);
  const [machineState, setMachineState] = useState({
    tape: ['□', '□', '□', '□', '□', '□'],
    headPosition: 0,
    currentState: 'q0',
    stepCount: 0,
    isRunning: false,
    isHalted: false
  });

  const [speed, setSpeed] = useState(500);
  const [activeRuleId, setActiveRuleId] = useState(null);
  const [initialInput, setInitialInput] = useState('');
  const [acceptState, setAcceptState] = useState('qaccept');
  const [rejectState, setRejectState] = useState('qreject');
  const [blankSymbol, setBlankSymbol] = useState('□');
  const [startState, setStartState] = useState('q0');
  
  // Maximum steps before timeout (configurable)
  const MAX_STEPS = 10000;

  // Event listeners for toolbox actions
  useEffect(() => {
    const handleExport = () => {
      const tmDefinition = {
        name: 'Custom TM',
        description: 'Exported TM definition',
        rules: rules,
        acceptState: acceptState,
        rejectState: rejectState,
        blankSymbol: blankSymbol,
        startState: startState,
        initialInput: initialInput
      };
      
      const dataStr = JSON.stringify(tmDefinition, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = 'tm_definition.json';
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
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
            } catch (error) {
              alert('Invalid JSON file or TM definition format');
            }
          };
          reader.readAsText(file);
        }
      };
      input.click();
    };

    window.addEventListener('export', handleExport);
    window.addEventListener('import', handleImport);

    return () => {
      window.removeEventListener('export', handleExport);
      window.removeEventListener('import', handleImport);
    };
  }, [rules, acceptState, rejectState, blankSymbol, initialInput]);

  const executeStep = useCallback(() => {
    setMachineState(prev => {
      // Prevent runaway loops
      if (prev.stepCount >= MAX_STEPS) {
        setActiveRuleId(null);
        return { ...prev, isRunning: false, isHalted: true, haltReason: 'reject' };
      }

      const tape = [...prev.tape];
      const head = prev.headPosition;

      // Normalize blank - handle empty strings and undefined
      const currentSymbol = tape[head] === undefined || tape[head] === '' ? blankSymbol : tape[head];

      // Find matching rule
      const matchingRule = rules.find(
        r => r.currentState === prev.currentState && r.readSymbol === currentSymbol
      );

      if (!matchingRule) {
        const haltReason =
          prev.currentState === acceptState ? 'accept' :
          prev.currentState === rejectState ? 'reject' :
          'reject';

        setActiveRuleId(null);
        return { ...prev, isRunning: false, isHalted: true, haltReason };
      }

      // Highlight rule
      setActiveRuleId(matchingRule.id);

      // Write symbol
      tape[head] = matchingRule.writeSymbol;

      // Move head
      let newHead = head + (matchingRule.moveDirection === 'R' ? 1 : -1);

      if (newHead < 0) {
        tape.unshift(blankSymbol);
        newHead = 0;
      }
      if (newHead >= tape.length) tape.push(blankSymbol);

      const newState = matchingRule.newState;

      // Check halt - use exact match (case-sensitive)
      const isAccept = newState === acceptState;
      const isReject = newState === rejectState;
      const halted = isAccept || isReject;

      if (halted) setTimeout(() => setActiveRuleId(null), 300);

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

  // Run simulation
  useEffect(() => {
    if (!machineState.isRunning || machineState.isHalted) return;

    const timer = setTimeout(() => {
      executeStep();
    }, speed);

    return () => clearTimeout(timer);
  }, [machineState.isRunning, machineState.isHalted, machineState.stepCount, speed, executeStep]);

  const handleRun = () => {
    // If halted, reset first
    if (machineState.isHalted) {
      handleReset();
      // Use setTimeout to ensure reset completes before starting
      setTimeout(() => {
        setMachineState(prev => ({ ...prev, isRunning: true }));
      }, 0);
      return;
    }
    setMachineState(prev => ({ ...prev, isRunning: true }));
  };

  const handlePause = () => {
    setMachineState(prev => ({ ...prev, isRunning: false }));
  };

  const handleStep = () => {
    if (machineState.isHalted || machineState.isRunning) return;
    executeStep();
  };

  const handleReset = () => {
    const newTape = initialInput.split('');
    // Normalize blanks and ensure we have some blank cells
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
  };

  const handleInitialInputChange = (input) => {
    setInitialInput(input);
    // Auto-reset machine when input changes
    const newTape = input.split('');
    // Normalize blanks
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
  };

  const handleLoadExample = (input) => {
    setInitialInput(input);
    // Auto-reset with the new input
    const newTape = input.split('');
    // Normalize blanks
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
    
    // Set default input based on example
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
    
    // Reset machine
    const newTape = defaultInput.split('');
    // Normalize blanks
    const normalizedTape = newTape.map(cell => (cell === undefined || cell === '') ? example.blankSymbol : cell);
    while (normalizedTape.length < 7) {
      normalizedTape.push(example.blankSymbol);
    }

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

  return (
    <div className="tm-simulator">
      <div className="tm-container">
        {/* Header */}
        <div className="tm-header">
          <h1 className="tm-title">Turing Machine Simulator</h1>
          <p className="tm-subtitle">
            Visualize and understand how a Turing machine operates step-by-step
          </p>
        </div>

        {/* Example Selector */}
        <div className="example-selector">
          <label className="selector-label">Load Example:</label>
          <div className="selector-buttons">
            {Object.entries(examples).map(([key, example]) => (
              <button
                key={key}
                onClick={() => loadPresetExample(key)}
                className={`selector-btn ${currentExampleName === key ? 'active' : ''}`}
                title={example.description || example.name || key}
              >
                {example.name || key}
              </button>
            ))}
          </div>
          {currentExampleDescription && (
            <div className="tm-example-description">
              <strong>Description:</strong> {currentExampleDescription}
            </div>
          )}
        </div>

        {/* Main Layout */}
        <div className="tm-grid">
          {/* Left Column: Tape Visualizer + Control Panel + Examples */}
          <div className="tm-left-col">
            <TapeVisualizer
              tape={machineState.tape}
              headPosition={machineState.headPosition}
              currentState={machineState.currentState}
              initialInput={initialInput}
              onInitialInputChange={handleInitialInputChange}
              isHalted={machineState.isHalted}
              haltReason={machineState.haltReason}
            />
            
            <ControlPanel
              currentState={machineState.currentState}
              stepCount={machineState.stepCount}
              isRunning={machineState.isRunning}
              isHalted={machineState.isHalted}
              haltReason={machineState.haltReason}
              speed={speed}
              onRun={handleRun}
              onPause={handlePause}
              onStep={handleStep}
              onReset={handleReset}
              onSpeedChange={setSpeed}
            />

            <CollapsibleSection title="Example Test Cases" defaultOpen={false}>
              <ExampleTestCases 
                onLoadExample={handleLoadExample}
                currentExample={currentExampleName}
              />
            </CollapsibleSection>
          </div>

          {/* Right Column: Program Editor */}
          <div className="tm-right-col">
            <ProgramEditor
              rules={rules}
              activeRuleId={activeRuleId}
              onRulesChange={setRules}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

