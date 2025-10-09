import React, { useState, useEffect } from 'react';
import { TapeVisualizer } from './TapeVisualizer';
import { ControlPanel } from './ControlPanel';
import { ProgramEditor } from './ProgramEditor';
import { ExampleTestCases } from './ExampleTestCases';
import { useExamples } from './examples';
import './stylings/TMSimulator.css';

export default function TMSimulator() {
  const { examples } = useExamples();
  const [currentExampleName, setCurrentExampleName] = useState('Binary Incrementer');
  
  // Initialize with Binary Incrementer
  const [rules, setRules] = useState(examples["Binary Incrementer"].rules);
  const [machineState, setMachineState] = useState({
    tape: ['1', '0', '1', '□', '□', '□'],
    headPosition: 0,
    currentState: 'q0',
    stepCount: 0,
    isRunning: false,
    isHalted: false
  });

  const [speed, setSpeed] = useState(500);
  const [activeRuleId, setActiveRuleId] = useState(null);
  const [initialInput, setInitialInput] = useState('101');
  const [acceptState, setAcceptState] = useState('qaccept');
  const [rejectState, setRejectState] = useState('qreject');
  const [blankSymbol, setBlankSymbol] = useState('□');

  // Run simulation
  useEffect(() => {
    if (!machineState.isRunning || machineState.isHalted) return;

    const timer = setTimeout(() => {
      executeStep();
    }, speed);

    return () => clearTimeout(timer);
  }, [machineState.isRunning, machineState.isHalted, machineState.stepCount, speed]);

  const executeStep = () => {
    const currentSymbol = machineState.tape[machineState.headPosition] || blankSymbol;
    const matchingRule = rules.find(
      rule =>
        rule.currentState === machineState.currentState &&
        rule.readSymbol === currentSymbol
    );

    if (!matchingRule) {
      // No matching rule found - machine halts in current state
      // Check if current state is an accept state
      const isCurrentlyAccepting = machineState.currentState.toLowerCase() === acceptState.toLowerCase();
      
      setMachineState(prev => ({
        ...prev,
        isRunning: false,
        isHalted: true,
        haltReason: isCurrentlyAccepting ? 'accept' : 'reject'
      }));
      setActiveRuleId(null);
      return;
    }

    setActiveRuleId(matchingRule.id);

    // Create new tape
    const newTape = [...machineState.tape];
    newTape[machineState.headPosition] = matchingRule.writeSymbol;

    // Calculate new head position
    let newHeadPosition = machineState.headPosition;
    if (matchingRule.moveDirection === 'R') {
      newHeadPosition++;
      // Extend tape if needed
      if (newHeadPosition >= newTape.length) {
        newTape.push(blankSymbol);
      }
    } else {
      newHeadPosition--;
      // Extend tape to the left if needed
      if (newHeadPosition < 0) {
        newTape.unshift(blankSymbol);
        newHeadPosition = 0;
      }
    }

    // Apply the transition
    const newState = matchingRule.newState;
    
    // Check if new state is a halting state
    const isAcceptState = newState.toLowerCase() === acceptState.toLowerCase();
    const isRejectState = newState.toLowerCase() === rejectState.toLowerCase();
    const isHalted = isAcceptState || isRejectState;

    setMachineState(prev => ({
      ...prev,
      tape: newTape,
      headPosition: newHeadPosition,
      currentState: newState,
      stepCount: prev.stepCount + 1,
      isRunning: !isHalted,
      isHalted: isHalted,
      haltReason: isAcceptState ? 'accept' : isRejectState ? 'reject' : undefined
    }));

    if (isHalted) {
      setTimeout(() => setActiveRuleId(null), 1000);
    }
  };

  const handleRun = () => {
    if (machineState.isHalted) return;
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
    // Ensure we have some blank cells
    while (newTape.length < 7) {
      newTape.push(blankSymbol);
    }

    setMachineState({
      tape: newTape,
      headPosition: 0,
      currentState: 'q0',
      stepCount: 0,
      isRunning: false,
      isHalted: false,
      haltReason: undefined
    });
    setActiveRuleId(null);
  };

  const handleInitialInputChange = (input) => {
    setInitialInput(input);
  };

  const handleLoadExample = (input) => {
    setInitialInput(input);
    // Auto-reset with the new input
    const newTape = input.split('');
    while (newTape.length < 7) {
      newTape.push(blankSymbol);
    }
    setMachineState({
      tape: newTape,
      headPosition: 0,
      currentState: 'q0',
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
    setRules(example.rules);
    setAcceptState(example.acceptState);
    setRejectState(example.rejectState);
    setBlankSymbol(example.blankSymbol);
    
    // Set default input based on example
    const defaultInput = exampleName === 'Binary Incrementer' ? '101' :
                        exampleName === 'Palindrome Checker' ? '101' :
                        exampleName === '0^n 1^n' ? '0011' :
                        '';
    
    setInitialInput(defaultInput);
    
    // Reset machine
    const newTape = defaultInput.split('');
    while (newTape.length < 7) {
      newTape.push(example.blankSymbol);
    }

    setMachineState({
      tape: newTape,
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
          <label className="selector-label">Load Preset Example:</label>
          <div className="selector-buttons">
            {Object.keys(examples).map((name) => (
              <button
                key={name}
                onClick={() => loadPresetExample(name)}
                className={`selector-btn ${currentExampleName === name ? 'active' : ''}`}
              >
                {name}
              </button>
            ))}
          </div>
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

            <ExampleTestCases 
              onLoadExample={handleLoadExample}
              currentExample={currentExampleName}
            />
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

