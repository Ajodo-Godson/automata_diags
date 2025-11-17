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
        },
        an_bn: {
            name: 'a^n b^n',
            description: 'Generates strings with equal number of a\'s followed by equal number of b\'s',
            variables: ['S'],
            terminals: ['a', 'b'],
            rules: [
                { left: 'S', right: 'ε' },
                { left: 'S', right: 'aSb' }
            ],
            startVariable: 'S'
        },
        palindrome: {
            name: 'Palindrome',
            description: 'Generates palindromes over {a,b}',
            variables: ['S'],
            terminals: ['a', 'b'],
            rules: [
                { left: 'S', right: 'ε' },
                { left: 'S', right: 'a' },
                { left: 'S', right: 'b' },
                { left: 'S', right: 'aSa' },
                { left: 'S', right: 'bSb' }
            ],
            startVariable: 'S'
        },
        arithmetic_with_subtraction: {
            name: 'Arithmetic with Subtraction',
            description: 'Generates arithmetic expressions with +, -, and *',
            variables: ['E', 'R', 'T', 'S', 'F'],
            terminals: ['+', '-', '*', '(', ')', 'a'],
            rules: [
                { left: 'E', right: 'TR' },
                { left: 'R', right: '+TR' },
                { left: 'R', right: '-TR' },
                { left: 'R', right: 'ε' },
                { left: 'T', right: 'FS' },
                { left: 'S', right: '*FS' },
                { left: 'S', right: 'ε' },
                { left: 'F', right: '(E)' },
                { left: 'F', right: 'a' }
            ],
            startVariable: 'E'
        },
        if_then_else: {
            name: 'Simple If-Then-Else',
            description: 'Generates simple if-then-else statements',
            variables: ['S', 'C', 'E'],
            terminals: ['if', 'then', 'else', 'a', 'b'],
            rules: [
                { left: 'S', right: 'ifCthenSelseS' },
                { left: 'S', right: 'a' },
                { left: 'S', right: 'b' },
                { left: 'C', right: 'a' },
                { left: 'C', right: 'b' }
            ],
            startVariable: 'S'
        },
        double_letters: {
            name: 'Double Letters',
            description: 'Generates strings where each letter appears twice consecutively',
            variables: ['S'],
            terminals: ['a', 'b'],
            rules: [
                { left: 'S', right: 'ε' },
                { left: 'S', right: 'aaS' },
                { left: 'S', right: 'bbS' },
                { left: 'S', right: 'aa' },
                { left: 'S', right: 'bb' }
            ],
            startVariable: 'S'
        },
        nested_structures: {
            name: 'Nested Structures',
            description: 'Generates properly nested structures with matching opening and closing symbols',
            variables: ['S', 'A', 'B'],
            terminals: ['a', 'b', 'c', 'd'],
            rules: [
                { left: 'S', right: 'ε' },
                { left: 'S', right: 'aSb' },
                { left: 'S', right: 'cSd' },
                { left: 'S', right: 'SS' },
                { left: 'S', right: 'AB' },
                { left: 'A', right: 'aAb' },
                { left: 'A', right: 'ε' },
                { left: 'B', right: 'cBd' },
                { left: 'B', right: 'ε' }
            ],
            startVariable: 'S'
        }
    });

    return { examples };
};