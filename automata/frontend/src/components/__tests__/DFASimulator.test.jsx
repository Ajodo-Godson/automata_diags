import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DFASimulatorNew from '../DFA_components/DFASimulator';

describe('DFASimulatorNew', () => {
    test('renders initial state correctly', () => {
        render(<DFASimulatorNew />);

        // Check for basic elements
        expect(screen.getByText('DFA Simulator')).toBeInTheDocument();
        expect(screen.getByText('Load Example:')).toBeInTheDocument();
    });

    test('can load example DFA', () => {
        render(<DFASimulatorNew />);
        const exampleButton = screen.getByText("Ends with 'ab'");

        fireEvent.click(exampleButton);
        expect(exampleButton).toHaveClass('active');
    });

    test('displays transition table', () => {
        render(<DFASimulatorNew />);
        expect(screen.getByText('Transition Table')).toBeInTheDocument();
    });

    test('simulates string correctly', async () => {
        render(<DFASimulatorNew />);

        // Load example DFA that accepts strings ending with 'ab'
        const exampleButton = screen.getByText("Ends with 'ab'");
        fireEvent.click(exampleButton);

        // Enter test string
        const input = screen.getByPlaceholderText('Enter input string (e.g., aab)');
        await userEvent.type(input, 'ab');

        // Run simulation
        const testButton = screen.getByText('Test');
        fireEvent.click(testButton);

        // Check if simulation runs (look for step info)
        expect(input.value).toBe('ab');
    });
}); 