export const useExamples = () => {
    const examples = {
        'basic_nfa': {
            name: 'Basic NFA',
            description: 'Simple NFA accepting strings ending with "ab"',
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
            name: 'ε-NFA',
            description: 'NFA with epsilon transitions',
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
            name: 'Union NFA',
            description: 'NFA accepting strings with "aa" OR "bb"',
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
        }
    };

    return { examples };
};