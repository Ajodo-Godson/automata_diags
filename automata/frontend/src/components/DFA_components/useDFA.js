import { useState, useCallback } from 'react';

export const useDFA = (initialDFA) => {
    const [states, setStates] = useState(initialDFA.states);
    const [alphabet, setAlphabet] = useState(initialDFA.alphabet);
    const [transitions, setTransitions] = useState(initialDFA.transitions);
    const [startState, setStartState] = useState(initialDFA.startState);
    const [acceptStates, setAcceptStates] = useState(initialDFA.acceptStates);

    // Add history management
    const [history, setHistory] = useState([{
        states,
        alphabet,
        transitions,
        startState,
        acceptStates
    }]);
    const [currentHistoryIndex, setCurrentHistoryIndex] = useState(0);

    const saveToHistory = useCallback((newState) => {
        const newHistory = history.slice(0, currentHistoryIndex + 1);
        newHistory.push(newState);
        setHistory(newHistory);
        setCurrentHistoryIndex(newHistory.length - 1);
    }, [history, currentHistoryIndex]);

    const undo = useCallback(() => {
        if (currentHistoryIndex > 0) {
            const previousState = history[currentHistoryIndex - 1];
            setStates(previousState.states);
            setAlphabet(previousState.alphabet);
            setTransitions(previousState.transitions);
            setStartState(previousState.startState);
            setAcceptStates(previousState.acceptStates);
            setCurrentHistoryIndex(currentHistoryIndex - 1);
        }
    }, [currentHistoryIndex, history]);

    const redo = useCallback(() => {
        if (currentHistoryIndex < history.length - 1) {
            const nextState = history[currentHistoryIndex + 1];
            setStates(nextState.states);
            setAlphabet(nextState.alphabet);
            setTransitions(nextState.transitions);
            setStartState(nextState.startState);
            setAcceptStates(nextState.acceptStates);
            setCurrentHistoryIndex(currentHistoryIndex + 1);
        }
    }, [currentHistoryIndex, history]);

    const clearAll = useCallback(() => {
        const newState = {
            states: ['q0'],
            alphabet: ['a', 'b'],
            transitions: { q0: { a: 'q0', b: 'q0' } },
            startState: 'q0',
            acceptStates: new Set()
        };
        setStates(newState.states);
        setAlphabet(newState.alphabet);
        setTransitions(newState.transitions);
        setStartState(newState.startState);
        setAcceptStates(newState.acceptStates);
        saveToHistory(newState);
    }, [saveToHistory]);

    const addTransition = useCallback(() => {
        // Show a modal or prompt for transition details
        const fromState = prompt('Enter source state:');
        const symbol = prompt('Enter symbol:');
        const toState = prompt('Enter target state:');

        if (fromState && symbol && toState) {
            if (!states.includes(fromState) || !states.includes(toState)) {
                alert('Invalid states!');
                return;
            }
            if (!alphabet.includes(symbol)) {
                alert('Invalid symbol!');
                return;
            }

            const newTransitions = {
                ...transitions,
                [fromState]: {
                    ...transitions[fromState],
                    [symbol]: toState
                }
            };
            setTransitions(newTransitions);

            saveToHistory({
                states,
                alphabet,
                transitions: newTransitions,
                startState,
                acceptStates
            });
        }
    }, [states, alphabet, transitions, startState, acceptStates, saveToHistory]);

    // Update existing functions to use history
    const addState = useCallback((customName = null) => {
        const newState = customName || `q${states.length}`;
        if (states.includes(newState)) {
            alert(`State "${newState}" already exists`);
            return;
        }
        const newStates = [...states, newState];
        const newTransitions = {
            ...transitions,
            [newState]: Object.fromEntries(alphabet.map(symbol => [symbol, newState]))
        };

        setStates(newStates);
        setTransitions(newTransitions);

        saveToHistory({
            states: newStates,
            alphabet,
            transitions: newTransitions,
            startState,
            acceptStates
        });
    }, [states, alphabet, transitions, startState, acceptStates, saveToHistory]);

    const addSymbol = useCallback((symbol) => {
        if (!symbol) return;
        if (alphabet.includes(symbol)) {
            alert(`Symbol "${symbol}" already exists`);
            return;
        }
        const newAlphabet = [...alphabet, symbol];
        const newTransitions = { ...transitions };
        states.forEach(state => {
            newTransitions[state] = {
                ...newTransitions[state],
                [symbol]: states[0]
            };
        });

        setAlphabet(newAlphabet);
        setTransitions(newTransitions);

        saveToHistory({
            states,
            alphabet: newAlphabet,
            transitions: newTransitions,
            startState,
            acceptStates
        });
    }, [states, alphabet, transitions, startState, acceptStates, saveToHistory]);

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
        // New functions
        undo,
        redo,
        clearAll,
        addTransition,
        canUndo: currentHistoryIndex > 0,
        canRedo: currentHistoryIndex < history.length - 1
    };
}; 