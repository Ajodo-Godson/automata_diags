export const useExamples = () => {
    const examples = {
        'basic_nfa': {
            name: 'Ends with "ab"',
            description: 'Accepts strings ending with "ab"',
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
        'contains_aa': {
            name: 'Contains "aa"',
            description: 'Accepts strings containing "aa"',
            states: ['q0', 'q1', 'q2'],
            alphabet: ['a', 'b'],
            transitions: [
                { from: 'q0', to: 'q0', symbol: 'a' },
                { from: 'q0', to: 'q0', symbol: 'b' },
                { from: 'q0', to: 'q1', symbol: 'a' },
                { from: 'q1', to: 'q2', symbol: 'a' },
                { from: 'q2', to: 'q2', symbol: 'a' },
                { from: 'q2', to: 'q2', symbol: 'b' },
            ],
            startState: 'q0',
            acceptStates: ['q2']
        },
        'epsilon_nfa': {
            name: 'Even a\'s OR Even b\'s',
            description: 'ε-NFA with parallel paths: accepts if even a\'s OR even b\'s',
            states: ['q0', 'q1', 'q2', 'q3', 'q4'],
            alphabet: ['a', 'b', 'ε'],
            transitions: [
                // Start branches via ε to both paths
                { from: 'q0', to: 'q1', symbol: 'ε' },
                { from: 'q0', to: 'q3', symbol: 'ε' },
                
                // Path 1: Track a's (q1=even a's, q2=odd a's)
                { from: 'q1', to: 'q2', symbol: 'a' },
                { from: 'q2', to: 'q1', symbol: 'a' },
                { from: 'q1', to: 'q1', symbol: 'b' },
                { from: 'q2', to: 'q2', symbol: 'b' },
                
                // Path 2: Track b's (q3=even b's, q4=odd b's)
                { from: 'q3', to: 'q3', symbol: 'a' },
                { from: 'q4', to: 'q4', symbol: 'a' },
                { from: 'q3', to: 'q4', symbol: 'b' },
                { from: 'q4', to: 'q3', symbol: 'b' },
            ],
            startState: 'q0',
            acceptStates: ['q1', 'q3']
        },
        'starts_with_a': {
            name: 'Starts with "a"',
            description: 'Non-deterministic choice on first "a": accepts strings starting with "a" followed by any characters',
            states: ['q0', 'q1', 'q2'],
            alphabet: ['a', 'b'],
            transitions: [
                { from: 'q0', to: 'q1', symbol: 'a' },
                { from: 'q0', to: 'q2', symbol: 'a' },
                { from: 'q1', to: 'q1', symbol: 'a' },
                { from: 'q1', to: 'q1', symbol: 'b' },
                { from: 'q2', to: 'q2', symbol: 'b' },
            ],
            startState: 'q0',
            acceptStates: ['q1']
        }
    };

    return { examples };
};