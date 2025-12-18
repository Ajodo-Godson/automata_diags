// Challenge Validator - validates user automata against test cases

/**
 * Simulates a DFA on a given input string
 */
export const simulateDFA = (dfa, input) => {
    if (!dfa || !dfa.startState || !dfa.transitions) return false;

    let currentState = dfa.startState;
    const alphabet = new Set(dfa.alphabet || []);
    
    for (let i = 0; i < input.length; i++) {
        const symbol = input[i];
        if (!alphabet.has(symbol)) return false;
        
        const nextState = dfa.transitions[currentState]?.[symbol];
        if (nextState === undefined || nextState === null) return false;
        currentState = nextState;
    }
    
    if (dfa.acceptStates instanceof Set) return dfa.acceptStates.has(currentState);
    return Array.isArray(dfa.acceptStates) && dfa.acceptStates.includes(currentState);
};

export const validateDFAChallenge = (userDFA, testCases) => {
    if (!testCases) return { passed: 0, total: 0, results: [] };
    const results = testCases.map(tc => {
        const actual = simulateDFA(userDFA, tc.input);
        return { input: tc.input, expected: tc.expected, actual, passed: actual === tc.expected, description: tc.description };
    });
    const passed = results.filter(r => r.passed).length;
    return { passed, total: testCases.length, results, valid: true };
};

/**
 * Simulates an NFA on a given input string
 */
export const simulateNFA = (nfa, input) => {
    if (!nfa || !nfa.startState || !nfa.transitions) return false;

    const getEpsilonClosure = (states) => {
        const closure = new Set(states);
        const stack = [...states];
        while (stack.length > 0) {
            const q = stack.pop();
            const transitions = nfa.transitions.filter(t => t.from === q && (t.symbol === 'ε' || t.symbol === 'epsilon' || t.symbol === ''));
            for (const t of transitions) {
                if (!closure.has(t.to)) {
                    closure.add(t.to);
                    stack.push(t.to);
                }
            }
        }
        return Array.from(closure);
    };

    let currentStates = getEpsilonClosure([nfa.startState]);
    const alphabet = new Set(nfa.alphabet || []);

    for (let i = 0; i < input.length; i++) {
        const symbol = input[i];
        if (!alphabet.has(symbol)) return false;

        const nextStates = new Set();
        for (const q of currentStates) {
            const transitions = nfa.transitions.filter(t => t.from === q && t.symbol === symbol);
            for (const t of transitions) nextStates.add(t.to);
        }
        if (nextStates.size === 0) return false;
        currentStates = getEpsilonClosure(Array.from(nextStates));
    }

    const isAccepting = (q) => {
        if (nfa.acceptStates instanceof Set) return nfa.acceptStates.has(q);
        return Array.isArray(nfa.acceptStates) && nfa.acceptStates.includes(q);
    };
    return currentStates.some(isAccepting);
};

export const validateNFAChallenge = (userNFA, testCases) => {
    if (!testCases) return { passed: 0, total: 0, results: [] };
    const results = testCases.map(tc => {
        const actual = simulateNFA(userNFA, tc.input);
        return { input: tc.input, expected: tc.expected, actual, passed: actual === tc.expected, description: tc.description };
    });
    const passed = results.filter(r => r.passed).length;
    return { passed, total: testCases.length, results, valid: true };
};

/**
 * Simulates a PDA on a given input string
 */
export const simulatePDA = (pda, input) => {
    if (!pda || !pda.startState || !pda.transitions || !pda.startStackSymbol) return false;

    const configs = [{ state: pda.startState, stack: [pda.startStackSymbol], pos: 0 }];
    const visited = new Set();
    const maxIters = 10000;
    let iters = 0;

    const acceptStates = pda.acceptStates instanceof Set ? pda.acceptStates : new Set(pda.acceptStates || []);

    while (configs.length > 0 && iters < maxIters) {
        iters++;
        const { state, stack, pos } = configs.shift();
        const key = `${state}|${stack.join(',')}|${pos}`;
        if (visited.has(key)) continue;
        visited.add(key);

        // Final state acceptance
        if (pos === input.length && acceptStates.has(state)) return true;

        const top = stack.length > 0 ? stack[stack.length - 1] : null;
        const transitions = pda.transitions.filter(t => {
            const inMatch = (pos < input.length && t.input === input[pos]) || (t.input === 'ε' || t.input === '' || t.input === 'epsilon');
            const stackMatch = (top && t.pop === top) || (t.pop === 'ε' || t.pop === '' || t.pop === 'epsilon');
            return t.from === state && inMatch && stackMatch;
        });

        for (const t of transitions) {
            const nextStack = [...stack];
            
            // Handle Pop: If t.pop is not epsilon, it must be removed from the stack
            if (t.pop && t.pop !== 'ε' && t.pop !== 'epsilon' && t.pop !== '') {
                if (nextStack.length > 0 && nextStack[nextStack.length - 1] === t.pop) {
                    nextStack.pop();
                } else {
                    // This transition is actually not applicable because the pop symbol doesn't match the stack top
                    continue;
                }
            }
            
            // Handle Push: Add symbols to the stack
            const push = t.push || '';
            if (push && push !== 'ε' && push !== 'epsilon' && push !== '') {
                // Standard PDA: left-most symbol in push string becomes the new top
                for (let i = push.length - 1; i >= 0; i--) {
                    nextStack.push(push[i]);
                }
            }
            
            const consumes = t.input && t.input !== 'ε' && t.input !== '' && t.input !== 'epsilon';
            configs.push({ state: t.to, stack: nextStack, pos: consumes ? pos + 1 : pos });
        }
    }
    return false;
};

export const validatePDAChallenge = (userPDA, testCases) => {
    if (!testCases) return { passed: 0, total: 0, results: [] };
    const results = testCases.map(tc => {
        const actual = simulatePDA(userPDA, tc.input);
        return { input: tc.input, expected: tc.expected, actual, passed: actual === tc.expected, description: tc.description };
    });
    const passed = results.filter(r => r.passed).length;
    return { passed, total: testCases.length, results, valid: true };
};

/**
 * Simulates a CFG using a robust BFS approach
 */
export const simulateCFG = (cfg, input) => {
    if (!cfg || !cfg.rules || !cfg.startVariable) return false;

    // Normalize rules and find nullable variables
    const rules = cfg.rules.map(r => ({
        left: r.left,
        right: (r.right === 'ε' || r.right === 'epsilon' || r.right === '') ? '' : r.right
    }));

    // Use BFS to find if input can be derived
    // For CFGs, we can use a depth-limited BFS or CYK. 
    // Since this is for validation, we'll use a more thorough BFS.
    const queue = [cfg.startVariable];
    const visited = new Set([cfg.startVariable]);
    const maxIterations = 5000;
    let iterations = 0;

    // Special case for empty string input
    const target = input === 'ε' || input === 'epsilon' ? '' : input;

    while (queue.length > 0 && iterations < maxIterations) {
        iterations++;
        const curr = queue.shift();

        if (curr === target) return true;
        
        // Pruning: if current string is much longer than target and has no epsilon rules to shorten it, skip
        // (Simplified pruning for validation)
        if (curr.length > target.length + 10 && !rules.some(r => r.right === '')) continue;

        // Try applying each rule to each variable in the current string
        for (const rule of rules) {
            let idx = curr.indexOf(rule.left);
            while (idx !== -1) {
                const next = curr.slice(0, idx) + rule.right + curr.slice(idx + 1);
                if (!visited.has(next) && next.length <= target.length + 10) {
                    visited.add(next);
                    queue.push(next);
                }
                idx = curr.indexOf(rule.left, idx + 1);
            }
        }
    }

    return false;
};

export const validateCFGChallenge = (userCFG, testCases) => {
    if (!testCases) return { passed: 0, total: 0, results: [] };
    const results = testCases.map(tc => {
        const actual = simulateCFG(userCFG, tc.input);
        return { input: tc.input, expected: tc.expected, actual, passed: actual === tc.expected, description: tc.description };
    });
    const passed = results.filter(r => r.passed).length;
    return { passed, total: testCases.length, results, valid: true };
};

/**
 * Simulates a Turing Machine
 */
export const simulateTM = (tm, input) => {
    if (!tm || !tm.rules) return false;

    const blank = tm.blankSymbol || '□';
    const accept = tm.acceptState || 'qaccept';
    const reject = tm.rejectState || 'qreject';
    const maxSteps = 5000;

    let tape = input.split('').map(c => c === '' ? blank : c);
    if (tape.length === 0) tape = [blank];
    // Pad tape
    for (let i = 0; i < 50; i++) tape.push(blank);

    let head = 0;
    let state = tm.startState || 'q0';
    let steps = 0;

    while (steps < maxSteps) {
        steps++;
        if (state === accept) return true;
        if (state === reject) return false;

        if (head < 0) { tape.unshift(blank); head = 0; }
        if (head >= tape.length) tape.push(blank);

        const sym = tape[head];
        const rule = tm.rules.find(r => r.currentState === state && r.readSymbol === sym);

        if (!rule) return state === accept;

        tape[head] = rule.writeSymbol;
        state = rule.newState;
        head += (rule.moveDirection === 'R' ? 1 : -1);
    }
    return false;
};

export const validateTMChallenge = (userTM, testCases) => {
    if (!testCases) return { passed: 0, total: 0, results: [] };
    const results = testCases.map(tc => {
        const actual = simulateTM(userTM, tc.input);
        return { input: tc.input, expected: tc.expected, actual, passed: actual === tc.expected, description: tc.description };
    });
    const passed = results.filter(r => r.passed).length;
    return { passed, total: testCases.length, results, valid: true };
};

export const validateChallenge = (type, user, testCases) => {
    switch (type) {
        case 'DFA': return validateDFAChallenge(user, testCases);
        case 'NFA': return validateNFAChallenge(user, testCases);
        case 'PDA': return validatePDAChallenge(user, testCases);
        case 'CFG': return validateCFGChallenge(user, testCases);
        case 'TM': return validateTMChallenge(user, testCases);
        default: return { passed: 0, total: 0, results: [], valid: false };
    }
};

export default {
    validateChallenge,
    validateDFAChallenge,
    validateNFAChallenge,
    validatePDAChallenge,
    validateCFGChallenge,
    validateTMChallenge
};
