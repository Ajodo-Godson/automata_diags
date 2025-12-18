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
 * Simulates a CFG to check if it generates a given string using CYK algorithm
 * @param {Object} cfg - CFG with variables, terminals, rules, startVariable
 * @param {string} input - Input string to test
 * @returns {boolean} - true if generated, false otherwise
 */
export const simulateCFG = (cfg, input) => {
    if (!cfg || !cfg.rules || !cfg.startVariable) {
        return false;
    }

    // Handle empty string
    if (input === '' || input.length === 0) {
        return cfg.rules.some(r => 
            r.left === cfg.startVariable && 
            (r.right === 'ε' || r.right === '' || r.right === 'epsilon')
        );
    }

    // Simple derivation check for small inputs
    // Try to derive the string using BFS
    const maxIterations = 5000;
    const queue = [cfg.startVariable];
    const visited = new Set([cfg.startVariable]);
    let iterations = 0;

    while (queue.length > 0 && iterations < maxIterations) {
        iterations++;
        const current = queue.shift();

        // Check if we've derived the target string
        if (current === input) {
            return true;
        }

        // Skip if current string is longer than target (won't match)
        if (current.length > input.length * 2) {
            continue;
        }

        // Try applying each rule
        for (const rule of cfg.rules) {
            const idx = current.indexOf(rule.left);
            if (idx !== -1) {
                const rightSide = rule.right === 'ε' ? '' : rule.right;
                const newString = current.slice(0, idx) + rightSide + current.slice(idx + 1);
                
                if (!visited.has(newString) && newString.length <= input.length * 2) {
                    visited.add(newString);
                    queue.push(newString);
                }
            }
        }
    }

    return false;
};

/**
 * Validates a user's CFG against test cases
 */
export const validateCFGChallenge = (userCFG, testCases) => {
    if (!testCases || testCases.length === 0) {
        return { passed: 0, total: 0, results: [], valid: false };
    }

    let passed = 0;
    const results = testCases.map(testCase => {
        const actual = simulateCFG(userCFG, testCase.input);
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
 * Simulates a Turing Machine on a given input
 * @param {Object} tm - TM with rules array
 * @param {string} input - Input string to test
 * @returns {boolean} - true if accepted, false otherwise
 */
export const simulateTM = (tm, input) => {
    if (!tm || !tm.rules || tm.rules.length === 0) {
        return false;
    }

    const blankSymbol = tm.blankSymbol || '□';
    const maxSteps = 10000;
    
    // Initialize tape
    let tape = input.split('');
    if (tape.length === 0) tape = [blankSymbol];
    for (let i = 0; i < 50; i++) tape.push(blankSymbol);
    
    let headPosition = 0;
    let currentState = 'q0';
    let steps = 0;

    while (steps < maxSteps) {
        steps++;
        
        // Check halt states
        if (currentState === 'qaccept' || currentState === tm.acceptState) {
            return true;
        }
        if (currentState === 'qreject' || currentState === tm.rejectState) {
            return false;
        }

        // Ensure head is within bounds
        if (headPosition < 0) {
            tape.unshift(blankSymbol);
            headPosition = 0;
        }
        if (headPosition >= tape.length) {
            tape.push(blankSymbol);
        }

        const currentSymbol = tape[headPosition];
        
        // Find matching rule
        const rule = tm.rules.find(r =>
            r.currentState === currentState && r.readSymbol === currentSymbol
        );

        if (!rule) {
            return false;
        }

        // Execute transition
        tape[headPosition] = rule.writeSymbol;
        currentState = rule.nextState;
        
        if (rule.direction === 'R') headPosition++;
        else if (rule.direction === 'L') headPosition--;
    }

    return false;
};

/**
 * Validates a user's TM against test cases
 */
export const validateTMChallenge = (userTM, testCases) => {
    if (!testCases || testCases.length === 0) {
        return { passed: 0, total: 0, results: [], valid: false };
    }

    let passed = 0;
    const results = testCases.map(testCase => {
        const actual = simulateTM(userTM, testCase.input);
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
        case 'CFG':
            return validateCFGChallenge(userAutomaton, testCases);
        case 'TM':
            return validateTMChallenge(userAutomaton, testCases);
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
    simulateCFG,
    simulateTM,
    validateDFAChallenge,
    validateNFAChallenge,
    validatePDAChallenge,
    validateCFGChallenge,
    validateTMChallenge,
    validateChallenge
};
