import { useState, useCallback } from 'react';

export const useDFA = (initialConfig) => {
    const [states, setStates] = useState(initialConfig.states || ['q0']);
    const [alphabet, setAlphabet] = useState(initialConfig.alphabet || ['0', '1']);
    const [transitions, setTransitions] = useState(initialConfig.transitions || {});
    const [startState, setStartState] = useState(initialConfig.startState || 'q0');
    const [acceptStates, setAcceptStates] = useState(new Set(initialConfig.acceptStates || []));

    const loadDFA = useCallback((dfa) => {
        setStates(dfa.states || []);
        setAlphabet(dfa.alphabet || []);
        setTransitions(dfa.transitions || {});
        setStartState(dfa.startState || 'q0');
        setAcceptStates(new Set(dfa.acceptStates || []));
    }, []);

    const addState = useCallback((stateName) => {
        if (!states.includes(stateName)) {
            setStates(prev => [...prev, stateName]);
        }
    }, [states]);

    const removeState = useCallback((stateName) => {
        setStates(prev => prev.filter(s => s !== stateName));
        setAcceptStates(prev => {
            const next = new Set(prev);
            next.delete(stateName);
            return next;
        });
        setTransitions(prev => {
            const next = { ...prev };
            delete next[stateName];
            Object.keys(next).forEach(from => {
                Object.keys(next[from]).forEach(symbol => {
                    if (next[from][symbol] === stateName) delete next[from][symbol];
                });
            });
            return next;
        });
        if (startState === stateName) setStartState('');
    }, [startState]);

    const updateTransition = useCallback((from, symbol, to) => {
        setTransitions(prev => ({
            ...prev,
            [from]: {
                ...(prev[from] || {}),
                [symbol]: to
            }
        }));
    }, []);

    const toggleAcceptState = useCallback((stateName) => {
        setAcceptStates(prev => {
            const next = new Set(prev);
            if (next.has(stateName)) next.delete(stateName);
            else next.add(stateName);
            return next;
        });
    }, []);

    const hasTransition = useCallback((from, symbol) => {
        return transitions[from] && transitions[from][symbol] !== undefined;
    }, [transitions]);

    return {
        states,
        alphabet,
        transitions,
        startState,
        acceptStates,
        setStates,
        setAlphabet,
        setTransitions,
        setStartState,
        setAcceptStates,
        loadDFA,
        addState,
        removeState,
        updateTransition,
        toggleAcceptState,
        hasTransition
    };
};
