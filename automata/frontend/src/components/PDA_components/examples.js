import { useState } from 'react';

export const useExamples = () => {
    const [examples] = useState({
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
                // Push A when we see 'a' (tracking excess a's)
                { from: 'q0', input: 'a', pop: 'Z', to: 'q0', push: 'AZ' },
                { from: 'q0', input: 'a', pop: 'A', to: 'q0', push: 'AA' },
                { from: 'q0', input: 'a', pop: 'B', to: 'q0', push: 'ε' }, // Cancel out excess b's
                
                // Push B when we see 'b' (tracking excess b's)
                { from: 'q0', input: 'b', pop: 'Z', to: 'q0', push: 'BZ' },
                { from: 'q0', input: 'b', pop: 'B', to: 'q0', push: 'BB' },
                { from: 'q0', input: 'b', pop: 'A', to: 'q0', push: 'ε' }, // Cancel out excess a's
                
                // Epsilon transition to accept state when stack only has Z
                { from: 'q0', input: 'ε', pop: 'Z', to: 'q1', push: 'Z' }
            ],
            startState: 'q0',
            startStackSymbol: 'Z',
            acceptStates: ['q1']
        },
        an_bn: {
            name: 'a^n b^n',
            description: 'Accepts strings of the form a^n b^n (equal number of a\'s followed by equal number of b\'s)',
            states: ['q0', 'q1', 'q2'],
            alphabet: ['a', 'b'],
            stackAlphabet: ['Z', 'A'],
            transitions: [
                // Push A for each 'a'
                { from: 'q0', input: 'a', pop: 'Z', to: 'q0', push: 'AZ' },
                { from: 'q0', input: 'a', pop: 'A', to: 'q0', push: 'AA' },
                // Pop A for each 'b'
                { from: 'q0', input: 'b', pop: 'A', to: 'q1', push: 'ε' },
                { from: 'q1', input: 'b', pop: 'A', to: 'q1', push: 'ε' },
                // Accept when stack only has Z
                { from: 'q1', input: 'ε', pop: 'Z', to: 'q2', push: 'Z' }
            ],
            startState: 'q0',
            startStackSymbol: 'Z',
            acceptStates: ['q2']
        },
        palindrome_ab: {
            name: 'Palindrome over {a,b}',
            description: 'Accepts palindromes over alphabet {a,b}',
            states: ['q0', 'q1', 'q2'],
            alphabet: ['a', 'b'],
            stackAlphabet: ['Z', 'A', 'B'],
            transitions: [
                // Push symbols onto stack
                { from: 'q0', input: 'a', pop: 'Z', to: 'q0', push: 'AZ' },
                { from: 'q0', input: 'a', pop: 'A', to: 'q0', push: 'AA' },
                { from: 'q0', input: 'a', pop: 'B', to: 'q0', push: 'BA' },
                { from: 'q0', input: 'b', pop: 'Z', to: 'q0', push: 'BZ' },
                { from: 'q0', input: 'b', pop: 'A', to: 'q0', push: 'AB' },
                { from: 'q0', input: 'b', pop: 'B', to: 'q0', push: 'BB' },
                
                // Non-deterministically guess middle point and transition to checking
                // For even-length palindromes: go directly to checking (keep top symbol)
                { from: 'q0', input: 'ε', pop: 'Z', to: 'q1', push: 'Z' }, // Empty string
                { from: 'q0', input: 'ε', pop: 'A', to: 'q1', push: 'A' }, // Even-length: keep A
                { from: 'q0', input: 'ε', pop: 'B', to: 'q1', push: 'B' }, // Even-length: keep B
                
                // For odd-length palindromes: skip middle symbol (pop without reading)
                { from: 'q0', input: 'ε', pop: 'A', to: 'q1', push: 'ε' }, // Odd-length: skip A
                { from: 'q0', input: 'ε', pop: 'B', to: 'q1', push: 'ε' }, // Odd-length: skip B
                
                // Match remaining input with stack (pop matching symbols)
                { from: 'q1', input: 'a', pop: 'A', to: 'q1', push: 'ε' },
                { from: 'q1', input: 'b', pop: 'B', to: 'q1', push: 'ε' },
                
                // Accept when stack only has Z (all symbols matched)
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
                // Push opening brackets
                { from: 'q0', input: '(', pop: 'Z', to: 'q0', push: '(Z' },
                { from: 'q0', input: '(', pop: '(', to: 'q0', push: '((' },
                { from: 'q0', input: '(', pop: '[', to: 'q0', push: '([' },
                { from: 'q0', input: '(', pop: '{', to: 'q0', push: '({' },
                
                { from: 'q0', input: '[', pop: 'Z', to: 'q0', push: '[Z' },
                { from: 'q0', input: '[', pop: '(', to: 'q0', push: '([' },
                { from: 'q0', input: '[', pop: '[', to: 'q0', push: '[[' },
                { from: 'q0', input: '[', pop: '{', to: 'q0', push: '[{' },
                
                { from: 'q0', input: '{', pop: 'Z', to: 'q0', push: '{Z' },
                { from: 'q0', input: '{', pop: '(', to: 'q0', push: '{(' },
                { from: 'q0', input: '{', pop: '[', to: 'q0', push: '{[' },
                { from: 'q0', input: '{', pop: '{', to: 'q0', push: '{{' },
                
                // Pop matching closing brackets
                { from: 'q0', input: ')', pop: '(', to: 'q0', push: 'ε' },
                { from: 'q0', input: ']', pop: '[', to: 'q0', push: 'ε' },
                { from: 'q0', input: '}', pop: '{', to: 'q0', push: 'ε' },
                
                // Accept when stack only has Z
                { from: 'q0', input: 'ε', pop: 'Z', to: 'q1', push: 'Z' }
            ],
            startState: 'q0',
            startStackSymbol: 'Z',
            acceptStates: ['q1']
        },
        an_bm_cn_plus_m: {
            name: 'a^n b^m c^(n+m)',
            description: 'Accepts strings with n a\'s, m b\'s, and (n+m) c\'s',
            states: ['q0', 'q1', 'q2', 'q3'],
            alphabet: ['a', 'b', 'c'],
            stackAlphabet: ['Z', 'A', 'B'],
            transitions: [
                // Push A for each 'a'
                { from: 'q0', input: 'a', pop: 'Z', to: 'q0', push: 'AZ' },
                { from: 'q0', input: 'a', pop: 'A', to: 'q0', push: 'AA' },
                { from: 'q0', input: 'a', pop: 'B', to: 'q0', push: 'BA' },
                // Push B for each 'b'
                { from: 'q0', input: 'b', pop: 'A', to: 'q1', push: 'A' },
                { from: 'q0', input: 'b', pop: 'Z', to: 'q1', push: 'Z' },
                { from: 'q1', input: 'b', pop: 'A', to: 'q1', push: 'A' },
                { from: 'q1', input: 'b', pop: 'B', to: 'q1', push: 'BB' },
                { from: 'q1', input: 'b', pop: 'Z', to: 'q1', push: 'BZ' },
                // Pop A or B for each 'c'
                { from: 'q1', input: 'c', pop: 'A', to: 'q2', push: 'ε' },
                { from: 'q1', input: 'c', pop: 'B', to: 'q2', push: 'ε' },
                { from: 'q2', input: 'c', pop: 'A', to: 'q2', push: 'ε' },
                { from: 'q2', input: 'c', pop: 'B', to: 'q2', push: 'ε' },
                // Accept when stack only has Z
                { from: 'q2', input: 'ε', pop: 'Z', to: 'q3', push: 'Z' }
            ],
            startState: 'q0',
            startStackSymbol: 'Z',
            acceptStates: ['q3']
        }
    });

    return { examples };
};