import { groupTransitions, layoutStates, pickHandles } from '../../lib/automatonLayout';

/*
 * The diagram used to hand-roll positions with an if/else ladder covering only
 * 1-4 states, dumping anything larger into one overlapping row.
 */
describe('layoutStates', () => {
    const chain = (n) => Array.from({ length: n }, (_, i) => `q${i}`);
    const chainEdges = (n) =>
        Array.from({ length: n - 1 }, (_, i) => ({ from: `q${i}`, to: `q${i + 1}` }));

    test('positions every state it is given', () => {
        const states = chain(9);
        const pos = layoutStates(states, chainEdges(9), 'q0');
        states.forEach((s) => {
            expect(pos[s]).toEqual({ x: expect.any(Number), y: expect.any(Number) });
        });
    });

    test('never overlaps two states, even past the old four-state ceiling', () => {
        const states = chain(12);
        const pos = layoutStates(states, chainEdges(12), 'q0');
        const seen = new Set();
        states.forEach((s) => {
            const key = `${Math.round(pos[s].x)},${Math.round(pos[s].y)}`;
            expect(seen.has(key)).toBe(false);
            seen.add(key);
        });
    });

    test('puts the start state in the leftmost column', () => {
        const states = chain(6);
        const pos = layoutStates(states, chainEdges(6), 'q0');
        const minX = Math.min(...states.map((s) => pos[s].x));
        expect(pos.q0.x).toBe(minX);
    });

    test('lays a chain out left to right', () => {
        const pos = layoutStates(chain(4), chainEdges(4), 'q0');
        expect(pos.q0.x).toBeLessThan(pos.q1.x);
        expect(pos.q1.x).toBeLessThan(pos.q2.x);
        expect(pos.q2.x).toBeLessThan(pos.q3.x);
    });

    test('tolerates self-loops and unreachable states', () => {
        const pos = layoutStates(
            ['q0', 'q1', 'orphan'],
            [{ from: 'q0', to: 'q0' }, { from: 'q0', to: 'q1' }],
            'q0'
        );
        expect(Object.keys(pos)).toHaveLength(3);
        expect(pos.orphan).toBeDefined();
    });
});

describe('groupTransitions', () => {
    test('collapses parallel transitions into one labelled edge', () => {
        const groups = groupTransitions([
            { from: 'q0', to: 'q1', label: 'a' },
            { from: 'q0', to: 'q1', label: 'b' },
        ]);
        expect(groups).toHaveLength(1);
        expect(groups[0].labels).toEqual(['a', 'b']);
    });

    test('keeps opposite directions as separate edges', () => {
        const groups = groupTransitions([
            { from: 'q0', to: 'q1', label: 'a' },
            { from: 'q1', to: 'q0', label: 'a' },
        ]);
        expect(groups).toHaveLength(2);
    });

    test('does not repeat a duplicated label', () => {
        const groups = groupTransitions([
            { from: 'q0', to: 'q1', label: 'a' },
            { from: 'q0', to: 'q1', label: 'a' },
        ]);
        expect(groups[0].labels).toEqual(['a']);
    });
});

describe('pickHandles', () => {
    const pos = { q0: { x: 0, y: 0 }, q1: { x: 200, y: 0 } };

    test('routes a self-loop through the top of the node', () => {
        expect(pickHandles('q0', 'q0', pos)).toEqual({
            sourceHandle: 'top',
            targetHandle: 'top',
        });
    });

    test('routes a forward edge right to left', () => {
        expect(pickHandles('q0', 'q1', pos)).toEqual({
            sourceHandle: 'right',
            targetHandle: 'left',
        });
    });

    test('routes a backward edge underneath so it clears the forward path', () => {
        expect(pickHandles('q1', 'q0', pos)).toEqual({
            sourceHandle: 'bottom',
            targetHandle: 'bottom',
        });
    });
});
