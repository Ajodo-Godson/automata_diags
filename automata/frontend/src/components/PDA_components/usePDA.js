import { useState, useCallback } from 'react';

export const usePDA = (initialConfig) => {
    const [states, setStates] = useState(initialConfig.states || ['q0']);
    const [alphabet, setAlphabet] = useState(initialConfig.alphabet || ['0', '1']);
    const [stackAlphabet, setStackAlphabet] = useState(initialConfig.stackAlphabet || ['Z', 'X']);
    const [transitions, setTransitions] = useState(initialConfig.transitions || []);
    const [startState, setStartState] = useState(initialConfig.startState || 'q0');
    const [startStackSymbol, setStartStackSymbol] = useState(initialConfig.startStackSymbol || 'Z');
    const [acceptStates, setAcceptStates] = useState(new Set(initialConfig.acceptStates || []));

    const loadPDA = useCallback((pda) => {
        setStates(pda.states || []);
        setAlphabet(pda.alphabet || []);
        setStackAlphabet(pda.stackAlphabet || []);
        setTransitions(pda.transitions || []);
        setStartState(pda.startState || 'q0');
        setStartStackSymbol(pda.startStackSymbol || 'Z');
        setAcceptStates(new Set(pda.acceptStates || []));
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
        setTransitions(prev => prev.filter(t => t.from !== stateName && t.to !== stateName));
        if (startState === stateName) setStartState('');
    }, [startState]);

    const addTransition = useCallback((from, to, input, pop, push) => {
        setTransitions(prev => [...prev, { from, to, input, pop, push }]);
    }, []);

    const removeTransition = useCallback((from, to, input, pop, push) => {
        setTransitions(prev => prev.filter(t => 
            !(t.from === from && t.to === to && t.input === input && t.pop === pop && t.push === push)
        ));
    }, []);

    const toggleAcceptState = useCallback((stateName) => {
        setAcceptStates(prev => {
            const next = new Set(prev);
            if (next.has(stateName)) next.delete(stateName);
            else next.add(stateName);
            return next;
        });
    }, []);

    return {
        states,
        alphabet,
        stackAlphabet,
        transitions,
        startState,
        startStackSymbol,
        acceptStates,
        setStates,
        setAlphabet,
        setStackAlphabet,
        setTransitions,
        setStartState,
        setStartStackSymbol,
        setAcceptStates,
        loadPDA,
        addState,
        removeState,
        addTransition,
        removeTransition,
        toggleAcceptState
    };
};
