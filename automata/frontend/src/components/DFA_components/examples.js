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
    "even_number_of_as": {
        name: "Even # of a's",
        states: ['q0', 'q1'],
        alphabet: ['a', 'b'],
        transitions: {
            'q0': { a: 'q1', b: 'q0' },
            'q1': { a: 'q0', b: 'q1' }
        },
        startState: 'q0',
        acceptStates: new Set(['q0']),
        description: "Accepts strings with an even number of a's"
    },
    "divisible_by_3": {
        name: "Binary divisible by 3",
        states: ['q0', 'q1', 'q2'],
        alphabet: ['0', '1'],
        transitions: {
            'q0': { '0': 'q0', '1': 'q1' },
            'q1': { '0': 'q2', '1': 'q0' },
            'q2': { '0': 'q1', '1': 'q2' }
        },
        startState: 'q0',
        acceptStates: new Set(['q0']),
        description: "Accepts binary numbers divisible by 3"
    },
    "starts_with_ab": {
        name: "Starts with 'ab'",
        states: ['q0', 'q1', 'q2', 'q3'],
        alphabet: ['a', 'b'],
        transitions: {
            'q0': { a: 'q1', b: 'q3' },
            'q1': { a: 'q3', b: 'q2' },
            'q2': { a: 'q2', b: 'q2' },
            'q3': { a: 'q3', b: 'q3' }
        },
        startState: 'q0',
        acceptStates: new Set(['q2']),
        description: "Accepts strings that start with 'ab'"
    },
    "contains_aba": {
        name: "Contains 'aba'",
        states: ['q0', 'q1', 'q2', 'q3'],
        alphabet: ['a', 'b'],
        transitions: {
            'q0': { a: 'q1', b: 'q0' },
            'q1': { a: 'q1', b: 'q2' },
            'q2': { a: 'q3', b: 'q0' },
            'q3': { a: 'q3', b: 'q3' }
        },
        startState: 'q0',
        acceptStates: new Set(['q3']),
        description: "Accepts strings containing substring 'aba'"
    },
    "at_least_two_as": {
        name: "At least 2 a's",
        states: ['q0', 'q1', 'q2'],
        alphabet: ['a', 'b'],
        transitions: {
            'q0': { a: 'q1', b: 'q0' },
            'q1': { a: 'q2', b: 'q1' },
            'q2': { a: 'q2', b: 'q2' }
        },
        startState: 'q0',
        acceptStates: new Set(['q2']),
        description: "Accepts strings with at least 2 a's"
    },
    "even_parity": {
        name: "Even parity binary",
        states: ['q0', 'q1'],
        alphabet: ['0', '1'],
        transitions: {
            'q0': { '0': 'q0', '1': 'q1' },
            'q1': { '0': 'q1', '1': 'q0' }
        },
        startState: 'q0',
        acceptStates: new Set(['q0']),
        description: "Accepts binary strings with even number of 1's"
    },
    "no_consecutive_as": {
        name: "No consecutive a's",
        states: ['q0', 'q1', 'q2'],
        alphabet: ['a', 'b'],
        transitions: {
            'q0': { a: 'q1', b: 'q0' },
            'q1': { a: 'q2', b: 'q0' },
            'q2': { a: 'q2', b: 'q2' }
        },
        startState: 'q0',
        acceptStates: new Set(['q0', 'q1']),
        description: "Accepts strings with no consecutive a's"
    },
    "exactly_two_as": {
        name: "Exactly 2 a's",
        states: ['q0', 'q1', 'q2', 'q3'],
        alphabet: ['a', 'b'],
        transitions: {
            'q0': { a: 'q1', b: 'q0' },
            'q1': { a: 'q2', b: 'q1' },
            'q2': { a: 'q3', b: 'q2' },
            'q3': { a: 'q3', b: 'q3' }
        },
        startState: 'q0',
        acceptStates: new Set(['q2']),
        description: "Accepts strings with exactly 2 a's"
    },
};

// Hook for loading examples
export const useExamples = () => {
    return { examples: DFA_EXAMPLES };
}; 