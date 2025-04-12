import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DFASimulator from '../DFA_components/DFASimulator';

describe('DFASimulator', () => {
    test('renders initial state correctly', () => {
        render(<DFASimulator />);

        // Check for basic elements
        expect(screen.getByText('DFA Simulator')).toBeInTheDocument();
        expect(screen.getByText('Add State')).toBeInTheDocument();
        expect(screen.getByText('Add Symbol')).toBeInTheDocument();
    });

    test('can add new state', () => {
        render(<DFASimulator />);
        const addStateButton = screen.getByText('Add State');

        fireEvent.click(addStateButton);
        expect(screen.getByText('q1')).toBeInTheDocument();
    });

    test('can toggle accept state', () => {
        render(<DFASimulator />);
        const checkbox = screen.getByRole('checkbox');

        fireEvent.click(checkbox);
        expect(checkbox).toBeChecked();
    });

    test('simulates string correctly', async () => {
        render(<DFASimulator />);

        // Load example DFA that accepts strings ending with 'ab'
        const exampleButton = screen.getByText("Ends with 'ab'");
        fireEvent.click(exampleButton);

        // Enter test string
        const input = screen.getByPlaceholderText('Enter string to test');
        await userEvent.type(input, 'ab');

        // Run simulation
        const testButton = screen.getByText('Test');
        fireEvent.click(testButton);

        // Check result
        expect(screen.getByText('String accepted')).toBeInTheDocument();
    });
}); 