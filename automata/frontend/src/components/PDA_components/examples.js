import { useMemo } from 'react';

// 1. Defined outside the hook to prevent memory re-allocation on every render
const STATIC_EXAMPLES = {
    balanced_parentheses: {
        name: 'Balanced Parentheses',
        states: ['q0', 'q1'],
        alphabet: ['(', ')'],
        stackAlphabet: ['Z', '('],
        transitions: [
            { from: 'q0', input: '(', pop: 'Z', to: 'q0', push: '(Z' },
            { from: 'q0', input: '(', pop: '(', to: 'q0', push: '((' },
            { from: 'q0', input: ')', pop: '(', to: 'q0', push: 'ε' },
            { from: 'q0', input: 'ε', pop: 'Z', to: 'q1', push: 'Z' }
        ],
        startState: 'q0',
        startStackSymbol: 'Z',
        acceptStates: ['q1']
    },
    equal_as_bs: {
        name: 'Equal a\'s and b\'s',
        states: ['q0', 'q1'],
        alphabet: ['a', 'b'],
        stackAlphabet: ['Z', 'A', 'B'],
        transitions: [
            { from: 'q0', input: 'a', pop: 'Z', to: 'q0', push: 'AZ' },
            { from: 'q0', input: 'a', pop: 'A', to: 'q0', push: 'AA' },
            { from: 'q0', input: 'a', pop: 'B', to: 'q0', push: 'ε' },
            { from: 'q0', input: 'b', pop: 'Z', to: 'q0', push: 'BZ' },
            { from: 'q0', input: 'b', pop: 'B', to: 'q0', push: 'BB' },
            { from: 'q0', input: 'b', pop: 'A', to: 'q0', push: 'ε' },
            { from: 'q0', input: 'ε', pop: 'Z', to: 'q1', push: 'Z' }
        ],
        startState: 'q0',
        startStackSymbol: 'Z',
        acceptStates: ['q1']
    },
    an_bn: {
        name: 'a^n b^n',
        description: 'Accepts strings of the form a^n b^n (including empty string where n=0)',
        states: ['q0', 'q1', 'q2'],
        alphabet: ['a', 'b'],
        stackAlphabet: ['Z', 'A'],
        transitions: [
            { from: 'q0', input: 'a', pop: 'Z', to: 'q0', push: 'AZ' },
            { from: 'q0', input: 'a', pop: 'A', to: 'q0', push: 'AA' },
            { from: 'q0', input: 'b', pop: 'A', to: 'q1', push: 'ε' },
            { from: 'q1', input: 'b', pop: 'A', to: 'q1', push: 'ε' },
            { from: 'q1', input: 'ε', pop: 'Z', to: 'q2', push: 'Z' },
            // FIX: Added transition for n=0 (empty string)
            { from: 'q0', input: 'ε', pop: 'Z', to: 'q2', push: 'Z' }
        ],
        startState: 'q0',
        startStackSymbol: 'Z',
        acceptStates: ['q2']
    },
    palindrome_ab: {
        name: 'Palindrome over {a,b}',
        description: 'Accepts palindromes over alphabet {a,b} (Non-Deterministic)',
        states: ['q0', 'q1', 'q2'],
        alphabet: ['a', 'b'],
        stackAlphabet: ['Z', 'A', 'B'],
        transitions: [
            // Push phase
            { from: 'q0', input: 'a', pop: 'Z', to: 'q0', push: 'AZ' },
            { from: 'q0', input: 'a', pop: 'A', to: 'q0', push: 'AA' },
            { from: 'q0', input: 'a', pop: 'B', to: 'q0', push: 'AB' },
            { from: 'q0', input: 'b', pop: 'Z', to: 'q0', push: 'BZ' },
            { from: 'q0', input: 'b', pop: 'A', to: 'q0', push: 'BA' },
            { from: 'q0', input: 'b', pop: 'B', to: 'q0', push: 'BB' },
            
            // Guess middle (even length) - epsilon transition
            { from: 'q0', input: 'ε', pop: 'A', to: 'q1', push: 'A' },
            { from: 'q0', input: 'ε', pop: 'B', to: 'q1', push: 'B' },
            { from: 'q0', input: 'ε', pop: 'Z', to: 'q1', push: 'Z' },
            
            // Guess middle (odd length) - consume char
            { from: 'q0', input: 'a', pop: 'A', to: 'q1', push: 'A' },
            { from: 'q0', input: 'a', pop: 'B', to: 'q1', push: 'B' },
            { from: 'q0', input: 'a', pop: 'Z', to: 'q1', push: 'Z' },
            { from: 'q0', input: 'b', pop: 'A', to: 'q1', push: 'A' },
            { from: 'q0', input: 'b', pop: 'B', to: 'q1', push: 'B' },
            { from: 'q0', input: 'b', pop: 'Z', to: 'q1', push: 'Z' },
            
            // Match phase
            { from: 'q1', input: 'a', pop: 'A', to: 'q1', push: 'ε' },
            { from: 'q1', input: 'b', pop: 'B', to: 'q1', push: 'ε' },
            
            // Accept
            { from: 'q1', input: 'ε', pop: 'Z', to: 'q2', push: 'Z' }
        ],
        startState: 'q0',
        startStackSymbol: 'Z',
        acceptStates: ['q2']
    },
    balanced_brackets: {
        name: 'Balanced Brackets (multiple types)',
        description: 'Accepts strings with balanced (), [], and {} brackets',
        states: ['q0', 'q1'],
        alphabet: ['(', ')', '[', ']', '{', '}'],
        stackAlphabet: ['Z', '(', '[', '{'],
        transitions: [
            { from: 'q0', input: '(', pop: 'Z', to: 'q0', push: '(Z' },
            { from: 'q0', input: '(', pop: '(', to: 'q0', push: '((' },
            { from: 'q0', input: '(', pop: '[', to: 'q0', push: '([' },
            { from: 'q0', input: '(', pop: '{', to: 'q0', push: '({' },
            { from: 'q0', input: '[', pop: 'Z', to: 'q0', push: '[Z' },
            { from: 'q0', input: '[', pop: '(', to: 'q0', push: '[(' },
            { from: 'q0', input: '[', pop: '[', to: 'q0', push: '[[' },
            { from: 'q0', input: '[', pop: '{', to: 'q0', push: '[{' },
            { from: 'q0', input: '{', pop: 'Z', to: 'q0', push: '{Z' },
            { from: 'q0', input: '{', pop: '(', to: 'q0', push: '{(' },
            { from: 'q0', input: '{', pop: '[', to: 'q0', push: '{[' },
            { from: 'q0', input: '{', pop: '{', to: 'q0', push: '{{' },
            { from: 'q0', input: ')', pop: '(', to: 'q0', push: 'ε' },
            { from: 'q0', input: ']', pop: '[', to: 'q0', push: 'ε' },
            { from: 'q0', input: '}', pop: '{', to: 'q0', push: 'ε' },
            { from: 'q0', input: 'ε', pop: 'Z', to: 'q1', push: 'Z' }
        ],
        startState: 'q0',
        startStackSymbol: 'Z',
        acceptStates: ['q1']
    }
};

export const useExamples = () => {
    // 2. Returns the static object directly. 
    // useMemo with empty dependency [] ensures the object reference remains stable 
    // across re-renders (useful if you pass this object to child components).
    const examples = useMemo(() => STATIC_EXAMPLES, []);

    return { examples };
};