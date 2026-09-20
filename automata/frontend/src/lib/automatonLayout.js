import dagre from 'dagre';

/**
 * Shared graph layout for the DFA, NFA and PDA state diagrams.
 *
 * These three used to each hand-roll positions with an if/else ladder that
 * only covered 1-4 states and dumped anything larger into a single
 * overlapping row. `dagre` was already a dependency; this uses it.
 *
 * Automata read left-to-right from the start state, so the rank direction is
 * always LR and the start state is pinned to the first rank.
 */

export const NODE_SIZE = 64;

/** How far a self-loop arc itself rises above its node. */
export const SELF_LOOP_RISE = 42;

/** Line box of a stacked edge label. */
const LABEL_LINE_HEIGHT = 19;

/**
 * Most lines a single edge label may occupy on the canvas.
 *
 * A PDA state can carry a dozen self-loop rules; stacked in full they dwarf
 * the states and push the rest of the machine out of view. The diagram shows
 * the structure and the first few rules; the Transitions panel is the
 * complete, authoritative list.
 */
const MAX_LABEL_LINES = 4;

/**
 * The lines an edge label actually renders.
 *
 * Short symbols read best inline ("a, b"); longer ones — a PDA's
 * "(, Z → (Z" — get a line each, because several joined by commas is a wall
 * of punctuation. Beyond MAX_LABEL_LINES the remainder is summarised.
 */
export function edgeLabelLines(labels = []) {
    const joined = labels.join(', ');
    if (labels.length < 2 || joined.length <= 14) return [joined];
    if (labels.length <= MAX_LABEL_LINES) return [...labels];

    const shown = labels.slice(0, MAX_LABEL_LINES - 1);
    return [...shown, `+${labels.length - shown.length} more`];
}

/** Both the edge renderer and the headroom calculation ask this, so a label
 *  can never be taller than the space reserved for it. */
export function labelLineCount(labels = []) {
    return edgeLabelLines(labels).length;
}

/**
 * Vertical space a self-loop arc *and its label* occupy above a state.
 *
 * This was a single constant, which left a PDA's three-line rule block
 * overlapping its own loop arc while a DFA's single character had room to
 * spare. dagre is given the same number so ranks separate correctly.
 */
export function loopHeadroom(labels) {
    return SELF_LOOP_RISE + labelLineCount(labels) * LABEL_LINE_HEIGHT + 10;
}

/** Dagre needs a little more room vertically than it thinks it does. */
const RANK_SEP = 110;
const NODE_SEP = 56;
const EDGE_SEP = 18;

/**
 * @param {string[]} states
 * @param {Array<{from: string, to: string}>} edges  deduplicated by pair
 * @param {string} startState
 * @returns {Record<string, {x: number, y: number}>} top-left positions
 */
export function layoutStates(states, edges, startState, headrooms = {}) {
    const g = new dagre.graphlib.Graph({ multigraph: false, compound: false });
    g.setGraph({
        rankdir: 'LR',
        ranksep: RANK_SEP,
        nodesep: NODE_SEP,
        edgesep: EDGE_SEP,
        marginx: NODE_SIZE / 2,
        marginy: NODE_SIZE / 2,
        // 'longest-path' keeps chains like q0→q1→q2 on one straight line,
        // which is what a reader expects from a textbook diagram.
        ranker: 'longest-path',
    });
    g.setDefaultEdgeLabel(() => ({}));

    states.forEach((s) => {
        g.setNode(s, {
            width: NODE_SIZE,
            height: NODE_SIZE + (headrooms[s] || 0),
        });
    });

    // Self-loops contribute nothing to ranking and confuse dagre's ordering.
    const seen = new Set();
    edges.forEach(({ from, to }) => {
        if (from === to) return;
        if (!g.hasNode(from) || !g.hasNode(to)) return;
        const key = `${from}\u0000${to}`;
        if (seen.has(key)) return;
        seen.add(key);
        g.setEdge(from, to);
    });

    dagre.layout(g);

    const positions = {};
    states.forEach((s) => {
        const node = g.node(s);
        if (!node) {
            positions[s] = { x: 0, y: 0 };
            return;
        }
        // dagre gives centres of the (possibly taller) box; these positions
        // address the circle, which sits at the bottom of that box.
        positions[s] = {
            x: node.x - NODE_SIZE / 2,
            y: node.y + node.height / 2 - NODE_SIZE,
        };
    });

    // Unreachable states get ranked arbitrarily by dagre and can land on top
    // of the start state. Nudge the start state to the leftmost column so the
    // entry point is always where the eye starts.
    if (startState && positions[startState]) {
        const minX = Math.min(...Object.values(positions).map((p) => p.x));
        if (positions[startState].x > minX) {
            positions[startState] = { ...positions[startState], x: minX };
        }
    }

    return positions;
}

/**
 * Collapse a transition list into one edge per ordered pair, joining the
 * symbols into a single label. Two states connected by `a` and `b` should be
 * one arrow reading "a, b", not two arrows on top of each other.
 *
 * @param {Array<{from: string, to: string, label: string}>} transitions
 */
export function groupTransitions(transitions) {
    const groups = new Map();
    transitions.forEach(({ from, to, label }) => {
        const key = `${from}\u0000${to}`;
        if (!groups.has(key)) {
            groups.set(key, { from, to, labels: [] });
        }
        const group = groups.get(key);
        if (!group.labels.includes(label)) group.labels.push(label);
    });
    return [...groups.values()];
}

/**
 * Pick source/target handles so an edge leaves and enters at sensible points.
 *
 * Forward edges (left to right) run right→left. Backward edges are routed
 * under the graph so they never overlap the forward path. Self-loops are
 * drawn by a custom edge and use top→top.
 */
export function pickHandles(from, to, positions) {
    if (from === to) return { sourceHandle: 'top', targetHandle: 'top' };

    const a = positions[from];
    const b = positions[to];
    if (!a || !b) return { sourceHandle: 'right', targetHandle: 'left' };

    const dx = b.x - a.x;
    const dy = b.y - a.y;

    if (Math.abs(dx) >= Math.abs(dy)) {
        return dx >= 0
            ? { sourceHandle: 'right', targetHandle: 'left' }
            : { sourceHandle: 'bottom', targetHandle: 'bottom' };
    }
    return dy >= 0
        ? { sourceHandle: 'bottom', targetHandle: 'top' }
        : { sourceHandle: 'top', targetHandle: 'bottom' };
}
