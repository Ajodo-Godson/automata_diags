import { useState, useEffect } from 'react';
import { TapeVisualizer } from '../TapeVisualizer';
import { ControlPanel } from '../ControlPanel';
import { ProgramEditor } from '../ProgramEditor';
import { ExampleTestCases } from '../ExampleTestCases';

export interface TransitionRule {
  id: string;
  currentState: string;
  readSymbol: string;
  newState: string;
  writeSymbol: string;
  moveDirection: 'L' | 'R';
}

export interface TuringMachineState {
  tape: string[];
  headPosition: number;
  currentState: string;
  stepCount: number;
  isRunning: boolean;
  isHalted: boolean;
  haltReason?: 'accept' | 'reject' | 'error';
}

export function TuringMachineSimulator() {
  const [rules, setRules] = useState<TransitionRule[]>([
    // State q0: Find a 1 and mark it as x
    { id: '1', currentState: 'q0', readSymbol: '#', newState: 'q0', writeSymbol: '#', moveDirection: 'R' },
    { id: '2', currentState: 'q0', readSymbol: 'x', newState: 'q0', writeSymbol: 'x', moveDirection: 'R' },
    { id: '3', currentState: 'q0', readSymbol: 'z', newState: 'q0', writeSymbol: 'z', moveDirection: 'R' },
    { id: '4', currentState: 'q0', readSymbol: '1', newState: 'q1', writeSymbol: 'x', moveDirection: 'R' },
    
    // State q1: Find first 0 and mark it as y
    { id: '5', currentState: 'q1', readSymbol: 'x', newState: 'q1', writeSymbol: 'x', moveDirection: 'R' },
    { id: '6', currentState: 'q1', readSymbol: 'y', newState: 'q1', writeSymbol: 'y', moveDirection: 'R' },
    { id: '7', currentState: 'q1', readSymbol: 'z', newState: 'q1', writeSymbol: 'z', moveDirection: 'R' },
    { id: '8', currentState: 'q1', readSymbol: '0', newState: 'q2', writeSymbol: 'y', moveDirection: 'R' },
    
    // State q2: Move right to find second 0 and mark it as z
    { id: '9', currentState: 'q2', readSymbol: 'y', newState: 'q2', writeSymbol: 'y', moveDirection: 'R' },
    { id: '10', currentState: 'q2', readSymbol: 'z', newState: 'q2', writeSymbol: 'z', moveDirection: 'R' },
    { id: '11', currentState: 'q2', readSymbol: '0', newState: 'q3', writeSymbol: 'z', moveDirection: 'L' },
    
    // State q3: Return to start marker #
    { id: '12', currentState: 'q3', readSymbol: 'x', newState: 'q3', writeSymbol: 'x', moveDirection: 'L' },
    { id: '13', currentState: 'q3', readSymbol: 'y', newState: 'q3', writeSymbol: 'y', moveDirection: 'L' },
    { id: '14', currentState: 'q3', readSymbol: 'z', newState: 'q3', writeSymbol: 'z', moveDirection: 'L' },
    { id: '15', currentState: 'q3', readSymbol: '#', newState: 'q0', writeSymbol: '#', moveDirection: 'R' },
    
    // Check for completion - all 1s processed (when we only see y/z ahead)
    { id: '16', currentState: 'q0', readSymbol: 'y', newState: 'q4', writeSymbol: 'y', moveDirection: 'L' },
    
    // State q4: Move back to start for verification
    { id: '17', currentState: 'q4', readSymbol: 'x', newState: 'q4', writeSymbol: 'x', moveDirection: 'L' },
    { id: '18', currentState: 'q4', readSymbol: 'y', newState: 'q4', writeSymbol: 'y', moveDirection: 'L' },
    { id: '19', currentState: 'q4', readSymbol: 'z', newState: 'q4', writeSymbol: 'z', moveDirection: 'L' },
    { id: '20', currentState: 'q4', readSymbol: '#', newState: 'q5', writeSymbol: '#', moveDirection: 'R' },
    
    // State q5: Verify only x, y, z remain (acceptance check)
    { id: '21', currentState: 'q5', readSymbol: 'x', newState: 'q5', writeSymbol: 'x', moveDirection: 'R' },
    { id: '22', currentState: 'q5', readSymbol: 'y', newState: 'q5', writeSymbol: 'y', moveDirection: 'R' },
    { id: '23', currentState: 'q5', readSymbol: 'z', newState: 'q5', writeSymbol: 'z', moveDirection: 'R' },
    { id: '24', currentState: 'q5', readSymbol: '□', newState: 'qaccept', writeSymbol: '□', moveDirection: 'R' },
    { id: '25', currentState: 'q5', readSymbol: '0', newState: 'qreject', writeSymbol: '0', moveDirection: 'R' },
    { id: '26', currentState: 'q5', readSymbol: '1', newState: 'qreject', writeSymbol: '1', moveDirection: 'R' },
    
    // Handle edge cases
    { id: '27', currentState: 'q1', readSymbol: '□', newState: 'qreject', writeSymbol: '□', moveDirection: 'R' },
    { id: '28', currentState: 'q2', readSymbol: '□', newState: 'qreject', writeSymbol: '□', moveDirection: 'R' },
  ]);

  const [machineState, setMachineState] = useState<TuringMachineState>({
    tape: ['#', '1', '1', '0', '0', '0', '0', '□', '□', '□'],
    headPosition: 0,
    currentState: 'q0',
    stepCount: 0,
    isRunning: false,
    isHalted: false
  });

  const [speed, setSpeed] = useState(500);
  const [activeRuleId, setActiveRuleId] = useState<string | null>(null);
  const [initialInput, setInitialInput] = useState('#110000');

  useEffect(() => {
    if (!machineState.isRunning || machineState.isHalted) return;

    const timer = setTimeout(() => {
      executeStep();
    }, speed);

    return () => clearTimeout(timer);
  }, [machineState.isRunning, machineState.isHalted, machineState.stepCount, speed]);

  const executeStep = () => {
    const currentSymbol = machineState.tape[machineState.headPosition] || '□';
    const matchingRule = rules.find(
      rule =>
        rule.currentState === machineState.currentState &&
        rule.readSymbol === currentSymbol
    );

    if (!matchingRule) {
      setMachineState(prev => ({
        ...prev,
        isRunning: false,
        isHalted: true,
        haltReason: 'error'
      }));
      setActiveRuleId(null);
      return;
    }

    setActiveRuleId(matchingRule.id);

    const isAcceptState = matchingRule.newState.toLowerCase().includes('accept');
    const isRejectState = matchingRule.newState.toLowerCase().includes('reject');

    const newTape = [...machineState.tape];
    newTape[machineState.headPosition] = matchingRule.writeSymbol;

    let newHeadPosition = machineState.headPosition;
    if (matchingRule.moveDirection === 'R') {
      newHeadPosition++;
      if (newHeadPosition >= newTape.length) {
        newTape.push('□');
      }
    } else {
      newHeadPosition--;
      if (newHeadPosition < 0) {
        newTape.unshift('□');
        newHeadPosition = 0;
      }
    }

    setMachineState(prev => ({
      ...prev,
      tape: newTape,
      headPosition: newHeadPosition,
      currentState: matchingRule.newState,
      stepCount: prev.stepCount + 1,
      isRunning: !isAcceptState && !isRejectState,
      isHalted: isAcceptState || isRejectState,
      haltReason: isAcceptState ? 'accept' : isRejectState ? 'reject' : undefined
    }));

    if (isAcceptState || isRejectState) {
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
    while (newTape.length < 7) {
      newTape.push('□');
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

  const handleInitialInputChange = (input: string) => {
    setInitialInput(input);
  };

  const handleLoadExample = (input: string) => {
    setInitialInput(input);
    const newTape = input.split('');
    while (newTape.length < 10) {
      newTape.push('□');
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
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

        <ExampleTestCases onLoadExample={handleLoadExample} />
      </div>

      <div className="lg:col-span-1">
        <ProgramEditor
          rules={rules}
          activeRuleId={activeRuleId}
          onRulesChange={setRules}
        />
      </div>
    </div>
  );
}
