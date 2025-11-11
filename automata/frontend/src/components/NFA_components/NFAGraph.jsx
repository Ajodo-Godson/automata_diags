import React, { useCallback, useEffect } from 'react';
import ReactFlow, {
    Background,
    Controls,
    Handle,
    Position,
    MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import './stylings/NFAGraph.css';

const StateNode = ({ data, isConnectable }) => {
    const [showDelete, setShowDelete] = React.useState(false);
    const isAcceptState = data.isAcceptState;
    const isStartState = data.isStartState;
    const isCurrentState = data.isCurrentState;

    const handleDelete = (e) => {
        e.stopPropagation();
        if (window.confirm(`Delete state "${data.label}"?`)) {
            window.dispatchEvent(new CustomEvent('deleteState', { detail: data.label }));
        }
    };

    return (
        <div
            className={`nfa-state-node ${isAcceptState ? 'nfa-accept-state' : ''} 
                       ${isStartState ? 'nfa-start-state' : ''} 
                       ${isCurrentState ? 'nfa-current-state' : ''}`}
            onMouseEnter={() => setShowDelete(true)}
            onMouseLeave={() => setShowDelete(false)}
        >
            <Handle type="target" position={Position.Left} isConnectable={isConnectable} />
            <div className="nfa-state-label">{data.label}</div>
            {isAcceptState && <div className="nfa-accept-circle" />}
            {showDelete && (
                <button className="state-delete-btn" onClick={handleDelete} title="Delete state">
                    ×
                </button>
            )}
            <Handle type="source" position={Position.Right} isConnectable={isConnectable} />
        </div>
    );
};

const nodeTypes = {
    state: StateNode,
};

const NFAGraph = ({ nfa, currentStates = [], highlightTransition = null }) => {
    const [reactFlowInstance, setReactFlowInstance] = React.useState(null);

    // Auto zoom out to fit all nodes when NFA changes
    React.useEffect(() => {
        if (reactFlowInstance) {
            setTimeout(() => {
                reactFlowInstance.fitView({ padding: 0.2, duration: 300 });
            }, 100);
        }
    }, [nfa.states, nfa.transitions, reactFlowInstance]);

    const getLayoutedElements = useCallback(() => {
        // Calculate radius and center
        const radius = Math.min(150, 600 / nfa.states.length);
        const centerX = 300;
        const centerY = 200;

        // Create nodes in a circular layout
        const nodes = nfa.states.map((state, index) => {
            const angle = (index / nfa.states.length) * 2 * Math.PI;
            const isCurrentNode = currentStates.includes(state);

            return {
                id: state,
                type: 'state',
                position: {
                    x: centerX + radius * Math.cos(angle) - 25,
                    y: centerY + radius * Math.sin(angle) - 25,
                },
                data: {
                    label: state,
                    isAcceptState: nfa.acceptStates.includes(state),
                    isStartState: state === nfa.startState,
                    isCurrentState: isCurrentNode,
                },
                draggable: true,
            };
        });

        // Group transitions to identify TRUE non-determinism (same state + same symbol → multiple targets)
        const transitionGroups = {};
        nfa.transitions.forEach((transition, index) => {
            // Key is "from-symbol" to identify non-deterministic transitions
            const key = `${transition.from}-${transition.symbol}`;
            if (!transitionGroups[key]) {
                transitionGroups[key] = [];
            }
            transitionGroups[key].push({ ...transition, originalIndex: index });
        });

        // Define route colors for non-deterministic paths (same state, same symbol, different targets)
        const routeColors = [
            '#10b981', // Green
            '#f59e0b', // Orange
            '#ef4444', // Red
            '#06b6d4', // Cyan
            '#ec4899', // Pink
            '#a855f7', // Purple-ish
        ];

        // Create edges from transitions with intelligent color coding
        const edges = nfa.transitions.map((transition, index) => {
            const edgeId = `${transition.from}-${transition.to}-${transition.symbol}-${index}`;
            const isHighlighted = highlightTransition &&
                highlightTransition.from?.includes(transition.from) &&
                highlightTransition.to?.includes(transition.to) &&
                highlightTransition.symbol === transition.symbol;
            
            // Check if this is an epsilon transition
            const isEpsilon = transition.symbol === 'ε' || transition.symbol === 'epsilon';
            
            // Check if this is a self-loop
            const isSelfLoop = transition.from === transition.to;
            
            // Check for TRUE non-determinism (same state + same symbol → multiple targets)
            const groupKey = `${transition.from}-${transition.symbol}`;
            const group = transitionGroups[groupKey];
            const isNonDeterministic = group.length > 1 && !isEpsilon;
            const routeIndex = group.findIndex(t => t.originalIndex === index);
            
            // Color coding strategy:
            // - Highlighted (active): Bright Blue (#3b82f6) with animation
            // - Epsilon transitions: Purple (#8b5cf6) with dashed line
            // - Non-deterministic (same symbol, multiple targets): Different colors per route
            // - Self-loops: Slightly thicker, more visible
            // - Regular transitions: Gray (#6b7280)
            let edgeColor, labelColor, labelBgColor;
            
            if (isHighlighted) {
                edgeColor = '#3b82f6';
                labelColor = '#3b82f6';
                labelBgColor = '#eff6ff';
            } else if (isEpsilon) {
                edgeColor = '#8b5cf6'; // Purple for epsilon
                labelColor = '#8b5cf6';
                labelBgColor = '#f3e8ff';
            } else if (isNonDeterministic) {
                // TRUE non-determinism: assign different colors to different target states
                edgeColor = routeColors[routeIndex % routeColors.length];
                labelColor = routeColors[routeIndex % routeColors.length];
                labelBgColor = '#fffbeb';
            } else {
                edgeColor = '#6b7280'; // Gray for deterministic transitions
                labelColor = '#374151';
                labelBgColor = '#ffffff';
            }

            return {
                id: edgeId,
                source: transition.from,
                target: transition.to,
                label: transition.symbol,
                type: isSelfLoop ? 'default' : 'smoothstep',
                animated: isHighlighted,
                style: {
                    stroke: edgeColor,
                    strokeWidth: isHighlighted ? 3 : (isEpsilon ? 2.5 : (isNonDeterministic ? 3 : 2)),
                    strokeDasharray: isEpsilon ? '5,5' : 'none',
                },
                labelStyle: {
                    fill: labelColor,
                    fontWeight: isHighlighted ? 700 : (isEpsilon || isNonDeterministic ? 700 : 600),
                    fontSize: isEpsilon ? 16 : (isNonDeterministic ? 15 : 14),
                    fontStyle: isEpsilon ? 'italic' : 'normal',
                },
                labelBgStyle: {
                    fill: labelBgColor,
                    fillOpacity: 0.95,
                    rx: 4,
                    ry: 4,
                    padding: isNonDeterministic ? 6 : 4,
                },
                labelBgPadding: isNonDeterministic ? [8, 6] : [6, 4],
                markerEnd: {
                    type: MarkerType.ArrowClosed,
                    color: edgeColor,
                    width: 20,
                    height: 20,
                },
            };
        });

        return { nodes, edges };
    }, [nfa.states, nfa.transitions, nfa.acceptStates, nfa.startState, currentStates, highlightTransition]);

    const { nodes, edges } = getLayoutedElements();

    return (
        <div className="nfa-graph-container" style={{ height: '400px', width: '100%' }}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                onInit={setReactFlowInstance}
                fitView
                attributionPosition="bottom-left"
                minZoom={0.3}
                maxZoom={1.5}
                defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
                defaultEdgeOptions={{
                    type: 'smoothstep',
                }}
            >
                <Background color="#e5e7eb" gap={16} />
                <Controls />
            </ReactFlow>
        </div>
    );
};

export default NFAGraph;
