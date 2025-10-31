import { useState } from 'react';

export const usePDA = (initialPDA) => {
    const [states, setStates] = useState(initialPDA.states || []);
    const [alphabet, setAlphabet] = useState(initialPDA.alphabet || []);
    const [stackAlphabet, setStackAlphabet] = useState(initialPDA.stackAlphabet || []);
    const [transitions, setTransitions] = useState(initialPDA.transitions || []);
    const [startState, setStartState] = useState(initialPDA.startState || '');
    const [startStackSymbol, setStartStackSymbol] = useState(initialPDA.startStackSymbol || '');
    const [acceptStates, setAcceptStates] = useState(new Set(initialPDA.acceptStates || []));

    const loadPDA = (pda) => {
        setStates(pda.states || []);
        setAlphabet(pda.alphabet || []);
        setStackAlphabet(pda.stackAlphabet || []);
        setTransitions(pda.transitions || []);
        setStartState(pda.startState || '');
        setStartStackSymbol(pda.startStackSymbol || '');
        setAcceptStates(new Set(pda.acceptStates || []));
    };

    const hasTransition = (from, input, pop) => {
        return transitions.some(t => t.from === from && t.input === input && t.pop === pop);
    };

    return {
        states,
        alphabet,
        stackAlphabet,
        transitions,
        startState,
        startStackSymbol,
        acceptStates,
        loadPDA,
        hasTransition,
        setStates,
        setAlphabet,
        setStackAlphabet,
        setTransitions,
        setStartState,
        setStartStackSymbol,
        setAcceptStates
    };
};