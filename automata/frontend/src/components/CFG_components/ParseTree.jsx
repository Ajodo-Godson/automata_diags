import React from 'react';
import './stylings/ParseTree.css';

export function ParseTree({ derivationSteps, currentStep }) {
    if (!derivationSteps || derivationSteps.length === 0 || currentStep < 0) {
        return (
            <div className="parse-tree-empty">
                <p>Run a derivation to see the parse tree</p>
            </div>
        );
    }

    // Build tree structure from derivation steps
    const buildTreeNode = (step, index) => {
        if (!step || !step.string) return null;
        
        // Get the production rule used at this step
        const production = step.production;
        const string = step.string;
        
        return {
            id: index,
            value: string,
            production: production,
            description: step.description
        };
    };

    // Render a simple text-based tree
    const renderTextTree = () => {
        const steps = derivationSteps.slice(0, currentStep + 1);
        
        return (
            <div className="text-tree">
                {steps.map((step, index) => (
                    <div key={index} className="tree-level">
                        <div className="tree-level-number">{index}</div>
                        <div className="tree-level-content">
                            <div className="tree-string">
                                {step.string.split('').map((char, charIdx) => (
                                    <span
                                        key={charIdx}
                                        className={`tree-char ${
                                            step.highlightIndices?.includes(charIdx) ? 'tree-char-highlight' : ''
                                        }`}
                                    >
                                        {char}
                                    </span>
                                ))}
                            </div>
                            {step.production && (
                                <div className="tree-production">
                                    {step.production.left} → {step.production.right}
                                </div>
                            )}
                        </div>
                        {index < steps.length - 1 && (
                            <div className="tree-arrow">↓</div>
                        )}
                    </div>
                ))}
            </div>
        );
    };

    // Render a hierarchical tree visualization
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
                                    {step.string.split('').map((char, charIdx) => (
                                        <span
                                            key={charIdx}
                                            className={`node-char ${
                                                /[A-Z]/.test(char) ? 'node-var' : 'node-term'
                                            }`}
                                        >
                                            {char}
                                        </span>
                                    ))}
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

