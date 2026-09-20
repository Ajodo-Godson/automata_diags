import React from 'react';
import { render, renderHook } from '@testing-library/react';
import { DFATestCases } from '../DFA_components/DFATestCases';
import { NFATestCases } from '../NFA_components/NFATestCases';
import { PDATestCases } from '../PDA_components/PDATestCases';
import { CFGTestCases } from '../CFG_components/CFGTestCases';
import { TMTestCases } from '../TM_components/TMTestCases';
import TestCaseList from '../shared/TestCaseList';

import { DFA_EXAMPLES } from '../DFA_components/examples';
import { useExamples as useNFAExamples } from '../NFA_components/examples';
import { useExamples as usePDAExamples } from '../PDA_components/examples';
import { useExamples as useCFGExamples } from '../CFG_components/examples';
import { useExamples as useTMExamples } from '../TM_components/examples';

/*
 * Regression: PDATestCases passed its whole {exampleKey: cases} map to
 * TestCaseList instead of the selected example's array, so opening the PDA
 * "Test cases" section crashed the app with "testCases.map is not a function".
 * Every machine keys its cases differently, so each one is rendered against
 * every example it ships.
 */

/* Some useExamples implementations call useState/useMemo, so they have to be
 * read through a render rather than invoked directly. */
const keysOf = (hook) => Object.keys(renderHook(() => hook()).result.current.examples);

const MACHINES = [
    { name: 'DFA', Component: DFATestCases, keys: Object.keys(DFA_EXAMPLES), prop: 'onLoadTest' },
    { name: 'NFA', Component: NFATestCases, keys: keysOf(useNFAExamples), prop: 'onLoadTest' },
    { name: 'PDA', Component: PDATestCases, keys: keysOf(usePDAExamples), prop: 'onLoadTest' },
    { name: 'CFG', Component: CFGTestCases, keys: keysOf(useCFGExamples), prop: 'onLoadTest' },
    { name: 'TM', Component: TMTestCases, keys: keysOf(useTMExamples), prop: 'onLoadExample' },
];

describe('test case lists', () => {
    MACHINES.forEach(({ name, Component, keys, prop }) => {
        test(`${name} renders for all ${keys.length} examples`, () => {
            expect(keys.length).toBeGreaterThan(0);
            keys.forEach((key) => {
                const props = { currentExample: key, [prop]: () => {} };
                expect(() => render(<Component {...props} />)).not.toThrow();
            });
        });

        /*
         * Not throwing is not enough: TestCaseList tolerates a bad shape by
         * showing its empty state, so handing it the whole example map rather
         * than one example's array looks "fine" while silently rendering
         * nothing. At least one example has to produce actual rows.
         */
        test(`${name} actually lists cases for its examples`, () => {
            const rendered = keys.map((key) => {
                const props = { currentExample: key, [prop]: () => {} };
                const { container, unmount } = render(<Component {...props} />);
                const rows = container.querySelectorAll('.tc-item').length;
                unmount();
                return rows;
            });
            expect(Math.max(...rendered)).toBeGreaterThan(0);
        });

        test(`${name} renders for an unknown example`, () => {
            const props = { currentExample: '__no_such_example__', [prop]: () => {} };
            expect(() => render(<Component {...props} />)).not.toThrow();
        });
    });
});

describe('TestCaseList', () => {
    test('shows the empty state rather than throwing on a non-array', () => {
        // The shape that caused the crash.
        const { getByText } = render(
            <TestCaseList testCases={{ a: [], b: [] }} onLoadTest={() => {}} />
        );
        expect(getByText(/No test cases/i)).toBeInTheDocument();
    });

    test('renders one row per case and marks acceptance', () => {
        const { container } = render(
            <TestCaseList
                testCases={[
                    { input: 'ab', expected: 'Accept' },
                    { input: 'ba', expected: 'Reject' },
                ]}
                onLoadTest={() => {}}
            />
        );
        expect(container.querySelectorAll('.tc-item')).toHaveLength(2);
        expect(container.querySelectorAll('.dot-accept')).toHaveLength(1);
        expect(container.querySelectorAll('.dot-reject')).toHaveLength(1);
    });

    test('shows the empty string as ε', () => {
        const { getByText } = render(
            <TestCaseList testCases={[{ input: '', expected: 'Accept' }]} onLoadTest={() => {}} />
        );
        expect(getByText('ε')).toBeInTheDocument();
    });
});
