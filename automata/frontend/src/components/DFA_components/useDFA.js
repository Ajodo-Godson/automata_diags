import { useState } from 'react';

export const useDFA = (initialDFA) => {
    const [states, setStates] = useState(initialDFA.states);
    const [alphabet, setAlphabet] = useState(initialDFA.alphabet);
    const [transitions, setTransitions] = useState(initialDFA.transitions);
    const [startState, setStartState] = useState(initialDFA.startState);
    const [acceptStates, setAcceptStates] = useState(initialDFA.acceptStates);

    const addState = () => {
        const newState = `q${states.length}`;
        setStates([...states, newState]);
        setTransitions({
            ...transitions,
            [newState]: Object.fromEntries(alphabet.map(symbol => [symbol, newState]))
        });
    };

    const addSymbol = () => {
        const symbol = prompt('Enter new symbol:');
        if (symbol && !alphabet.includes(symbol)) {
            setAlphabet([...alphabet, symbol]);
            const newTransitions = { ...transitions };
            states.forEach(state => {
                newTransitions[state] = {
                    ...newTransitions[state],
                    [symbol]: states[0]
                };
            });
            setTransitions(newTransitions);
        }
    };

    const updateTransition = (fromState, symbol, toState) => {
        setTransitions({
            ...transitions,
            [fromState]: {
                ...transitions[fromState],
                [symbol]: toState
            }
        });
    };

    const toggleAcceptState = (state) => {
        const newAcceptStates = new Set(acceptStates);
        if (newAcceptStates.has(state)) {
            newAcceptStates.delete(state);
        } else {
            newAcceptStates.add(state);
        }
        setAcceptStates(newAcceptStates);
    };

    const loadDFA = (dfa) => {
        setStates(dfa.states);
        setAlphabet(dfa.alphabet);
        setTransitions(dfa.transitions);
        setStartState(dfa.startState);
        setAcceptStates(dfa.acceptStates);
    };

    return {
        states,
        alphabet,
        transitions,
        startState,
        acceptStates,
        addState,
        addSymbol,
        updateTransition,
        toggleAcceptState,
        loadDFA,
    };
}; 