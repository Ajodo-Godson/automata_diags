import React from 'react';
import { render } from '@testing-library/react';
import DFAGraph from '../DFA_components/DFAGraph';

// Mock ReactFlow since it uses canvas
jest.mock('reactflow', () => ({
    __esModule: true,
    default: () => <div data-testid="mock-flow" />,
    Background: () => <div data-testid="mock-background" />,
    Controls: () => <div data-testid="mock-controls" />,
    Handle: () => <div data-testid="mock-handle" />,
    Position: { Left: 'left', Right: 'right' },
}));

describe('DFAGraph', () => {
    const mockProps = {
        states: ['q0', 'q1'],
        transitions: {
            q0: { a: 'q1' },
            q1: { a: 'q1' }
        },
        startState: 'q0',
        acceptStates: new Set(['q1']),
        currentState: 'q0'
    };

    test('renders with basic props', () => {
        const { container } = render(<DFAGraph {...mockProps} />);
        expect(container).toBeInTheDocument();
    });

    test('creates correct number of nodes', () => {
        const { getAllByTestId } = render(<DFAGraph {...mockProps} />);
        const nodes = getAllByTestId('mock-handle');
        expect(nodes).toHaveLength(4); // 2 handles per state
    });
}); 