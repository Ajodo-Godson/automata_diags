import { useState, useCallback } from 'react';

export const useNFA = (initialConfig) => {
    const [states, setStates] = useState(initialConfig.states || ['q0']);
    const [alphabet, setAlphabet] = useState(initialConfig.alphabet || ['0', '1']);
    const [transitions, setTransitions] = useState(initialConfig.transitions || []);
    const [startState, setStartState] = useState(initialConfig.startState || 'q0');
    const [acceptStates, setAcceptStates] = useState(initialConfig.acceptStates || []);

    const loadDefinition = useCallback((nfa) => {
        setStates(nfa.states || []);
        setAlphabet(nfa.alphabet || []);
        setTransitions(nfa.transitions || []);
        setStartState(nfa.startState || 'q0');
        setAcceptStates(nfa.acceptStates || []);
    }, []);

    const addState = useCallback((stateName) => {
        if (!states.includes(stateName)) {
            setStates(prev => [...prev, stateName]);
        }
    }, [states]);

    const removeState = useCallback((stateName) => {
        setStates(prev => prev.filter(s => s !== stateName));
        setAcceptStates(prev => prev.filter(s => s !== stateName));
        setTransitions(prev => prev.filter(t => t.from !== stateName && t.to !== stateName));
        if (startState === stateName) setStartState('');
    }, [startState]);

    const addTransition = useCallback((from, to, symbol) => {
        setTransitions(prev => [...prev, { from, to, symbol }]);
    }, []);

    const removeTransition = useCallback((index) => {
        setTransitions(prev => prev.filter((_, i) => i !== index));
    }, []);

    const toggleAcceptState = useCallback((stateName) => {
        setAcceptStates(prev => 
            prev.includes(stateName) 
                ? prev.filter(s => s !== stateName) 
                : [...prev, stateName]
        );
    }, []);

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
        loadDefinition,
        addState,
        removeState,
        addTransition,
        removeTransition,
        toggleAcceptState
    };
};
