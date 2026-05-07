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

    const tokenizeProductionRhs = (rhs) => {
        if (!rhs || rhs === 'ε' || rhs === 'epsilon') return [];
        return tokenMode ? rhs.trim().split(/\s+/).filter(Boolean) : rhs.split('');
    };

    const buildParseTree = () => {
        const steps = derivationSteps.slice(0, currentStep + 1);
        if (steps.length === 0) return null;

        const rootSymbol = splitSymbols(steps[0].string)[0] || steps[0].string;
        if (!rootSymbol) return null;

        let idCounter = 0;
        const createNode = (symbol) => ({
            id: `node_${idCounter++}`,
            symbol,
            children: [],
            expanded: false,
        });

        const root = createNode(rootSymbol);

        const getLeaves = (node) => {
            if (!node.children || node.children.length === 0) return [node];
            return node.children.flatMap(getLeaves);
        };

        // Start at step 1: step 0 is the start symbol.
        for (let i = 1; i < steps.length; i++) {
            const step = steps[i];
            if (!step.production) continue;

            const { left, right } = step.production;
            const targetLeaf = getLeaves(root).find((leaf) => leaf.symbol === left && !leaf.expanded);
            if (!targetLeaf) continue;

            const rhsSymbols = tokenizeProductionRhs(right);
            if (rhsSymbols.length === 0) {
                // Show epsilon explicitly so students can see nullable productions.
                targetLeaf.children = [createNode('ε')];
            } else {
                targetLeaf.children = rhsSymbols.map(createNode);
            }
            targetLeaf.expanded = true;
        }

        return root;
    };

    const renderTreeNode = (node) => (
        <li key={node.id}>
            <span className={`tree-symbol ${isVariable(node.symbol) ? 'tree-symbol-var' : 'tree-symbol-term'}`}>
                {node.symbol}
            </span>
            {node.children && node.children.length > 0 && (
                <ul>
                    {node.children.map(renderTreeNode)}
                </ul>
            )}
        </li>
    );

    const renderHierarchicalTree = () => {
        const steps = derivationSteps.slice(0, currentStep + 1);
        const finalStep = steps[steps.length - 1];
        const parseTreeRoot = buildParseTree();

        if (!finalStep || !parseTreeRoot) return null;

        return (
            <div className="hierarchical-tree">
                <div className="tree-title">2D Parse Tree</div>
                <div className="tree-canvas">
                    <ul className="tree-root">
                        {renderTreeNode(parseTreeRoot)}
                    </ul>
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

