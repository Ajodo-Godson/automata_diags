import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { CheckCircle, Target } from 'lucide-react';
import '../shared/SimulatorShell.css';
import StateDiagram from '../shared/StateDiagram';
import Transport from '../shared/Transport';
import { CollapsibleSection } from '../shared/CollapsibleSection';
import { NFATestCases } from './NFATestCases';
import { NFATransitionsEditor } from './TransitionsEditor';
import { NFAStatesEditor } from './StatesEditor';
import { NFAAlphabetEditor } from './AlphabetEditor';
import { useExamples } from './examples';
import { useNFA } from './useNFA';
import { validateNFAChallenge } from '../Tutorial_components/ChallengeValidator';
import { tryBuildLexerPatternNfa } from '../../lib/compilerTutorialLexers';

const DEFAULT_EXAMPLE = 'basic_nfa';
const EPSILON = 'ε';

const isEpsilon = (symbol) => symbol === EPSILON || symbol === 'epsilon' || symbol === '';

/** All states reachable from `states` using only ε-transitions. */
function epsilonClosure(states, transitions) {
    const closure = new Set(states);
    const stack = [...states];
    while (stack.length) {
        const state = stack.pop();
        transitions
            .filter((t) => t.from === state && isEpsilon(t.symbol))
            .forEach((t) => {
                if (!closure.has(t.to)) {
                    closure.add(t.to);
                    stack.push(t.to);
                }
            });
    }
    return closure;
}

/**
 * Subset-construct the NFA's run over the input, one step per symbol.
 *
 * Like the DFA, acceptance requires consuming the whole input. The previous
 * version broke out of the loop when the frontier went empty and then tested
 * `activePaths.some(isAccepting)` against the *surviving* set, so an input
 * that killed the computation partway could still report ACCEPTED.
 */
export function runNFA(nfa, input) {
    const acceptSet = new Set(nfa.acceptStates);
    const start = epsilonClosure(new Set([nfa.startState]), nfa.transitions);

    const steps = [
        {
            states: [...start],
            index: 0,
            activeTransitions: [],
            note:
                start.size > 1
                    ? `Start in ${nfa.startState}; ε-closure gives {${[...start].join(', ')}}.`
                    : `Start in ${nfa.startState}.`,
        },
    ];

    let frontier = start;
    let halted = null;

    for (let i = 0; i < input.length; i += 1) {
        const symbol = input[i];

        // ε is a transition label, never an input symbol.
        if (isEpsilon(symbol)) {
            halted = { reason: 'symbol', note: `ε is not an input symbol — it only labels transitions.` };
            break;
        }

        if (!nfa.alphabet.filter((s) => !isEpsilon(s)).includes(symbol)) {
            halted = {
                reason: 'symbol',
                note: `'${symbol}' is not in the alphabet {${nfa.alphabet
                    .filter((s) => !isEpsilon(s))
                    .join(', ')}}.`,
            };
            break;
        }

        const moved = new Set();
        const activeTransitions = [];
        frontier.forEach((state) => {
            nfa.transitions
                .filter((t) => t.from === state && t.symbol === symbol)
                .forEach((t) => {
                    activeTransitions.push({ from: t.from, to: t.to, label: symbol });
                    epsilonClosure(new Set([t.to]), nfa.transitions).forEach((s) => moved.add(s));
                });
        });

        if (moved.size === 0) {
            halted = {
                reason: 'dead',
                note: `No path survives reading '${symbol}' from {${[...frontier].join(', ')}}.`,
            };
            break;
        }

        frontier = moved;
        steps.push({
            states: [...frontier],
            index: i + 1,
            activeTransitions,
            note: `Read '${symbol}' → {${[...frontier].join(', ')}}.`,
        });
    }

    const accepted = !halted && [...frontier].some((s) => acceptSet.has(s));
    const accepting = [...frontier].filter((s) => acceptSet.has(s));

    const last = steps[steps.length - 1];
    if (halted) {
        last.note = halted.note;
    } else {
        last.note += accepted
            ? ` ${accepting.join(', ')} ${accepting.length > 1 ? 'are' : 'is'} accepting.`
            : ' No state in the set is accepting.';
    }

    return {
        steps,
        accepted,
        rejectedBecause: accepted ? null : halted ? halted.reason : 'notAccepting',
        finalStates: [...frontier],
    };
}

const NFASimulator = ({ challenge, tutorialDemoKey, onTutorialDemoConsumed }) => {
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
                      transitions: [],
                      startState: 'q0',
                      acceptStates: [],
                  }
                : examples[DEFAULT_EXAMPLE],
        [challenge, examples]
    );

    const nfa = useNFA(initialConfig);

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
        setResult(runNFA(nfa, input));
        setStep(0);
    }, [nfa, input]);

    const loadExample = useCallback(
        (key) => {
            const example = examples[key];
            if (!example) return;
            setExampleKey(key);
            setExampleNote(example.description || null);
            nfa.loadDefinition(example);
            setInput('');
            reset();
            // eslint-disable-next-line react-hooks/exhaustive-deps -- nfa identity churns each render
        },
        [examples, nfa.loadDefinition, reset]
    );

    useEffect(() => {
        if (challenge || !tutorialDemoKey) return;
        loadExample(tutorialDemoKey);
        onTutorialDemoConsumed?.();
        // eslint-disable-next-line react-hooks/exhaustive-deps -- one-shot deep-link bootstrap
    }, [challenge, tutorialDemoKey]);

    const applyLexerPattern = () => {
        const built = tryBuildLexerPatternNfa(lexerPattern);
        if (!built) {
            setLexerError('Supported patterns: [0-9]+ or [0-9]');
            return;
        }
        setLexerError(null);
        nfa.loadDefinition(built.definition);
        setExampleKey(null);
        setExampleNote(built.definition.description);
        setInput('');
        reset();
    };

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
                        nfa.loadDefinition({
                            states: parsed.states || [],
                            alphabet: parsed.alphabet || [],
                            transitions: parsed.transitions || [],
                            startState: parsed.startState || 'q0',
                            acceptStates: parsed.acceptStates || [],
                        });
                        setExampleKey(null);
                        setExampleNote(parsed.description || parsed.name || 'Imported machine.');
                        reset();
                    } catch {
                        setExampleNote('That file is not a valid NFA definition.');
                    }
                };
                reader.readAsText(file);
            };
            picker.click();
        };

        const onExport = () => {
            const payload = {
                name: exampleKey ? examples[exampleKey]?.name : 'Custom NFA',
                description: exampleNote || 'Exported NFA definition',
                states: nfa.states,
                alphabet: nfa.alphabet,
                transitions: nfa.transitions,
                startState: nfa.startState,
                acceptStates: nfa.acceptStates,
            };
            const uri =
                'data:application/json;charset=utf-8,' +
                encodeURIComponent(JSON.stringify(payload, null, 2));
            const link = document.createElement('a');
            link.setAttribute('href', uri);
            link.setAttribute('download', 'nfa_definition.json');
            link.click();
        };

        const onClear = () => {
            if (!window.confirm('Clear this machine and start from scratch?')) return;
            nfa.loadDefinition({
                states: ['q0'],
                alphabet: ['0', '1'],
                transitions: [],
                startState: 'q0',
                acceptStates: [],
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
    }, [nfa, examples, exampleKey, exampleNote, reset]);

    useEffect(() => {
        if (!challenge) return;
        nfa.loadDefinition({
            states: ['q0'],
            alphabet: challenge.challenge?.alphabet || ['0', '1'],
            transitions: [],
            startState: 'q0',
            acceptStates: [],
        });
        setInput('');
        reset();
        setValidation(null);
        // eslint-disable-next-line react-hooks/exhaustive-deps -- challenge bootstrap only
    }, [challenge]);

    const validateChallenge = () => {
        if (!challenge?.challenge?.testCases) return;
        const results = validateNFAChallenge(
            {
                states: nfa.states,
                alphabet: nfa.alphabet,
                transitions: nfa.transitions,
                startState: nfa.startState,
                acceptStates: nfa.acceptStates,
            },
            challenge.challenge.testCases
        );
        setValidation(results);
        if (window.opener && challenge.returnTo === 'tutorial') {
            window.opener.postMessage({ type: 'CHALLENGE_RESULT', results }, window.location.origin);
        }
    };

    const diagramTransitions = useMemo(
        () => nfa.transitions.map((t) => ({ from: t.from, to: t.to, label: t.symbol || EPSILON })),
        [nfa.transitions]
    );

    // Only one edge can be highlighted at a time, so prefer the first.
    const activeTransition = current?.activeTransitions?.[0] ?? null;

    const inputAlphabet = nfa.alphabet.filter((s) => !isEpsilon(s));

    const verdictNote = () => {
        if (!result) return null;
        if (result.accepted) return `Accepting state reached.`;
        switch (result.rejectedBecause) {
            case 'symbol':
                return 'Input contains a symbol outside the alphabet.';
            case 'dead':
                return 'Every path died — input was not fully read.';
            default:
                return 'No surviving path ends in an accept state.';
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
                        <h1 className="sim-title">Nondeterministic Finite Automaton</h1>
                        <p className="sim-subtitle">
                            Alphabet {'{'}
                            {inputAlphabet.join(', ')}
                            {'}'} · {nfa.states.length} states · {nfa.acceptStates.length} accepting
                        </p>
                    </div>

                    <div className="sim-run">
                        <label className="sr-only" htmlFor="nfa-input">
                            Input string
                        </label>
                        <input
                            id="nfa-input"
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
                    <div className="sim-examples">
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

                {!challenge && exampleNote && <p className="sim-example-note">{exampleNote}</p>}
            </div>

            <div className="sim-body">
                <div className="sim-stage">
                    <div className="card sim-diagram-card">
                        <div className="card-header">
                            <h2 className="card-title">State diagram</h2>
                            {current && (
                                <span className="hint">
                                    Step {step + 1} of {steps.length} · {current.states.length}{' '}
                                    active {current.states.length === 1 ? 'state' : 'states'}
                                </span>
                            )}
                        </div>
                        <div className="card-body">
                            <StateDiagram
                                states={nfa.states}
                                transitions={diagramTransitions}
                                startState={nfa.startState}
                                acceptStates={nfa.acceptStates}
                                currentStates={current?.states}
                                activeTransition={activeTransition}
                                onDeleteState={nfa.removeState}
                            />
                        </div>
                    </div>

                    <div className="card">
                        <Transport
                            isPlaying={isPlaying}
                            canPlay={!atEnd}
                            canStep={!atEnd}
                            onRun={() => {
                                if (!result) run();
                                setIsPlaying(true);
                            }}
                            onPause={() => setIsPlaying(false)}
                            onStep={() => {
                                if (!result) run();
                                else if (step < steps.length - 1) setStep(step + 1);
                            }}
                            onReset={reset}
                            speed={speed}
                            onSpeedChange={setSpeed}
                            readouts={[
                                {
                                    label: 'Active set',
                                    value: current
                                        ? `{${current.states.join(', ')}}`
                                        : `{${nfa.startState}}`,
                                },
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

                <aside className="sim-panel">
                    <CollapsibleSection title="States" defaultOpen={!!challenge}>
                        <NFAStatesEditor nfa={nfa} onUpdate={reset} />
                    </CollapsibleSection>

                    <CollapsibleSection title="Alphabet" defaultOpen>
                        <NFAAlphabetEditor nfa={nfa} onUpdate={reset} />
                    </CollapsibleSection>

                    <CollapsibleSection title="Transitions" defaultOpen>
                        <NFATransitionsEditor nfa={nfa} onUpdate={reset} />
                    </CollapsibleSection>

                    {!challenge && (
                        <CollapsibleSection title="Test cases" defaultOpen={false}>
                            <NFATestCases
                                onLoadTest={(t) => {
                                    setInput(t);
                                    reset();
                                }}
                                currentExample={exampleKey}
                            />
                        </CollapsibleSection>
                    )}

                    {!challenge && (
                        <CollapsibleSection title="Build a lexer NFA" defaultOpen={false}>
                            <div className="stack">
                                <p className="hint">
                                    Compile a token pattern into the NFA a lexer generator would
                                    produce before determinisation.
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

export default NFASimulator;
