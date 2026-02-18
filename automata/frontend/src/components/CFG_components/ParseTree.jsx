import React from 'react';
import './stylings/ParseTree.css';

export function ParseTree({ derivationSteps, currentStep, tokenMode, variables }) {
    if (!derivationSteps || derivationSteps.length === 0 || currentStep < 0) {
        return (
            <div className="parse-tree-empty">
                <p>Run a derivation to see the parse tree</p>
            </div>
        );
    }

    const splitSymbols = (str) => {
        if (!str) return [];
        return tokenMode ? str.split(' ').filter(Boolean) : str.split('');
    };

    const isVariable = (sym) => {
        if (variables && variables.length > 0) return variables.includes(sym);
        return /^[A-Z]/.test(sym);
    };

    const renderSymbols = (step) => {
        const syms = splitSymbols(step.string);
        return syms.map((sym, idx) => (
            <React.Fragment key={idx}>
                {tokenMode && idx > 0 && <span className="token-space"> </span>}
                <span
                    className={`node-char ${isVariable(sym) ? 'node-var' : 'node-term'} ${
                        step.highlightIndices?.includes(idx) ? 'tree-char-highlight' : ''
                    }`}
                >
                    {sym}
                </span>
            </React.Fragment>
        ));
    };

    const renderHierarchicalTree = () => {
        const steps = derivationSteps.slice(0, currentStep + 1);
        const finalStep = steps[steps.length - 1];
        
        if (!finalStep) return null;

        return (
            <div className="hierarchical-tree">
                <div className="tree-title">Derivation Path</div>
                <div className="tree-path">
                    {steps.map((step, index) => (
                        <React.Fragment key={index}>
                            <div className={`tree-node ${index === currentStep ? 'tree-node-current' : ''}`}>
                                <div className="tree-node-value">
                                    {renderSymbols(step)}
                                </div>
                                {step.production && (
                                    <div className="tree-node-rule">
                                        {step.production.left} → {step.production.right}
                                    </div>
                                )}
                            </div>
                            {index < steps.length - 1 && (
                                <div className="tree-connector">⇓</div>
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="parse-tree-container">
            {renderHierarchicalTree()}
        </div>
    );
}

