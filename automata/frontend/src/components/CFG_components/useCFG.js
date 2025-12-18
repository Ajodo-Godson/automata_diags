import { useState, useCallback } from 'react';

export const useCFG = (initialCFG) => {
    const [variables, setVariables] = useState(initialCFG.variables || []);
    const [terminals, setTerminals] = useState(initialCFG.terminals || []);
    const [rules, setRules] = useState(initialCFG.rules || []);
    const [startVariable, setStartVariable] = useState(initialCFG.startVariable || '');

    const loadCFG = useCallback((cfg) => {
        setVariables(cfg.variables || []);
        setTerminals(cfg.terminals || []);
        setRules(cfg.rules || []);
        setStartVariable(cfg.startVariable || '');
    }, []);

    const addRule = useCallback((left, right) => {
        setRules(prev => [...prev, { left, right }]);
    }, []);

    const removeRule = useCallback((index) => {
        setRules(prev => prev.filter((_, i) => i !== index));
    }, []);

    const addProduction = useCallback((left, right) => {
        setRules(prev => [...prev, { left, right }]);
    }, []);

    const deleteProduction = useCallback((index) => {
        setRules(prev => prev.filter((_, i) => i !== index));
    }, []);

    const addVariable = useCallback((variable) => {
        setVariables(prev => prev.includes(variable) ? prev : [...prev, variable]);
    }, []);

    return {
        variables,
        terminals,
        rules,
        startVariable,
        loadCFG,
        addRule,
        removeRule,
        addProduction,
        deleteProduction,
        addVariable,
        setVariables,
        setTerminals,
        setRules,
        setStartVariable
    };
};
