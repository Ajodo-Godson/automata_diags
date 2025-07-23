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
        // Instead of prompting, we'll just highlight the transition table
        // and let users know they can modify transitions there
        alert('Use the transition table on the right to modify transitions.\nSelect states from the dropdown menus to define transitions.');
    }, []);

    const updateTransition = useCallback((fromState, symbol, toState) => {
        const newTransitions = {
            ...transitions,
            [fromState]: {
                ...transitions[fromState] || {},
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
            [newState]: {} // Empty transitions object for new state
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

        setAlphabet(newAlphabet);

        saveToHistory({
            states,
            alphabet: newAlphabet,
            transitions,
            startState,
            acceptStates
        });
    }, [states, alphabet, transitions, startState, acceptStates, saveToHistory]);

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

    // Add function to check if a transition exists
    const hasTransition = useCallback((fromState, symbol) => {
        return transitions[fromState] && transitions[fromState][symbol] !== undefined;
    }, [transitions]);

    // Add function to remove a transition
    const removeTransition = useCallback((fromState, symbol) => {
        if (!transitions[fromState] || !transitions[fromState][symbol]) return;

        const newStateTransitions = { ...transitions[fromState] };
        delete newStateTransitions[symbol];

        const newTransitions = {
            ...transitions,
            [fromState]: newStateTransitions
        };

        setTransitions(newTransitions);

        saveToHistory({
            states,
            alphabet,
            transitions: newTransitions,
            startState,
            acceptStates
        });
    }, [states, alphabet, transitions, startState, acceptStates, saveToHistory]);

    const deleteState = useCallback((stateToDelete) => {
        if (stateToDelete === startState) {
            alert("Cannot delete start state");
            return;
        }

        const newStates = states.filter(s => s !== stateToDelete);
        const newTransitions = { ...transitions };

        // Remove transitions from this state
        delete newTransitions[stateToDelete];

        // Remove transitions to this state
        Object.keys(newTransitions).forEach(fromState => {
            Object.keys(newTransitions[fromState]).forEach(symbol => {
                if (newTransitions[fromState][symbol] === stateToDelete) {
                    delete newTransitions[fromState][symbol];
                }
            });
        });

        // Remove from accept states if present
        const newAcceptStates = new Set(acceptStates);
        newAcceptStates.delete(stateToDelete);

        setStates(newStates);
        setTransitions(newTransitions);
        setAcceptStates(newAcceptStates);

        saveToHistory({
            states: newStates,
            alphabet,
            transitions: newTransitions,
            startState,
            acceptStates: newAcceptStates
        });
    }, [states, alphabet, transitions, startState, acceptStates, saveToHistory]);

    const deleteSymbol = useCallback((symbolToDelete) => {
        const newAlphabet = alphabet.filter(s => s !== symbolToDelete);
        const newTransitions = { ...transitions };

        // Remove all transitions using this symbol
        Object.keys(newTransitions).forEach(fromState => {
            if (newTransitions[fromState][symbolToDelete]) {
                delete newTransitions[fromState][symbolToDelete];
            }
        });

        setAlphabet(newAlphabet);
        setTransitions(newTransitions);

        saveToHistory({
            states: states,
            alphabet: newAlphabet,
            transitions: newTransitions,
            startState,
            acceptStates
        });
    }, [states, alphabet, transitions, startState, acceptStates, saveToHistory]);

    const exportToJSON = useCallback(() => {
        return JSON.stringify({
            states,
            alphabet,
            transitions,
            startState,
            acceptStates: Array.from(acceptStates)
        }, null, 2);
    }, [states, alphabet, transitions, startState, acceptStates]);

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
        canRedo: currentHistoryIndex < history.length - 1,
        hasTransition,
        removeTransition,
        deleteState,
        deleteSymbol,
        exportToJSON
    };
};