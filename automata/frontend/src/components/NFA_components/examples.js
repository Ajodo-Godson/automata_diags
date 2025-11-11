export const useExamples = () => {
    const examples = {
        'basic_nfa': {
            name: 'Strings Ending with "ab"',
            description: 'Accepts any string that ends with the pattern "ab" (e.g., ab, aab, bab, aaab)',
            states: ['q0', 'q1', 'q2'],
            alphabet: ['a', 'b'],
            transitions: [
                { from: 'q0', to: 'q0', symbol: 'a' },
                { from: 'q0', to: 'q0', symbol: 'b' },
                { from: 'q0', to: 'q1', symbol: 'a' },
                { from: 'q1', to: 'q2', symbol: 'b' },
            ],
            startState: 'q0',
            acceptStates: ['q2']
        },
        'epsilon_nfa': {
            name: 'Even a\'s OR Even b\'s (ε-NFA)',
            description: 'Uses ε-transitions to branch: accepts strings with even number of a\'s OR even number of b\'s',
            states: ['q0', 'q1', 'q2', 'q3'],
            alphabet: ['a', 'b', 'ε'],
            transitions: [
                { from: 'q0', to: 'q1', symbol: 'ε' },
                { from: 'q0', to: 'q2', symbol: 'ε' },
                { from: 'q1', to: 'q1', symbol: 'a' },
                { from: 'q2', to: 'q2', symbol: 'b' },
                { from: 'q1', to: 'q3', symbol: 'a' },
                { from: 'q2', to: 'q3', symbol: 'b' },
            ],
            startState: 'q0',
            acceptStates: ['q3']
        },
        'or_nfa': {
            name: 'Contains "aa" OR "bb"',
            description: 'Accepts strings containing consecutive double letters: either "aa" or "bb" as a substring',
            states: ['q0', 'q1', 'q2', 'q3', 'q4'],
            alphabet: ['a', 'b'],
            transitions: [
                { from: 'q0', to: 'q0', symbol: 'a' },
                { from: 'q0', to: 'q0', symbol: 'b' },
                { from: 'q0', to: 'q1', symbol: 'a' },
                { from: 'q0', to: 'q3', symbol: 'b' },
                { from: 'q1', to: 'q2', symbol: 'a' },
                { from: 'q3', to: 'q4', symbol: 'b' },
                { from: 'q2', to: 'q2', symbol: 'a' },
                { from: 'q2', to: 'q2', symbol: 'b' },
                { from: 'q4', to: 'q4', symbol: 'a' },
                { from: 'q4', to: 'q4', symbol: 'b' },
            ],
            startState: 'q0',
            acceptStates: ['q2', 'q4']
        },
        'binary_divisible': {
            name: 'Binary Divisible by 3',
            description: 'Accepts binary numbers divisible by 3 (e.g., 0, 11, 110, 1001)',
            states: ['q0', 'q1', 'q2'],
            alphabet: ['0', '1'],
            transitions: [
                { from: 'q0', to: 'q0', symbol: '0' },
                { from: 'q0', to: 'q1', symbol: '1' },
                { from: 'q1', to: 'q2', symbol: '0' },
                { from: 'q1', to: 'q0', symbol: '1' },
                { from: 'q2', to: 'q1', symbol: '0' },
                { from: 'q2', to: 'q2', symbol: '1' },
            ],
            startState: 'q0',
            acceptStates: ['q0']
        }
    };

    return { examples };
};