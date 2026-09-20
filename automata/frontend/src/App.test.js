import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

/*
 * ReactFlow measures the DOM, which jsdom does not implement. Stubbing the
 * observer keeps the diagram from throwing during a smoke render.
 */
beforeAll(() => {
    global.ResizeObserver = class {
        observe() {}
        unobserve() {}
        disconnect() {}
    };
});

describe('App', () => {
    test('boots into the DFA simulator', () => {
        render(<App />);

        expect(
            screen.getByRole('heading', { name: /Deterministic Finite Automaton/i })
        ).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'DFA' })).toHaveAttribute(
            'aria-current',
            'page'
        );
    });

    test('switches machines from the header nav', async () => {
        render(<App />);

        await userEvent.click(screen.getByRole('button', { name: 'PDA' }));

        expect(
            screen.getByRole('heading', { name: /Pushdown Automaton/i })
        ).toBeInTheDocument();
    });

    test('every machine renders its own simulator', async () => {
        render(<App />);

        for (const [tab, heading] of [
            ['NFA', /Nondeterministic Finite Automaton/i],
            ['CFG', /Context-Free Grammar/i],
            ['TM', /Turing Machine/i],
        ]) {
            await userEvent.click(screen.getByRole('button', { name: tab }));
            expect(screen.getByRole('heading', { name: heading })).toBeInTheDocument();
        }
    });
});
