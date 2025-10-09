import { useState, useCallback } from 'react';

export const useTM = (initialConfig) => {
    const [states, setStates] = useState(initialConfig.states || ['q0', 'qaccept', 'qreject']);
    const [inputAlphabet, setInputAlphabet] = useState(initialConfig.inputAlphabet || ['0', '1']);
    const [tapeAlphabet, setTapeAlphabet] = useState(initialConfig.tapeAlphabet || ['0', '1', '_']);
    const [transitions, setTransitions] = useState(initialConfig.transitions || {});
    const [startState, setStartState] = useState(initialConfig.startState || 'q0');
    const [acceptState, setAcceptState] = useState(initialConfig.acceptState || 'qaccept');
    const [rejectState, setRejectState] = useState(initialConfig.rejectState || 'qreject');
    const [blankSymbol, setBlankSymbol] = useState(initialConfig.blankSymbol || '_');

    const loadTM = useCallback((config) => {
        setStates(config.states || []);
        setInputAlphabet(config.inputAlphabet || []);
        setTapeAlphabet(config.tapeAlphabet || []);
        setTransitions(config.transitions || {});
        setStartState(config.startState || 'q0');
        setAcceptState(config.acceptState || 'qaccept');
        setRejectState(config.rejectState || 'qreject');
        setBlankSymbol(config.blankSymbol || '_');
    }, []);

    const addState = useCallback((stateName = null) => {
        const newState = stateName || `q${states.length}`;
        if (!states.includes(newState)) {
            setStates(prev => [...prev, newState]);
            setTransitions(prev => ({ ...prev, [newState]: {} }));
        }
    }, [states]);

    const deleteState = useCallback((state) => {
        if (state === startState || state === acceptState || state === rejectState) {
            return; // Cannot delete special states
        }
        setStates(prev => prev.filter(s => s !== state));
        setTransitions(prev => {
            const newTransitions = { ...prev };
            delete newTransitions[state];
            // Remove transitions TO this state
            Object.keys(newTransitions).forEach(fromState => {
                Object.keys(newTransitions[fromState]).forEach(symbol => {
                    if (newTransitions[fromState][symbol][0] === state) {
                        delete newTransitions[fromState][symbol];
                    }
                });
            });
            return newTransitions;
        });
    }, [startState, acceptState, rejectState]);

    const addSymbol = useCallback((symbol, isInputSymbol = true) => {
        if (!tapeAlphabet.includes(symbol)) {
            setTapeAlphabet(prev => [...prev, symbol]);
        }
        if (isInputSymbol && !inputAlphabet.includes(symbol)) {
            setInputAlphabet(prev => [...prev, symbol]);
        }
    }, [tapeAlphabet, inputAlphabet]);

    const deleteSymbol = useCallback((symbol) => {
        if (symbol === blankSymbol) {
            return; // Cannot delete blank symbol
        }
        setTapeAlphabet(prev => prev.filter(s => s !== symbol));
        setInputAlphabet(prev => prev.filter(s => s !== symbol));
        // Remove transitions using this symbol
        setTransitions(prev => {
            const newTransitions = { ...prev };
            Object.keys(newTransitions).forEach(state => {
                delete newTransitions[state][symbol];
            });
            return newTransitions;
        });
    }, [blankSymbol]);

    const updateTransition = useCallback((fromState, readSymbol, toState, writeSymbol, direction) => {
        setTransitions(prev => ({
            ...prev,
            [fromState]: {
                ...(prev[fromState] || {}),
                [readSymbol]: [toState, writeSymbol, direction]
            }
        }));
    }, []);

    const removeTransition = useCallback((fromState, readSymbol) => {
        setTransitions(prev => {
            const newTransitions = { ...prev };
            if (newTransitions[fromState]) {
                delete newTransitions[fromState][readSymbol];
            }
            return newTransitions;
        });
    }, []);

    const hasTransition = useCallback((state, symbol) => {
        return transitions[state] && transitions[state][symbol] !== undefined;
    }, [transitions]);

    const clearAll = useCallback(() => {
        setStates(['q0', 'qaccept', 'qreject']);
        setInputAlphabet(['0', '1']);
        setTapeAlphabet(['0', '1', '_']);
        setTransitions({});
        setStartState('q0');
        setAcceptState('qaccept');
        setRejectState('qreject');
        setBlankSymbol('_');
    }, []);

    return {
        states,
        inputAlphabet,
        tapeAlphabet,
        transitions,
        startState,
        acceptState,
        rejectState,
        blankSymbol,
        loadTM,
        addState,
        deleteState,
        addSymbol,
        deleteSymbol,
        updateTransition,
        removeTransition,
        hasTransition,
        clearAll,
        setStartState,
        setAcceptState,
        setRejectState,
    };
};


