import { useState } from 'react';

export const useNFA = (initialDefinition) => {
    const [states, setStates] = useState(initialDefinition?.states || []);
    const [alphabet, setAlphabet] = useState(initialDefinition?.alphabet || []);
    const [transitions, setTransitions] = useState(initialDefinition?.transitions || []);
    const [startState, setStartState] = useState(initialDefinition?.startState || '');
    const [acceptStates, setAcceptStates] = useState(initialDefinition?.acceptStates || []);

    const loadDefinition = (definition) => {
        setStates(definition.states);
        setAlphabet(definition.alphabet);
        setTransitions(definition.transitions);
        setStartState(definition.startState);
        setAcceptStates(definition.acceptStates);
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
        setAcceptStates(acceptStates.filter(s => s !== stateName));
    };

    const addTransition = (from, to, symbol) => {
        const newTransition = { from, to, symbol };
        setTransitions([...transitions, newTransition]);
    };

    const removeTransition = (from, to, symbol) => {
        setTransitions(transitions.filter(t => 
            !(t.from === from && t.to === to && t.symbol === symbol)
        ));
    };

    const setStart = (stateName) => {
        if (states.includes(stateName)) {
            setStartState(stateName);
        }
    };

    const toggleAcceptState = (stateName) => {
        if (acceptStates.includes(stateName)) {
            setAcceptStates(acceptStates.filter(s => s !== stateName));
        } else {
            setAcceptStates([...acceptStates, stateName]);
        }
    };

    const simulate = (inputString) => {
        let currentStates = new Set([startState]);
        
        // Apply epsilon closure to start state
        currentStates = getEpsilonClosure(currentStates, transitions);
        
        const steps = [{
            states: Array.from(currentStates),
            symbol: null,
            description: `Starting in states: ${Array.from(currentStates).join(', ')}`
        }];

        for (const symbol of inputString) {
            const nextStates = new Set();
            
            currentStates.forEach(state => {
                const validTransitions = transitions.filter(t => 
                    t.from === state && t.symbol === symbol
                );
                validTransitions.forEach(t => nextStates.add(t.to));
            });

            currentStates = getEpsilonClosure(nextStates, transitions);
            
            steps.push({
                states: Array.from(currentStates),
                symbol,
                description: `Read '${symbol}', now in states: ${Array.from(currentStates).join(', ')}`
            });
        }

        const isAccepted = Array.from(currentStates).some(state => 
            acceptStates.includes(state)
        );

        return {
            steps,
            accepted: isAccepted,
            finalStates: Array.from(currentStates)
        };
    };

    const getEpsilonClosure = (states, transitions) => {
        const closure = new Set(states);
        const stack = Array.from(states);

        while (stack.length > 0) {
            const state = stack.pop();
            const epsilonTransitions = transitions.filter(t => 
                t.from === state && (t.symbol === 'ε' || t.symbol === 'epsilon')
            );
            
            epsilonTransitions.forEach(t => {
                if (!closure.has(t.to)) {
                    closure.add(t.to);
                    stack.push(t.to);
                }
            });
        }

        return closure;
    };

    return {
        states,
        alphabet,
        transitions,
        startState,
        acceptStates,
        loadDefinition,
        addState,
        removeState,
        addTransition,
        removeTransition,
        setStart,
        toggleAcceptState,
        simulate,
        setAlphabet,
        setStates,
        setTransitions,
        setStartState,
        setAcceptStates,
        removeTransition: (index) => {
            setTransitions(transitions.filter((_, i) => i !== index));
        }
    };
};