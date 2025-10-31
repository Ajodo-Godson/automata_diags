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
            states: ['q0', 'q1', 'q2'],
            alphabet: ['a', 'b'],
            stackAlphabet: ['Z', 'A'],
            transitions: [
                { from: 'q0', input: 'a', pop: 'Z', to: 'q0', push: 'AZ' },
                { from: 'q0', input: 'a', pop: 'A', to: 'q0', push: 'AA' },
                { from: 'q0', input: 'b', pop: 'A', to: 'q1', push: 'ε' },
                { from: 'q1', input: 'b', pop: 'A', to: 'q1', push: 'ε' },
                { from: 'q1', input: 'ε', pop: 'Z', to: 'q2', push: 'Z' }
            ],
            startState: 'q0',
            startStackSymbol: 'Z',
            acceptStates: ['q2']
        }
    });

    return { examples };
};