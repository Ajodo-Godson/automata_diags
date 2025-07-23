import React from 'react';
import { render, screen } from '@testing-library/react';
import Layout from '../Layout';

describe('Layout', () => {
    test('renders header and navigation', () => {
        render(<Layout automata="DFA" setAutomata={() => {}} />);

        expect(screen.getByText('Interactive Automata Toolkit')).toBeInTheDocument();
        expect(screen.getByText('Documentation')).toBeInTheDocument();
        expect(screen.getByText('Help')).toBeInTheDocument();
    });

    test('renders sidebar with automata types', () => {
        render(<Layout automata="DFA" setAutomata={() => {}} />);

        expect(screen.getByText('DFA')).toBeInTheDocument();
        expect(screen.getByText('PDA')).toBeInTheDocument();
        expect(screen.getByText('TM')).toBeInTheDocument();
        expect(screen.getByText('CFG')).toBeInTheDocument();
    });

    test('renders children content', () => {
        render(
            <Layout automata="DFA" setAutomata={() => {}}>
                <div data-testid="test-content">Test Content</div>
            </Layout>
        );

        expect(screen.getByTestId('test-content')).toBeInTheDocument();
    });
}); 