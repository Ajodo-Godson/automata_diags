import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Layout from '../Layout';

const setup = (props = {}) =>
    render(
        <Layout
            currentAutomaton="DFA"
            setCurrentAutomaton={() => {}}
            onOpenGuide={() => {}}
            {...props}
        >
            <div data-testid="content">Workspace</div>
        </Layout>
    );

describe('Layout', () => {
    test('renders the machine navigation and children', () => {
        setup();

        ['DFA', 'NFA', 'PDA', 'CFG', 'TM', 'Learn'].forEach((label) => {
            expect(screen.getByRole('button', { name: label })).toBeInTheDocument();
        });
        expect(screen.getByTestId('content')).toBeInTheDocument();
    });

    test('marks the current machine as the active page', () => {
        setup({ currentAutomaton: 'PDA' });

        expect(screen.getByRole('button', { name: 'PDA' })).toHaveAttribute(
            'aria-current',
            'page'
        );
        expect(screen.getByRole('button', { name: 'DFA' })).not.toHaveAttribute('aria-current');
    });

    test('selecting a machine reports it upward', async () => {
        const setCurrentAutomaton = jest.fn();
        setup({ setCurrentAutomaton });

        await userEvent.click(screen.getByRole('button', { name: 'TM' }));

        expect(setCurrentAutomaton).toHaveBeenCalledWith('TM');
    });

    /*
     * Regression: the file tools used to unmount on the Learn tab, which let
     * the header re-centre and shifted every nav button ~123px sideways —
     * clicking "TM" would land on "CFG". They must stay mounted.
     */
    test('file tools stay mounted on the Learn tab so the nav cannot shift', () => {
        const { rerender } = setup({ currentAutomaton: 'DFA' });
        expect(screen.getByRole('button', { name: /Import/ })).toBeInTheDocument();

        rerender(
            <Layout currentAutomaton="Tutorial" setCurrentAutomaton={() => {}} onOpenGuide={() => {}}>
                <div data-testid="content">Workspace</div>
            </Layout>
        );

        const tools = document.querySelector('.app-tools');
        expect(tools).toBeInTheDocument();
        expect(tools).toHaveClass('is-hidden');
    });

    test('the guide button opens the walkthrough', async () => {
        const onOpenGuide = jest.fn();
        setup({ onOpenGuide });

        await userEvent.click(screen.getByRole('button', { name: /Guide/ }));

        expect(onOpenGuide).toHaveBeenCalled();
    });
});
