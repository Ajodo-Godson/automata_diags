import { runDFA } from '../DFA_components/DFASimulator';
import { runNFA } from '../NFA_components/NFASimulator';

/*
 * Acceptance requires consuming the *whole* input. Both simulators used to
 * break out of their loop on a dead computation and then test acceptance on
 * whichever state they had stopped in, so an input that killed the run partway
 * could still report ACCEPTED.
 */

// Ends with "ab" over {a, b}.
const endsWithAb = {
    states: ['q0', 'q1', 'q2'],
    alphabet: ['a', 'b'],
    transitions: {
        q0: { a: 'q1', b: 'q0' },
        q1: { a: 'q1', b: 'q2' },
        q2: { a: 'q1', b: 'q0' },
    },
    startState: 'q0',
    acceptStates: new Set(['q2']),
    hasTransition(from, symbol) {
        return this.transitions[from]?.[symbol] !== undefined;
    },
};

// Same language, nondeterministically.
const endsWithAbNfa = {
    states: ['q0', 'q1', 'q2'],
    alphabet: ['a', 'b'],
    transitions: [
        { from: 'q0', to: 'q0', symbol: 'a' },
        { from: 'q0', to: 'q0', symbol: 'b' },
        { from: 'q0', to: 'q1', symbol: 'a' },
        { from: 'q1', to: 'q2', symbol: 'b' },
    ],
    startState: 'q0',
    acceptStates: ['q2'],
};

describe('runDFA', () => {
    test.each([
        ['ab', true],
        ['aab', true],
        ['abab', true],
        ['bbab', true],
        ['', false],
        ['a', false],
        ['ba', false],
        ['aabb', false],
    ])('%s -> accepted=%s', (input, expected) => {
        expect(runDFA(endsWithAb, input).accepted).toBe(expected);
    });

    test('rejects input containing a symbol outside the alphabet', () => {
        // "ab" alone is accepting, so a naive implementation reports ACCEPTED.
        const result = runDFA(endsWithAb, 'abxyz');
        expect(result.accepted).toBe(false);
        expect(result.rejectedBecause).toBe('symbol');
    });

    test('rejects when the machine has no transition to take', () => {
        const partial = {
            ...endsWithAb,
            transitions: { q0: { a: 'q1' }, q1: { b: 'q2' } },
            hasTransition(from, symbol) {
                return this.transitions[from]?.[symbol] !== undefined;
            },
        };
        // Reaches accepting q2 on "ab", then has nowhere to go on "a".
        const result = runDFA(partial, 'aba');
        expect(result.accepted).toBe(false);
        expect(result.rejectedBecause).toBe('transition');
    });

    test('emits one step per consumed symbol plus the initial configuration', () => {
        expect(runDFA(endsWithAb, 'aab').steps).toHaveLength(4);
    });
});

describe('runNFA', () => {
    test.each([
        ['ab', true],
        ['aab', true],
        ['bbab', true],
        ['', false],
        ['ba', false],
        ['abb', false],
    ])('%s -> accepted=%s', (input, expected) => {
        expect(runNFA(endsWithAbNfa, input).accepted).toBe(expected);
    });

    test('rejects input containing a symbol outside the alphabet', () => {
        const result = runNFA(endsWithAbNfa, 'abz');
        expect(result.accepted).toBe(false);
        expect(result.rejectedBecause).toBe('symbol');
    });

    test('rejects when every path dies before the input is consumed', () => {
        // q0 has no transition on 'b', so reading "b" kills the computation.
        const strict = {
            states: ['q0', 'q1'],
            alphabet: ['a', 'b'],
            transitions: [{ from: 'q0', to: 'q1', symbol: 'a' }],
            startState: 'q0',
            acceptStates: ['q1'],
        };
        const result = runNFA(strict, 'ab');
        expect(result.accepted).toBe(false);
        expect(result.rejectedBecause).toBe('dead');
    });

    test('follows the ε-closure of the start state', () => {
        // q0 -ε-> q1, and q1 accepts, so the empty string is accepted.
        const epsilon = {
            states: ['q0', 'q1'],
            alphabet: ['a'],
            transitions: [{ from: 'q0', to: 'q1', symbol: 'ε' }],
            startState: 'q0',
            acceptStates: ['q1'],
        };
        const result = runNFA(epsilon, '');
        expect(result.accepted).toBe(true);
        expect(result.finalStates).toEqual(expect.arrayContaining(['q0', 'q1']));
    });

    test('tracks the whole active set, not a single path', () => {
        // After "a" the machine is in both q0 (loop) and q1 (guess).
        const result = runNFA(endsWithAbNfa, 'a');
        expect(result.steps[1].states.sort()).toEqual(['q0', 'q1']);
    });
});
