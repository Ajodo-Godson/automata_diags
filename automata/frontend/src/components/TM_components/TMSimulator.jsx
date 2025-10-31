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
              if (tmDefinition.initialInput) setInitialInput(tmDefinition.initialInput);
              setCurrentExampleName(tmDefinition.name || 'Imported TM');
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
      const currentSymbol = prev.tape[prev.headPosition] || blankSymbol;
      const matchingRule = rules.find(
        rule =>
          rule.currentState === prev.currentState &&
          rule.readSymbol === currentSymbol
      );

      if (!matchingRule) {
        // No matching rule found - machine halts in current state
        // Check if current state is an accept state
        const isCurrentlyAccepting = prev.currentState.toLowerCase() === acceptState.toLowerCase();
        
        setActiveRuleId(null);
        return {
          ...prev,
          isRunning: false,
          isHalted: true,
          haltReason: isCurrentlyAccepting ? 'accept' : 'reject'
        };
      }

      setActiveRuleId(matchingRule.id);

      // Create new tape
      const newTape = [...prev.tape];
      newTape[prev.headPosition] = matchingRule.writeSymbol;

      // Calculate new head position
      let newHeadPosition = prev.headPosition;
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

      if (isHalted) {
        setTimeout(() => setActiveRuleId(null), 1000);
      }

      return {
        ...prev,
        tape: newTape,
        headPosition: newHeadPosition,
        currentState: newState,
        stepCount: prev.stepCount + 1,
        isRunning: !isHalted,
        isHalted: isHalted,
        haltReason: isAcceptState ? 'accept' : isRejectState ? 'reject' : undefined
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
          <label className="selector-label">Quick Load Example:</label>
          <select
            onChange={(e) => {
              if (e.target.value) {
                loadPresetExample(e.target.value);
              }
            }}
            value={currentExampleName || ''}
            className="example-dropdown"
          >
            <option value="">-- Select an example --</option>
            {Object.entries(examples).map(([key, example]) => (
              <option key={key} value={key}>
                {key}
              </option>
            ))}
          </select>
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

