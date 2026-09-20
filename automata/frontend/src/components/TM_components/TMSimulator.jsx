import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { TapeVisualizer } from './TapeVisualizer';
import Transport from '../shared/Transport';
import { ProgramEditor } from './ProgramEditor';
import { TMTestCases } from './TMTestCases';
import { useExamples } from './examples';
import { validateTMChallenge } from '../Tutorial_components/ChallengeValidator';
import { CheckCircle, Target } from 'lucide-react';
import { CollapsibleSection } from '../shared/CollapsibleSection';
import '../shared/SimulatorShell.css';
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

  const [playbackSpeed, setPlaybackSpeed] = useState(500);
  const [activeRuleId, setActiveRuleId] = useState(null);
  /*
   * Configuration trace. Reading a Turing machine means following how the
   * (state, head, symbol) triple evolves, so each applied rule is recorded and
   * shown beside the tape.
   */
  const [trace, setTrace] = useState([]);
  const [initialInput, setInitialInput] = useState(initialData.input);
  const [acceptState, setAcceptState] = useState('qaccept');
  const [rejectState, setRejectState] = useState('qreject');
  const [blankSymbol, setBlankSymbol] = useState('□');
  const [startState, setStartState] = useState('q0');

  // Maximum steps before timeout
  const MAX_STEPS = 5000;

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
    setTrace([]);
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

  /*
   * A state updater must be a pure function of its previous value: React
   * invokes it twice in development (StrictMode), so recording the trace
   * inside it logged every step twice — the trace read "10 steps" while the
   * machine had taken 5. The transition is computed here instead, and the
   * three pieces of state are set from the outside.
   */
  const machineRef = useRef(machineState);
  useEffect(() => {
    machineRef.current = machineState;
  }, [machineState]);

  const executeStep = useCallback(() => {
    const prev = machineRef.current;
    if (prev.isHalted) return;

    if (prev.stepCount >= MAX_STEPS) {
      setActiveRuleId(null);
      setMachineState({ ...prev, isRunning: false, isHalted: true, haltReason: 'reject' });
      return;
    }

    const tape = [...prev.tape];
    const head = prev.headPosition;
    const currentSymbol =
      tape[head] === undefined || tape[head] === '' ? blankSymbol : tape[head];

    const matchingRule = rules.find(
      (r) => r.currentState === prev.currentState && r.readSymbol === currentSymbol
    );

    if (!matchingRule) {
      // No applicable rule: the machine halts where it stands.
      const haltReason = prev.currentState === acceptState ? 'accept' : 'reject';
      setActiveRuleId(null);
      setMachineState({ ...prev, isRunning: false, isHalted: true, haltReason });
      return;
    }

    tape[head] = matchingRule.writeSymbol;
    let newHead = head + (matchingRule.moveDirection === 'R' ? 1 : -1);

    // The tape is unbounded, so grow it rather than clamping the head.
    if (newHead < 0) {
      tape.unshift(blankSymbol);
      newHead = 0;
    }
    if (newHead >= tape.length) tape.push(blankSymbol);

    const newState = matchingRule.newState;
    const isAccept = newState === acceptState;
    const isReject = newState === rejectState;
    const halted = isAccept || isReject;

    setActiveRuleId(matchingRule.id);
    setTrace((log) => [
      ...log.slice(-199),
      {
        step: prev.stepCount + 1,
        from: prev.currentState,
        read: currentSymbol,
        write: matchingRule.writeSymbol,
        move: matchingRule.moveDirection,
        to: newState,
      },
    ]);
    setMachineState({
      ...prev,
      tape,
      headPosition: newHead,
      currentState: newState,
      stepCount: prev.stepCount + 1,
      isRunning: prev.isRunning && !halted,
      isHalted: halted,
      haltReason: isAccept ? 'accept' : isReject ? 'reject' : undefined,
    });
  }, [rules, acceptState, rejectState, blankSymbol]);

  // Simulation timer
  useEffect(() => {
    if (!machineState.isRunning || machineState.isHalted) return;
    const timer = setTimeout(executeStep, playbackSpeed);
    return () => clearTimeout(timer);
  }, [machineState.isRunning, machineState.isHalted, machineState.stepCount, playbackSpeed, executeStep]);

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

  // Calculate available states and symbols for dropdowns/datalists
  const availableStates = useMemo(() => {
    const states = new Set(['q0', acceptState, rejectState, startState]);
    rules.forEach(rule => {
      states.add(rule.currentState);
      states.add(rule.newState);
    });
    return Array.from(states).filter(s => s && s.trim() !== '');
  }, [rules, acceptState, rejectState, startState]);

  const availableSymbols = useMemo(() => {
    const symbols = new Set(['0', '1', blankSymbol, 'X', 'Y', 'A', 'B', '#']);
    rules.forEach(rule => {
      symbols.add(rule.readSymbol);
      symbols.add(rule.writeSymbol);
    });
    // Add symbols from current tape
    machineState.tape.forEach(s => symbols.add(s));
    return Array.from(symbols).filter(s => s && s.trim() !== '');
  }, [rules, blankSymbol, machineState.tape]);

  const halted = machineState.isHalted;
  const accepted = halted && /accept/i.test(machineState.haltReason || '');

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
            <button type="button" className="btn btn-primary" onClick={handleValidateChallenge}>
              <CheckCircle size={14} aria-hidden="true" />
              Validate
            </button>
          </div>
        )}

        <div className="sim-toolbar">
          <div className="sim-identity">
            <h1 className="sim-title">Turing Machine</h1>
            <p className="sim-subtitle">
              {rules.length} rules · {availableStates.length} states · blank symbol {blankSymbol}
            </p>
          </div>

          <div className="sim-run">
            <label className="sr-only" htmlFor="tm-input">
              Initial tape
            </label>
            <input
              id="tm-input"
              className="field"
              value={initialInput}
              placeholder="Initial tape, e.g. 1011"
              onChange={(e) => handleInitialInputChange(e.target.value)}
            />
            <button type="button" className="btn btn-primary" onClick={handleReset}>
              Load
            </button>
          </div>

          {halted && (
            <div className={`verdict ${accepted ? 'verdict-accept' : 'verdict-reject'} sim-verdict`}>
              {accepted ? 'Halted — accepted' : 'Halted'}
              <span className="verdict-note">{machineState.haltReason}</span>
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
                  title={example.description || example.name || key}
                  onClick={() => loadPresetExample(key)}
                >
                  {example.name || key}
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
        <div className="sim-stage sim-stage-tm">
          <div className="card tm-tape-card">
            <div className="card-header">
              <h2 className="card-title">Tape</h2>
              <span className="hint">
                head at {machineState.headPosition} · state {machineState.currentState}
              </span>
            </div>
            <div className="card-body">
              <TapeVisualizer
                tape={machineState.tape}
                headPosition={machineState.headPosition}
                currentState={machineState.currentState}
                isHalted={machineState.isHalted}
                haltReason={machineState.haltReason}
              />
            </div>
          </div>

          <div className="card tm-trace-card">
            <div className="card-header">
              <h2 className="card-title">Configuration trace</h2>
              <span className="hint">{trace.length} steps</span>
            </div>
            <div className="card-body card-body-flush tm-trace-body">
              {trace.length === 0 ? (
                <p className="empty">
                  Press Run or Step to trace how the machine rewrites the tape.
                </p>
              ) : (
                <div className="table-wrap">
                  <table className="table tm-trace-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>State</th>
                        <th>Read</th>
                        <th>Write</th>
                        <th>Move</th>
                        <th>Next</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...trace].reverse().map((t) => (
                        <tr key={t.step} className={t.step === trace.length ? 'is-current' : ''}>
                          <td className="cell-mono">{t.step}</td>
                          <td className="cell-mono">{t.from}</td>
                          <td className="cell-mono">{t.read}</td>
                          <td className="cell-mono">{t.write}</td>
                          <td className="cell-mono">{t.move === 'R' ? '→' : '←'}</td>
                          <td className="cell-mono">{t.to}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <Transport
              isPlaying={machineState.isRunning}
              canPlay={!machineState.isHalted}
              canStep={!machineState.isHalted}
              onRun={handleRun}
              onPause={handlePause}
              onStep={handleStep}
              onReset={handleReset}
              speed={playbackSpeed}
              onSpeedChange={setPlaybackSpeed}
              readouts={[
                { label: 'State', value: machineState.currentState },
                { label: 'Head', value: machineState.headPosition },
                { label: 'Steps', value: machineState.stepCount },
              ]}
            />
          </div>
        </div>

        <aside className="sim-panel">
          <CollapsibleSection title="Transition rules" defaultOpen>
            <ProgramEditor
              rules={rules}
              activeRuleId={activeRuleId}
              onRulesChange={setRules}
              availableStates={availableStates}
              availableSymbols={availableSymbols}
            />
          </CollapsibleSection>

          {!challenge && (
            <CollapsibleSection title="Test cases" defaultOpen={false}>
              <TMTestCases
                onLoadExample={handleInitialInputChange}
                currentExample={currentExampleName}
              />
            </CollapsibleSection>
          )}
        </aside>
      </div>
    </div>
  );
}
