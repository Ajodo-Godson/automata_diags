import { useState } from 'react';

export const useCFG = (initialCFG) => {
    const [variables, setVariables] = useState(initialCFG.variables || []);
    const [terminals, setTerminals] = useState(initialCFG.terminals || []);
    const [rules, setRules] = useState(initialCFG.rules || []);
    const [startVariable, setStartVariable] = useState(initialCFG.startVariable || '');

    const loadCFG = (cfg) => {
        setVariables(cfg.variables || []);
        setTerminals(cfg.terminals || []);
        setRules(cfg.rules || []);
        setStartVariable(cfg.startVariable || '');
    };

    const addRule = (left, right) => {
        const newRule = { left, right };
        setRules([...rules, newRule]);
    };

    const removeRule = (index) => {
        const newRules = rules.filter((_, i) => i !== index);
        setRules(newRules);
    };

    return {
        variables,
        terminals,
        rules,
        startVariable,
        loadCFG,
        addRule,
        removeRule,
        setVariables,
        setTerminals,
        setRules,
        setStartVariable
    };
};