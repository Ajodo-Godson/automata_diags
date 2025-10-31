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

    const addState = (stateName) => {
        if (!states.includes(stateName)) {
            setStates([...states, stateName]);
        }
    };

    const removeState = (stateName) => {
        setStates(states.filter(s => s !== stateName));
        setTransitions(transitions.filter(t => t.from !== stateName && t.to !== stateName));
        if (startState === stateName) {
            setStartState('');
        }
        const newAcceptStates = new Set(acceptStates);
        newAcceptStates.delete(stateName);
        setAcceptStates(newAcceptStates);
    };

    const addTransition = (from, to, input, pop, push) => {
        const newTransition = { from, to, input, pop, push };
        setTransitions([...transitions, newTransition]);
    };

    const removeTransition = (from, to, input, pop, push) => {
        setTransitions(transitions.filter(t => 
            !(t.from === from && t.to === to && t.input === input && t.pop === pop && t.push === push)
        ));
    };

    const setStart = (stateName) => {
        if (states.includes(stateName)) {
            setStartState(stateName);
        }
    };

    const toggleAcceptState = (stateName) => {
        const newAcceptStates = new Set(acceptStates);
        if (newAcceptStates.has(stateName)) {
            newAcceptStates.delete(stateName);
        } else {
            newAcceptStates.add(stateName);
        }
        setAcceptStates(newAcceptStates);
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
        addState,
        removeState,
        addTransition,
        removeTransition,
        setStart,
        toggleAcceptState,
        setStates,
        setAlphabet,
        setStackAlphabet,
        setTransitions,
        setStartState,
        setStartStackSymbol,
        setAcceptStates
    };
};