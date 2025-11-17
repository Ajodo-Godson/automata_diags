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
        }
    });

    return { examples };
};