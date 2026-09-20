import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { CheckCircle, Target } from 'lucide-react';
import '../shared/SimulatorShell.css';
import StateDiagram from '../shared/StateDiagram';
import Transport from '../shared/Transport';
import { CollapsibleSection } from '../shared/CollapsibleSection';
import { DFATestCases } from './DFATestCases';
import { TransitionsEditor } from './TransitionsEditor';
import { StatesEditor } from './StatesEditor';
import { AlphabetEditor } from './AlphabetEditor';
import { useExamples } from './examples';
import { useDFA } from './useDFA';
import { validateDFAChallenge } from '../Tutorial_components/ChallengeValidator';
import { tryBuildLexerPattern } from '../../lib/compilerTutorialLexers';

const DEFAULT_EXAMPLE = 'ends_with_ab';

/**
 * Run the DFA over the input, producing one step per symbol.
 *
 * A DFA accepts only when it consumes the *entire* input and halts in an
 * accept state. The previous implementation broke out of the loop on an
 * unknown symbol or a missing transition and then tested acceptance on
 * whatever state it had stopped in — so "abxyz" reported ACCEPTED because
 * "ab" alone lands in an accept state.
 */
export function runDFA(dfa, input) {
    const steps = [
        {
            state: dfa.startState,
            index: 0,
            transition: null,
            note: `Start in ${dfa.startState}.`,
        },
    ];

    let state = dfa.startState;
    let halted = null;

    for (let i = 0; i < input.length; i += 1) {
        const symbol = input[i];

        if (!dfa.alphabet.includes(symbol)) {
            halted = {
                reason: 'symbol',
                note: `'${symbol}' is not in the alphabet {${dfa.alphabet.join(', ')}}.`,
            };
            break;
        }

        if (!dfa.hasTransition(state, symbol)) {
            halted = {
                reason: 'transition',
                note: `No transition defined from ${state} on '${symbol}'.`,
            };
            break;
        }

        const next = dfa.transitions[state][symbol];
        steps.push({
            state: next,
            index: i + 1,
            transition: { from: state, to: next, label: symbol },
            note: `Read '${symbol}': ${state} → ${next}.`,
        });
        state = next;
    }

    const consumedAll = !halted;
    const accepted = consumedAll && dfa.acceptStates.has(state);

    const last = steps[steps.length - 1];
    if (halted) {
        last.note = halted.note;
        last.isStuck = true;
    } else {
        last.note += dfa.acceptStates.has(state)
            ? ` ${state} is an accept state.`
            : ` ${state} is not an accept state.`;
    }

    return {
        steps,
        accepted,
        // Kept separate from `accepted` so the UI can explain *why* it rejected.
        rejectedBecause: accepted ? null : halted ? halted.reason : 'notAccepting',
        finalState: state,
    };
}

const DFASimulator = ({ challenge, tutorialDemoKey, onTutorialDemoConsumed }) => {
    const { examples } = useExamples();
    const [exampleKey, setExampleKey] = useState(challenge ? null : DEFAULT_EXAMPLE);
    const [exampleNote, setExampleNote] = useState(
        challenge ? null : examples[DEFAULT_EXAMPLE].description
    );
    const [validation, setValidation] = useState(null);

    const initialConfig = useMemo(
        () =>
            challenge
                ? {
                      states: ['q0'],
                      alphabet: challenge.challenge?.alphabet || ['0', '1'],
                      transitions: {},
                      startState: 'q0',
                      acceptStates: new Set(),
                  }
                : examples[DEFAULT_EXAMPLE],
        [challenge, examples]
    );

    const dfa = useDFA(initialConfig);

    const [input, setInput] = useState('');
    const [lexerPattern, setLexerPattern] = useState('[0-9]+');
    const [lexerError, setLexerError] = useState(null);
    const [result, setResult] = useState(null);
    const [step, setStep] = useState(-1);
    const [isPlaying, setIsPlaying] = useState(false);
    const [speed, setSpeed] = useState(500);

    const steps = result?.steps ?? [];
    const atEnd = step >= 0 && step === steps.length - 1;
    const current = step >= 0 ? steps[step] : null;

    const reset = useCallback(() => {
        setResult(null);
        setStep(-1);
        setIsPlaying(false);
    }, []);

    useEffect(() => {
        if (!isPlaying) return undefined;
        if (step >= steps.length - 1) {
            setIsPlaying(false);
            return undefined;
        }
        const timer = setTimeout(() => setStep((s) => s + 1), speed);
        return () => clearTimeout(timer);
    }, [isPlaying, step, steps.length, speed]);

    const run = useCallback(() => {
        const next = runDFA(dfa, input);
        setResult(next);
        setStep(0);
        return next;
    }, [dfa, input]);

    const handleRun = () => {
        if (!result) run();
        setIsPlaying(true);
    };

    const handleStep = () => {
        if (!result) {
            run();
            return;
        }
        if (step < steps.length - 1) setStep(step + 1);
    };

    const loadExample = useCallback(
        (key) => {
            const example = examples[key];
            if (!example) return;
            setExampleKey(key);
            setExampleNote(example.description || null);
            dfa.loadDFA(example);
            setInput('');
            reset();
            // eslint-disable-next-line react-hooks/exhaustive-deps -- dfa identity churns each render
        },
        [examples, dfa.loadDFA, reset]
    );

    useEffect(() => {
        if (challenge || !tutorialDemoKey) return;
        loadExample(tutorialDemoKey);
        onTutorialDemoConsumed?.();
        // eslint-disable-next-line react-hooks/exhaustive-deps -- one-shot deep-link bootstrap
    }, [challenge, tutorialDemoKey]);

    const applyLexerPattern = () => {
        const built = tryBuildLexerPattern(lexerPattern);
        if (!built) {
            setLexerError('Supported patterns: [0-9]+ or [0-9]');
            return;
        }
        setLexerError(null);
        dfa.loadDFA(built.definition);
        setExampleKey(null);
        setExampleNote(built.definition.description);
        setInput('');
        reset();
    };

    /* Import / export / clear, dispatched from the header. */
    useEffect(() => {
        const onImport = () => {
            const picker = document.createElement('input');
            picker.type = 'file';
            picker.accept = '.json';
            picker.onchange = (e) => {
                const file = e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (ev) => {
                    try {
                        const parsed = JSON.parse(ev.target.result);
                        dfa.loadDFA({
                            states: parsed.states || [],
                            alphabet: parsed.alphabet || [],
                            transitions: parsed.transitions || {},
                            startState: parsed.startState || 'q0',
                            acceptStates: new Set(parsed.acceptStates || []),
                        });
                        setExampleKey(null);
                        setExampleNote(parsed.description || parsed.name || 'Imported machine.');
                        reset();
                    } catch {
                        setExampleNote('That file is not a valid DFA definition.');
                    }
                };
                reader.readAsText(file);
            };
            picker.click();
        };

        const onExport = () => {
            const payload = {
                name: exampleKey ? examples[exampleKey]?.name : 'Custom DFA',
                description: exampleNote || 'Exported DFA definition',
                states: dfa.states,
                alphabet: dfa.alphabet,
                transitions: dfa.transitions,
                startState: dfa.startState,
                acceptStates: [...dfa.acceptStates],
            };
            const uri =
                'data:application/json;charset=utf-8,' +
                encodeURIComponent(JSON.stringify(payload, null, 2));
            const link = document.createElement('a');
            link.setAttribute('href', uri);
            link.setAttribute('download', 'dfa_definition.json');
            link.click();
        };

        const onClear = () => {
            if (!window.confirm('Clear this machine and start from scratch?')) return;
            dfa.loadDFA({
                states: ['q0'],
                alphabet: ['0', '1'],
                transitions: {},
                startState: 'q0',
                acceptStates: new Set(),
            });
            setExampleKey(null);
            setExampleNote(null);
            setInput('');
            reset();
            setValidation(null);
        };

        window.addEventListener('import', onImport);
        window.addEventListener('export', onExport);
        window.addEventListener('clearAll', onClear);
        return () => {
            window.removeEventListener('import', onImport);
            window.removeEventListener('export', onExport);
            window.removeEventListener('clearAll', onClear);
        };
    }, [dfa, examples, exampleKey, exampleNote, reset]);

    useEffect(() => {
        if (!challenge) return;
        dfa.loadDFA({
            states: ['q0'],
            alphabet: challenge.challenge?.alphabet || ['0', '1'],
            transitions: {},
            startState: 'q0',
            acceptStates: new Set(),
        });
        setInput('');
        reset();
        setValidation(null);
        // eslint-disable-next-line react-hooks/exhaustive-deps -- challenge bootstrap only
    }, [challenge]);

    const validateChallenge = () => {
        if (!challenge?.challenge?.testCases) return;
        const results = validateDFAChallenge(
            {
                states: dfa.states,
                alphabet: dfa.alphabet,
                transitions: dfa.transitions,
                startState: dfa.startState,
                acceptStates: dfa.acceptStates,
            },
            challenge.challenge.testCases
        );
        setValidation(results);
        if (window.opener && challenge.returnTo === 'tutorial') {
            window.opener.postMessage(
                { type: 'CHALLENGE_RESULT', results },
                window.location.origin
            );
        }
    };

    /* Flatten the transition map into what StateDiagram expects. */
    const diagramTransitions = useMemo(() => {
        const out = [];
        Object.entries(dfa.transitions).forEach(([from, row]) => {
            Object.entries(row || {}).forEach(([label, to]) => {
                if (to) out.push({ from, to, label });
            });
        });
        return out;
    }, [dfa.transitions]);

    const verdictNote = () => {
        if (!result) return null;
        if (result.accepted) return `Halted in ${result.finalState}.`;
        switch (result.rejectedBecause) {
            case 'symbol':
                return 'Input contains a symbol outside the alphabet.';
            case 'transition':
                return 'The machine got stuck — input was not fully read.';
            default:
                return `Halted in ${result.finalState}, which is not accepting.`;
        }
    };

    return (
        <div className="sim">
            <div>
                {challenge?.challenge && (
                    <div className="sim-challenge">
                        <Target size={16} aria-hidden="true" />
                        <span className="sim-challenge-text">
                            <strong>Challenge:</strong> {challenge.challenge.description}
                        </span>
                        {validation && (
                            <span
                                className={`verdict ${
                                    validation.passed === validation.total
                                        ? 'verdict-accept'
                                        : 'verdict-reject'
                                }`}
                            >
                                {validation.passed}/{validation.total} passing
                            </span>
                        )}
                        <button type="button" className="btn btn-primary" onClick={validateChallenge}>
                            <CheckCircle size={14} aria-hidden="true" />
                            Validate
                        </button>
                    </div>
                )}

                <div className="sim-toolbar">
                    <div className="sim-identity">
                        <h1 className="sim-title">Deterministic Finite Automaton</h1>
                        <p className="sim-subtitle">
                            Alphabet {'{'}
                            {dfa.alphabet.join(', ')}
                            {'}'} · {dfa.states.length} states ·{' '}
                            {dfa.acceptStates.size} accepting
                        </p>
                    </div>

                    <div className="sim-run" data-tour="dfa-input-controls">
                        <label className="sr-only" htmlFor="dfa-input">
                            Input string
                        </label>
                        <input
                            id="dfa-input"
                            className="field"
                            value={input}
                            placeholder="Type a string, e.g. aab"
                            onChange={(e) => {
                                setInput(e.target.value);
                                reset();
                            }}
                            onKeyDown={(e) => e.key === 'Enter' && run()}
                        />
                        <button type="button" className="btn btn-primary" onClick={run}>
                            Test
                        </button>
                    </div>

                    {result && (
                        <div
                            className={`verdict ${
                                result.accepted ? 'verdict-accept' : 'verdict-reject'
                            } sim-verdict`}
                        >
                            {result.accepted ? 'Accepted' : 'Rejected'}
                            <span className="verdict-note">{verdictNote()}</span>
                        </div>
                    )}
                </div>

                {!challenge && (
                    <div className="sim-examples" data-tour="dfa-example-selector">
                        <span className="eyebrow sim-examples-label">Examples</span>
                        <div className="sim-examples-list">
                            {Object.entries(examples).map(([key, example]) => (
                                <button
                                    key={key}
                                    type="button"
                                    className="chip"
                                    aria-pressed={exampleKey === key}
                                    onClick={() => loadExample(key)}
                                >
                                    {example.name}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {!challenge && exampleNote && (
                    <p className="sim-example-note">{exampleNote}</p>
                )}
            </div>

            <div className="sim-body">
                <div className="sim-stage">
                    <div className="card sim-diagram-card">
                        <div className="card-header">
                            <h2 className="card-title">State diagram</h2>
                            {current && (
                                <span className="hint">
                                    Step {step + 1} of {steps.length}
                                </span>
                            )}
                        </div>
                        <div className="card-body">
                            <StateDiagram
                                states={dfa.states}
                                transitions={diagramTransitions}
                                startState={dfa.startState}
                                acceptStates={dfa.acceptStates}
                                currentState={current?.state}
                                activeTransition={current?.transition}
                                onDeleteState={dfa.removeState}
                            />
                        </div>
                    </div>

                    <div className="card">
                        <Transport
                            isPlaying={isPlaying}
                            canPlay={!atEnd}
                            canStep={!atEnd}
                            onRun={handleRun}
                            onPause={() => setIsPlaying(false)}
                            onStep={handleStep}
                            onReset={reset}
                            speed={speed}
                            onSpeedChange={setSpeed}
                            readouts={[
                                { label: 'State', value: current?.state ?? dfa.startState },
                                { label: 'Step', value: `${Math.max(step + 1, 0)}/${steps.length || 0}` },
                            ]}
                        />

                        {current && (
                            <div className="card-body" style={{ paddingTop: 0 }}>
                                <div className="stack">
                                    <div className="sim-tape-strip">
                                        {input.length === 0 ? (
                                            <span className="hint">ε (empty string)</span>
                                        ) : (
                                            [...input].map((symbol, i) => (
                                                <span
                                                    key={`${symbol}-${i}`}
                                                    className={`sim-symbol ${
                                                        i < current.index ? 'is-consumed' : ''
                                                    } ${i === current.index ? 'is-current' : ''}`}
                                                >
                                                    {symbol}
                                                </span>
                                            ))
                                        )}
                                    </div>
                                    <p className="sim-step-note">{current.note}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <aside className="sim-panel" data-tour="dfa-editors">
                    <CollapsibleSection title="States" defaultOpen={!!challenge}>
                        <StatesEditor dfa={dfa} onUpdate={reset} />
                    </CollapsibleSection>

                    <CollapsibleSection title="Alphabet" defaultOpen>
                        <AlphabetEditor dfa={dfa} onUpdate={reset} />
                    </CollapsibleSection>

                    <CollapsibleSection title="Transitions" defaultOpen={!!challenge}>
                        <TransitionsEditor dfa={dfa} onUpdate={reset} />
                    </CollapsibleSection>

                    <CollapsibleSection title="Transition table" defaultOpen>
                        <div className="table-wrap">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>State</th>
                                        {dfa.alphabet.map((symbol) => (
                                            <th key={symbol}>{symbol}</th>
                                        ))}
                                        <th>Accept</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {dfa.states.map((state) => (
                                        <tr
                                            key={state}
                                            className={current?.state === state ? 'is-current' : ''}
                                        >
                                            <td className="cell-mono">
                                                {state === dfa.startState ? '→ ' : ''}
                                                {state}
                                            </td>
                                            {dfa.alphabet.map((symbol) => (
                                                <td key={symbol} className="cell-mono">
                                                    {dfa.hasTransition(state, symbol)
                                                        ? dfa.transitions[state][symbol]
                                                        : '—'}
                                                </td>
                                            ))}
                                            <td>{dfa.acceptStates.has(state) ? '✓' : ''}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CollapsibleSection>

                    {!challenge && (
                        <CollapsibleSection title="Test cases" defaultOpen={false}>
                            <DFATestCases
                                onLoadTest={(t) => {
                                    setInput(t);
                                    reset();
                                }}
                                currentExample={exampleKey}
                            />
                        </CollapsibleSection>
                    )}

                    {!challenge && (
                        <CollapsibleSection title="Build a lexer DFA" defaultOpen={false}>
                            <div className="stack">
                                <p className="hint">
                                    Compile a token pattern into the DFA a real lexer would use.
                                </p>
                                <div className="row">
                                    <input
                                        className="field field-mono"
                                        value={lexerPattern}
                                        aria-label="Lexer pattern"
                                        onChange={(e) => setLexerPattern(e.target.value)}
                                    />
                                    <button type="button" className="btn" onClick={applyLexerPattern}>
                                        Build
                                    </button>
                                </div>
                                {lexerError && (
                                    <p className="hint" style={{ color: 'var(--reject-fg)' }}>
                                        {lexerError}
                                    </p>
                                )}
                            </div>
                        </CollapsibleSection>
                    )}
                </aside>
            </div>
        </div>
    );
};

export default DFASimulator;
