import React from 'react';
import { render, screen } from '@testing-library/react';
import Layout from '../Layout';

describe('Layout', () => {
    test('renders header and navigation', () => {
        render(<Layout />);

        expect(screen.getByText('Interactive Automata Toolkit')).toBeInTheDocument();
        expect(screen.getByText('Documentation')).toBeInTheDocument();
        expect(screen.getByText('Help')).toBeInTheDocument();
    });

    test('renders sidebar with automata types', () => {
        render(<Layout />);

        expect(screen.getByText('DFA')).toBeInTheDocument();
        expect(screen.getByText('NFA (Coming Soon)')).toBeInTheDocument();
        expect(screen.getByText('PDA (Coming Soon)')).toBeInTheDocument();
    });

    test('renders children content', () => {
        render(
            <Layout>
                <div data-testid="test-content">Test Content</div>
            </Layout>
        );

        expect(screen.getByTestId('test-content')).toBeInTheDocument();
    });

    test('includes export json button', () => {
        render(<Layout />);
        expect(screen.getByText('Export JSON')).toBeInTheDocument();
    });
});