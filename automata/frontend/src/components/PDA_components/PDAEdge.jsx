import React from 'react';
import { getBezierPath, EdgeLabelRenderer, BaseEdge } from 'reactflow';

/**
 * Custom PDA Edge Component
 * Renders transitions as a clean vertical list instead of a long horizontal string.
 * Handles self-loops with custom path geometry.
 */
export default function PDAEdge({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    markerEnd,
    data,
}) {
    const isSelfLoop = data?.isSelfLoop;
    let edgePath = '';
    let labelX, labelY;

    if (isSelfLoop) {
        // Custom loop geometry: Draw a loop going up and around (top-right "ear")
        const radiusX = 40;
        const radiusY = 50;
        // Cubic bezier loop that goes up and curves back
        edgePath = `M ${sourceX} ${sourceY} C ${sourceX + radiusX} ${sourceY - radiusY * 1.5}, ${sourceX + radiusX * 1.5} ${sourceY - radiusY}, ${targetX} ${targetY}`;
        labelX = sourceX + 55;
        labelY = sourceY - 55;
    } else {
        // Standard Bezier for normal edges
        const [path, lx, ly] = getBezierPath({
            sourceX,
            sourceY,
            sourcePosition,
            targetPosition,
            targetX,
            targetY,
        });
        edgePath = path;
        labelX = lx;
        labelY = ly;
    }

    const transitions = data?.transitions || [];

    return (
        <>
            <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
            <EdgeLabelRenderer>
                <div
                    style={{
                        position: 'absolute',
                        transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
                        // Card styling
                        background: '#ffffff',
                        padding: '6px 10px',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        fontSize: 11,
                        fontWeight: 500,
                        fontFamily: "'Consolas', 'Monaco', 'Fira Code', monospace",
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                        pointerEvents: 'all',
                        zIndex: 10,
                        maxHeight: '120px',
                        overflowY: 'auto',
                        textAlign: 'left',
                        minWidth: '85px',
                    }}
                    className="nodrag nopan pda-edge-label"
                >
                    {transitions.map((t, i) => (
                        <div
                            key={i}
                            style={{
                                borderBottom: i < transitions.length - 1 ? '1px solid #f1f5f9' : 'none',
                                padding: '3px 0',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {/* Input (Blue) */}
                            <span style={{ color: '#2563eb', fontWeight: 600 }}>
                                {t.input === 'ε' || t.input === '' ? 'ε' : t.input}
                            </span>
                            <span style={{ color: '#94a3b8' }}>, </span>
                            {/* Pop (Gray) */}
                            <span style={{ color: '#64748b' }}>
                                {t.pop === 'ε' || t.pop === '' ? 'ε' : t.pop}
                            </span>
                            <span style={{ color: '#94a3b8' }}> → </span>
                            {/* Push (Green) */}
                            <span style={{ color: '#059669', fontWeight: 600 }}>
                                {t.push === 'ε' || t.push === '' ? 'ε' : t.push}
                            </span>
                        </div>
                    ))}
                </div>
            </EdgeLabelRenderer>
        </>
    );
}
