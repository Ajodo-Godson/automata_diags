import React from 'react';

const NFAGraph = ({ nfa, currentStates = [], highlightTransition = null }) => {
    // compute state positions
    const positions = nfa.states.map((s, index) => ({
        state: s,
        x: 100 + index * 150,
        y: 200,
    }));

    // helper to find position
    const findPos = (state) => positions.find(p => p.state === state) || { x: 0, y: 0 };

    // group transitions by pair to compute offsets for multi-edges
    const pairCounts = {};
    nfa.transitions.forEach(t => {
        const key = `${t.from}->${t.to}`;
        pairCounts[key] = (pairCounts[key] || 0) + 1;
    });

    // track used index per pair
    const pairIndex = {};

    return (
        <div className="nfa-graph">
            <div className="graph-container">
                <svg width="100%" height="400" viewBox="0 0 800 400">
                    <defs>
                        <marker
                            id="arrowhead"
                            markerWidth="10"
                            markerHeight="7"
                            refX="9"
                            refY="3.5"
                            orient="auto"
                        >
                            <polygon points="0 0, 10 3.5, 0 7" fill="#374151" />
                        </marker>
                    </defs>

                    {/* Render transitions as curved paths */}
                    {nfa.transitions.map((t, idx) => {
                        const fromPos = findPos(t.from);
                        const toPos = findPos(t.to);
                        const key = `${t.from}->${t.to}`;
                        pairIndex[key] = (pairIndex[key] || 0) + 1;
                        const occ = pairIndex[key];
                        const total = pairCounts[key];

                        // midpoint
                        const mx = (fromPos.x + toPos.x) / 2;
                        const my = (fromPos.y + toPos.y) / 2;

                        // offset perpendicular to line
                        const dx = toPos.x - fromPos.x;
                        const dy = toPos.y - fromPos.y;
                        const len = Math.sqrt(dx * dx + dy * dy) || 1;
                        const ux = -dy / len;
                        const uy = dx / len;

                        // spacing between multiple edges
                        const spacing = 20;
                        const offsetMultiplier = (occ - (total + 1) / 2);
                        const cx = mx + ux * spacing * offsetMultiplier;
                        const cy = my + uy * spacing * offsetMultiplier;

                        // for self-loop, draw a circular loop
                        if (t.from === t.to) {
                            const loopX = fromPos.x;
                            const loopY = fromPos.y - 40 - (occ - 1) * 6;
                            const path = `M ${fromPos.x} ${fromPos.y - 20} C ${loopX + 40} ${loopY} ${loopX - 40} ${loopY} ${fromPos.x} ${fromPos.y - 20}`;
                            const isHighlighted = highlightTransition && highlightTransition.symbol === t.symbol && highlightTransition.from?.includes(t.from) && highlightTransition.to?.includes(t.to);
                            return (
                                <g key={`t-${idx}`}>
                                    <path d={path} fill="none" stroke={isHighlighted ? '#ef4444' : '#6b7280'} strokeWidth={isHighlighted ? 3 : 1.8} markerEnd="url(#arrowhead)" />
                                    <text x={fromPos.x} y={loopY - 6} textAnchor="middle" className="transition-label">{t.symbol}</text>
                                </g>
                            );
                        }

                        const path = `M ${fromPos.x} ${fromPos.y} Q ${cx} ${cy} ${toPos.x} ${toPos.y}`;
                        const labelX = cx;
                        const labelY = cy - 6;

                        const isHighlighted = highlightTransition && highlightTransition.symbol === t.symbol && highlightTransition.from?.includes(t.from) && highlightTransition.to?.includes(t.to);

                        return (
                            <g key={`t-${idx}`}>
                                <path d={path} fill="none" stroke={isHighlighted ? '#ef4444' : '#6b7280'} strokeWidth={isHighlighted ? 3 : 1.8} markerEnd="url(#arrowhead)" />
                                <text x={labelX} y={labelY} textAnchor="middle" className="transition-label">{t.symbol}</text>
                            </g>
                        );
                    })}

                    {/* Render states on top of transitions */}
                    {positions.map((p, index) => {
                        const state = p.state;
                        const x = p.x;
                        const y = p.y;
                        const isActive = currentStates.includes(state);
                        const isStart = state === nfa.startState;
                        const isAccept = nfa.acceptStates.includes(state);

                        return (
                            <g key={`s-${state}`}>
                                {isStart && (
                                    <path d={`M ${x - 40} ${y} L ${x - 25} ${y}`} stroke="#4f46e5" strokeWidth="2" markerEnd="url(#arrowhead)" />
                                )}

                                <circle cx={x} cy={y} r={isAccept ? '22' : '20'} fill={isActive ? '#3b82f6' : '#f8fafc'} stroke={isActive ? '#1d4ed8' : '#e2e8f0'} strokeWidth={isActive ? '3' : '2'} />

                                {isAccept && (
                                    <circle cx={x} cy={y} r="16" fill="none" stroke={isActive ? '#1d4ed8' : '#e2e8f0'} strokeWidth={isActive ? '3' : '2'} />
                                )}

                                <text x={x} y={y + 5} textAnchor="middle" className="state-label" fill={isActive ? 'white' : '#1f2937'}>{state}</text>
                            </g>
                        );
                    })}
                </svg>
            </div>

            <div className="transition-table">
                <h4>Transition Function</h4>
                <table>
                    <thead>
                        <tr>
                            <th>From</th>
                            <th>Symbol</th>
                            <th>To</th>
                        </tr>
                    </thead>
                    <tbody>
                        {nfa.transitions.map((transition, index) => (
                            <tr key={index}>
                                <td>{transition.from}</td>
                                <td>{transition.symbol}</td>
                                <td>{transition.to}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default NFAGraph;