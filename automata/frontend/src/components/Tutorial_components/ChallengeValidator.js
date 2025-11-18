// Challenge Validator - validates user automata against test cases

/**
 * Simulates a DFA on a given input string
 * @param {Object} dfa - DFA definition with states, alphabet, transitions, startState, acceptStates
 * @param {string} input - Input string to test
 * @returns {boolean} - true if accepted, false if rejected
 */
export const simulateDFA = (dfa, input) => {
    if (!dfa || !dfa.startState || !dfa.transitions) {
        return false;
    }

    let currentState = dfa.startState;
    
    // Process each character in the input
    for (let i = 0; i < input.length; i++) {
        const symbol = input[i];
        
        // Check if current state has transitions
        if (!dfa.transitions[currentState]) {
            return false;
        }
        
        // Get next state
        const nextState = dfa.transitions[currentState][symbol];
        
        if (nextState === undefined || nextState === null) {
            // No transition defined - reject
            return false;
        }
        
        currentState = nextState;
    }
    
    // Check if final state is an accept state
    return dfa.acceptStates && dfa.acceptStates.includes(currentState);
};

/**
 * Validates a user's DFA against a set of test cases
 * @param {Object} userDFA - The DFA built by the user
 * @param {Array} testCases - Array of {input, expected, description}
 * @returns {Object} - {passed, total, results: [{test, actual, passed}]}
 */
export const validateDFAChallenge = (userDFA, testCases) => {
    if (!testCases || testCases.length === 0) {
        return { passed: 0, total: 0, results: [], valid: false };
    }

    let passed = 0;
    const results = testCases.map(testCase => {
        const actual = simulateDFA(userDFA, testCase.input);
        const isPassed = actual === testCase.expected;
        
        if (isPassed) {
            passed++;
        }
        
        return {
            input: testCase.input,
            expected: testCase.expected,
            actual: actual,
            passed: isPassed,
            description: testCase.description || ''
        };
    });

    return {
        passed,
        total: testCases.length,
        results,
        valid: true,
        percentage: Math.round((passed / testCases.length) * 100)
    };
};

/**
 * Simulates an NFA on a given input string
 * @param {Object} nfa - NFA definition
 * @param {string} input - Input string to test
 * @returns {boolean} - true if accepted, false if rejected
 */
export const simulateNFA = (nfa, input) => {
    if (!nfa || !nfa.startState || !nfa.transitions) {
        return false;
    }

    // Compute epsilon closure
    const epsilonClosure = (states) => {
        const closure = new Set(states);
        const stack = [...states];
        
        while (stack.length > 0) {
            const state = stack.pop();
            const epsilonTransitions = nfa.transitions[state]?.['ε'] || 
                                      nfa.transitions[state]?.['epsilon'] || 
                                      nfa.transitions[state]?.[''] || [];
            
            const epsilonArray = Array.isArray(epsilonTransitions) ? epsilonTransitions : [epsilonTransitions];
            
            for (const nextState of epsilonArray) {
                if (nextState && !closure.has(nextState)) {
                    closure.add(nextState);
                    stack.push(nextState);
                }
            }
        }
        
        return Array.from(closure);
    };

    // Start with epsilon closure of start state
    let currentStates = epsilonClosure([nfa.startState]);
    
    // Process each character
    for (let i = 0; i < input.length; i++) {
        const symbol = input[i];
        const nextStates = new Set();
        
        // For each current state, find all possible next states
        for (const state of currentStates) {
            if (nfa.transitions[state] && nfa.transitions[state][symbol]) {
                const transitions = nfa.transitions[state][symbol];
                const transArray = Array.isArray(transitions) ? transitions : [transitions];
                
                for (const nextState of transArray) {
                    if (nextState) {
                        nextStates.add(nextState);
                    }
                }
            }
        }
        
        if (nextStates.size === 0) {
            return false;
        }
        
        // Compute epsilon closure of next states
        currentStates = epsilonClosure(Array.from(nextStates));
    }
    
    // Check if any final state is an accept state
    return currentStates.some(state => 
        nfa.acceptStates && nfa.acceptStates.includes(state)
    );
};

/**
 * Validates a user's NFA against test cases
 * @param {Object} userNFA - The NFA built by the user
 * @param {Array} testCases - Array of test cases
 * @returns {Object} - Validation results
 */
export const validateNFAChallenge = (userNFA, testCases) => {
    if (!testCases || testCases.length === 0) {
        return { passed: 0, total: 0, results: [], valid: false };
    }

    let passed = 0;
    const results = testCases.map(testCase => {
        const actual = simulateNFA(userNFA, testCase.input);
        const isPassed = actual === testCase.expected;
        
        if (isPassed) {
            passed++;
        }
        
        return {
            input: testCase.input,
            expected: testCase.expected,
            actual: actual,
            passed: isPassed,
            description: testCase.description || ''
        };
    });

    return {
        passed,
        total: testCases.length,
        results,
        valid: true,
        percentage: Math.round((passed / testCases.length) * 100)
    };
};

/**
 * Simulates a PDA on a given input string
 * @param {Object} pda - PDA definition
 * @param {string} input - Input string to test
 * @returns {boolean} - true if accepted, false if rejected
 */
export const simulatePDA = (pda, input) => {
    if (!pda || !pda.startState || !pda.transitions || !pda.startStackSymbol) {
        return false;
    }

    // BFS to explore all possible configurations
    const configurations = [{
        state: pda.startState,
        stack: [pda.startStackSymbol],
        inputPosition: 0
    }];

    const visited = new Set();
    const maxIterations = 10000;
    let iterationCount = 0;

    while (configurations.length > 0 && iterationCount < maxIterations) {
        iterationCount++;
        const config = configurations.shift();
        const { state, stack, inputPosition } = config;

        // Create unique key to avoid infinite loops
        const configKey = `${state}|${stack.join(',')}|${inputPosition}`;
        if (visited.has(configKey)) {
            continue;
        }
        visited.add(configKey);

        // Check acceptance condition
        const stackIsValid = stack.length === 1 && stack[0] === pda.startStackSymbol;
        const acceptStatesSet = pda.acceptStates instanceof Set ? pda.acceptStates : new Set(pda.acceptStates || []);
        
        if (inputPosition >= input.length && acceptStatesSet.has(state) && stackIsValid) {
            return true; // Accepted!
        }

        const topOfStack = stack.length > 0 ? stack[stack.length - 1] : null;

        // Find applicable transitions
        const applicableTransitions = pda.transitions.filter(t => {
            const inputMatches = (inputPosition < input.length && t.input === input[inputPosition]) || 
                                (t.input === 'ε' || t.input === 'epsilon' || t.input === '');
            const stackMatches = (topOfStack && t.pop === topOfStack) || 
                               (t.pop === 'ε' || t.pop === 'epsilon' || t.pop === '');
            return t.from === state && inputMatches && stackMatches;
        });

        // Explore each possible transition
        for (const transition of applicableTransitions) {
            const newStack = [...stack];
            
            // Pop from stack if required
            if (transition.pop && transition.pop !== 'ε' && transition.pop !== 'epsilon' && transition.pop !== '') {
                if (newStack.length > 0 && newStack[newStack.length - 1] === transition.pop) {
                    newStack.pop();
                } else {
                    continue; // Can't apply this transition
                }
            }

            // Push to stack
            const pushSymbols = transition.push || '';
            if (pushSymbols && pushSymbols !== 'ε' && pushSymbols !== 'epsilon' && pushSymbols !== '') {
                // Push symbols in reverse order (rightmost symbol on top)
                for (let i = pushSymbols.length - 1; i >= 0; i--) {
                    newStack.push(pushSymbols[i]);
                }
            }

            // Determine new input position
            const consumesInput = transition.input && transition.input !== 'ε' && 
                                transition.input !== 'epsilon' && transition.input !== '';
            const newInputPosition = consumesInput ? inputPosition + 1 : inputPosition;

            configurations.push({
                state: transition.to,
                stack: newStack,
                inputPosition: newInputPosition
            });
        }
    }

    return false; // No accepting configuration found
};

/**
 * Validates a user's PDA against test cases
 * @param {Object} userPDA - The PDA built by the user
 * @param {Array} testCases - Array of test cases
 * @returns {Object} - Validation results
 */
export const validatePDAChallenge = (userPDA, testCases) => {
    if (!testCases || testCases.length === 0) {
        return { passed: 0, total: 0, results: [], valid: false };
    }

    let passed = 0;
    const results = testCases.map(testCase => {
        const actual = simulatePDA(userPDA, testCase.input);
        const isPassed = actual === testCase.expected;
        
        if (isPassed) {
            passed++;
        }
        
        return {
            input: testCase.input,
            expected: testCase.expected,
            actual: actual,
            passed: isPassed,
            description: testCase.description || ''
        };
    });

    return {
        passed,
        total: testCases.length,
        results,
        valid: true,
        percentage: Math.round((passed / testCases.length) * 100)
    };
};

/**
 * Main challenge validator - dispatches to appropriate validator
 * @param {string} automatonType - Type of automaton (DFA, NFA, etc.)
 * @param {Object} userAutomaton - User's automaton
 * @param {Array} testCases - Test cases to validate against
 * @returns {Object} - Validation results
 */
export const validateChallenge = (automatonType, userAutomaton, testCases) => {
    switch (automatonType) {
        case 'DFA':
            return validateDFAChallenge(userAutomaton, testCases);
        case 'NFA':
            return validateNFAChallenge(userAutomaton, testCases);
        case 'PDA':
            return validatePDAChallenge(userAutomaton, testCases);
        default:
            return { 
                passed: 0, 
                total: 0, 
                results: [], 
                valid: false,
                error: `Unsupported automaton type: ${automatonType}`
            };
    }
};

export default {
    simulateDFA,
    simulateNFA,
    simulatePDA,
    validateDFAChallenge,
    validateNFAChallenge,
    validatePDAChallenge,
    validateChallenge
};

