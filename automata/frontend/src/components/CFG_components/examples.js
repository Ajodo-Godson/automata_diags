import { useState } from 'react';

export const useExamples = () => {
    const [examples] = useState({
        balanced_parentheses: {
            name: 'Balanced Parentheses',
            variables: ['S'],
            terminals: ['(', ')'],
            rules: [
                { left: 'S', right: '(S)' },
                { left: 'S', right: 'SS' },
                { left: 'S', right: 'ε' }
            ],
            startVariable: 'S'
        },
        simple_arithmetic: {
            name: 'Simple Arithmetic',
            // Left-recursive grammar converted to right-recursive form (no immediate left recursion)
            // E -> T R
            // R -> + T R | ε
            // T -> F S
            // S -> * F S | ε
            // F -> (E) | a
            variables: ['E', 'R', 'T', 'S', 'F'],
            terminals: ['+', '*', '(', ')', 'a'],
            rules: [
                { left: 'E', right: 'TR' },
                { left: 'R', right: '+TR' },
                { left: 'R', right: 'ε' },
                { left: 'T', right: 'FS' },
                { left: 'S', right: '*FS' },
                { left: 'S', right: 'ε' },
                { left: 'F', right: '(E)' },
                { left: 'F', right: 'a' }
            ],
            startVariable: 'E'
        },
        equal_as_bs: {
            name: 'Equal a\'s and b\'s',
            // Nonterminals S, A, B (A -> a, B -> b)
            variables: ['S', 'A', 'B'],
            // terminals are lowercase only
            terminals: ['a', 'b'],
            rules: [
                { left: 'S', right: 'ε' },
                { left: 'S', right: 'SaSbS' },
                { left: 'S', right: 'SbSaS' },
                { left: 'A', right: 'a' },
                { left: 'B', right: 'b' }
            ],
            startVariable: 'S'
        }
    });

    return { examples };
};