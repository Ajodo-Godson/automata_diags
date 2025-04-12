// import { DFAExample } from './types';

export const DFA_EXAMPLES = {
    "ends_with_ab": {
        name: "Ends with 'ab'",
        states: ['q0', 'q1', 'q2'],
        alphabet: ['a', 'b'],
        transitions: {
            'q0': { a: 'q1', b: 'q0' },
            'q1': { a: 'q1', b: 'q2' },
            'q2': { a: 'q1', b: 'q0' }
        },
        startState: 'q0',
        acceptStates: new Set(['q2']),
        description: "Accepts strings that end with 'ab'"
    },
    "contains_aa": {
        name: "Contains 'aa'",
        states: ['q0', 'q1', 'q2'],
        alphabet: ['a', 'b'],
        transitions: {
            'q0': { a: 'q1', b: 'q0' },
            'q1': { a: 'q2', b: 'q0' },
            'q2': { a: 'q2', b: 'q2' }
        },
        startState: 'q0',
        acceptStates: new Set(['q2']),
        description: "Accepts strings containing 'aa'"
    },
    // Easy to add more examples
};

// Hook for loading examples
export const useExamples = () => {
    return { examples: DFA_EXAMPLES };
}; 