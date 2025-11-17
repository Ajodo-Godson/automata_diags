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
            {/* Handles on all four sides to prevent edges going through nodes */}
            <Handle type="target" position={Position.Top} id="top" isConnectable={isConnectable} />
            <Handle type="target" position={Position.Right} id="right" isConnectable={isConnectable} />
            <Handle type="target" position={Position.Bottom} id="bottom" isConnectable={isConnectable} />
            <Handle type="target" position={Position.Left} id="left" isConnectable={isConnectable} />
            <Handle type="source" position={Position.Top} id="top" isConnectable={isConnectable} />
            <Handle type="source" position={Position.Right} id="right" isConnectable={isConnectable} />
            <Handle type="source" position={Position.Bottom} id="bottom" isConnectable={isConnectable} />
            <Handle type="source" position={Position.Left} id="left" isConnectable={isConnectable} />
            <div className="nfa-state-label">{data.label}</div>
            {isAcceptState && <div className="nfa-accept-circle" />}
            {showDelete && (
                <button className="state-delete-btn" onClick={handleDelete} title="Delete state">
                    ×
                </button>
            )}
        </div>
    );
};

const nodeTypes = {
    state: StateNode,
};

const NFAGraph = ({ nfa, currentStates = [], activeTransitions = [] }) => {
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
        // Clean 2-row grid layout matching reference image
        const nodePositions = {};
        const nodeWidth = 70;
        const nodeHeight = 70;
        const horizontalSpacing = 200;
        const verticalSpacing = 180;
        
        const numStates = nfa.states.length;
        const centerX = 400;
        const centerY = 250;
        
        // For 5 states: top row has 3, bottom row has 2
        // For 4 states: top row has 2, bottom row has 2
        // For 3 states: all in one row
        nfa.states.forEach((state, index) => {
            let x, y;
            
            if (numStates === 5) {
                // 2 rows: top 3, bottom 2
                if (index < 3) {
                    // Top row: 3 states
                    x = centerX - horizontalSpacing + index * horizontalSpacing;
                    y = centerY - verticalSpacing / 2;
                } else {
                    // Bottom row: 2 states (aligned under middle of top row)
                    const bottomIndex = index - 3;
                    x = centerX - horizontalSpacing / 2 + bottomIndex * horizontalSpacing;
                    y = centerY + verticalSpacing / 2;
                }
            } else if (numStates === 4) {
                // 2 rows: 2 each
                const row = index < 2 ? 0 : 1;
                const col = index % 2;
                x = centerX - horizontalSpacing / 2 + col * horizontalSpacing;
                y = centerY - verticalSpacing / 2 + row * verticalSpacing;
            } else if (numStates === 3) {
                // Single row
                x = centerX - horizontalSpacing + index * horizontalSpacing;
                y = centerY;
            } else {
                // Default: horizontal layout
                x = centerX - (numStates - 1) * horizontalSpacing / 2 + index * horizontalSpacing;
                y = centerY;
            }
            
            nodePositions[state] = { x: x - nodeWidth / 2, y: y - nodeHeight / 2 };
        });

        // Create nodes with calculated positions
        const nodes = nfa.states.map((state) => {
            const isCurrentNode = currentStates.includes(state);
            const pos = nodePositions[state];

            return {
                id: state,
                type: 'state',
                position: pos,
                data: {
                    label: state,
                    isAcceptState: nfa.acceptStates.includes(state),
                    isStartState: state === nfa.startState,
                    isCurrentState: isCurrentNode,
                },
                draggable: true,
            };
        });

        // Group transitions by (from, to) pair to combine labels
        const edgeGroups = {};
        nfa.transitions.forEach((transition) => {
            const key = `${transition.from}-${transition.to}`;
            if (!edgeGroups[key]) {
                edgeGroups[key] = {
                    from: transition.from,
                    to: transition.to,
                    symbols: [],
                    isEpsilon: false,
                };
            }
            const isEpsilon = transition.symbol === 'ε' || transition.symbol === 'epsilon';
            if (isEpsilon) {
                edgeGroups[key].isEpsilon = true;
            }
            edgeGroups[key].symbols.push(transition.symbol);
        });

        // Group transitions by (from, symbol) to identify non-determinism
        const nonDeterministicGroups = {};
        nfa.transitions.forEach((transition) => {
            const key = `${transition.from}-${transition.symbol}`;
            if (!nonDeterministicGroups[key]) {
                nonDeterministicGroups[key] = [];
            }
            nonDeterministicGroups[key].push(transition.to);
        });

        // Note: Bezier edges will automatically create smooth curves

        // Create edges with combined labels
        const edges = Object.values(edgeGroups).map((group, index) => {
            const isSelfLoop = group.from === group.to;
            const isEpsilon = group.isEpsilon;
            
            // Sort symbols: epsilon first, then alphabetically
            const sortedSymbols = group.symbols.sort((a, b) => {
                if (a === 'ε' || a === 'epsilon') return -1;
                if (b === 'ε' || b === 'epsilon') return 1;
                return a.localeCompare(b);
            });
            
            // Combine symbols into label (e.g., "a, b" or "ε, a")
            const label = sortedSymbols.join(', ');
            
            // Check if this edge is part of any active transition path
            const matchingTransitions = activeTransitions.filter(at => 
                at.from === group.from && 
                at.to === group.to && 
                sortedSymbols.includes(at.symbol)
            );
            
            const isHighlighted = matchingTransitions.length > 0;
            
            // Check for non-determinism (multiple targets from same state with same symbol)
            const hasNonDeterminism = sortedSymbols.some(symbol => {
                const key = `${group.from}-${symbol}`;
                return nonDeterministicGroups[key] && nonDeterministicGroups[key].length > 1;
            });
            
            // Color scheme: Use path-specific colors when active, otherwise default colors
            let edgeColor = '#9ca3af'; // Light gray for inactive transitions
            let labelColor = '#6b7280'; // Gray for inactive labels
            let labelBgColor = '#ffffff';
            let arrowColor = '#9ca3af'; // GRAY arrowheads
            
            if (isHighlighted) {
                // Use the color from the active path
                const pathColor = matchingTransitions[0].color;
                edgeColor = pathColor;
                arrowColor = pathColor;
                labelColor = pathColor;
                labelBgColor = `${pathColor}20`; // Light transparent background
            } else if (isEpsilon) {
                // Inactive EPSILON transitions: distinct but muted
                edgeColor = '#d8b4fe'; // Light purple
                arrowColor = '#d8b4fe';
                labelColor = '#a855f7';
                labelBgColor = '#fae8ff';
            }

            // Use bezier edges for smooth, flexible curves
            let edgeType = 'bezier';
            let edgeStyle = {
                stroke: edgeColor,
                strokeWidth: isHighlighted ? 4 : 2, // Thicker and more vivid for active paths
                strokeDasharray: 'none',
                opacity: isHighlighted ? 1 : 0.4, // Dim inactive transitions
            };

            // Calculate source and target handles to connect at edges, avoiding node centers
            const sourcePos = nodePositions[group.from];
            const targetPos = nodePositions[group.to];
            let sourceHandle = 'right';
            let targetHandle = 'left';
            let pathOptions = {};
            
            if (isSelfLoop) {
                // Self-loops: use bezier with custom curvature
                edgeType = 'bezier';
                sourceHandle = 'top';
                targetHandle = 'top';
                // Create a nice curved self-loop
                pathOptions = {
                    curvature: 0.8,
                    offset: 50, // Offset the loop outward
                };
                edgeStyle = {
                    ...edgeStyle,
                    strokeWidth: isHighlighted ? 2.5 : 2,
                };
            } else if (sourcePos && targetPos) {
                const dx = targetPos.x - sourcePos.x;
                const dy = targetPos.y - sourcePos.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                // Determine handle positions based on relative positions
                // Bezier edges will automatically create smooth, flexible curves
                if (Math.abs(dx) > Math.abs(dy)) {
                    // Horizontal connection
                    sourceHandle = dx > 0 ? 'right' : 'left';
                    targetHandle = dx > 0 ? 'left' : 'right';
                } else {
                    // Vertical connection
                    sourceHandle = dy > 0 ? 'bottom' : 'top';
                    targetHandle = dy > 0 ? 'top' : 'bottom';
                }
                
                // Calculate curvature based on distance - bezier edges create smooth curves
                // More curvature for longer edges, less for shorter ones
                const curvature = Math.min(0.5, Math.max(0.25, distance / 500));
                
                pathOptions = {
                    curvature: curvature,
                };
            }

            return {
                id: `${group.from}-${group.to}-${label}-${index}`,
                source: group.from,
                target: group.to,
                sourceHandle: sourceHandle,
                targetHandle: targetHandle,
                label: label,
                type: edgeType,
                animated: isHighlighted,
                style: edgeStyle,
                ...pathOptions, // Spread path options (curvature, offset)
                labelStyle: {
                    fill: labelColor,
                    fontWeight: isHighlighted ? 700 : (isEpsilon ? 700 : 600),
                    fontSize: isEpsilon ? 18 : 16, // Larger for visibility, even bigger for epsilon
                    fontStyle: isEpsilon ? 'italic' : 'normal',
                },
                labelBgStyle: {
                    fill: labelBgColor,
                    fillOpacity: 0.98,
                    rx: 5,
                    ry: 5,
                },
                labelBgPadding: [8, 6], // More padding for better visibility
                markerEnd: {
                    type: MarkerType.ArrowClosed,
                    color: arrowColor,
                    width: isSelfLoop ? 15 : 20,
                    height: isSelfLoop ? 15 : 20,
                },
            };
        });

        return { nodes, edges };
    }, [nfa.states, nfa.transitions, nfa.acceptStates, nfa.startState, currentStates, activeTransitions]);

    const { nodes, edges } = getLayoutedElements();

    return (
        <div className="nfa-graph-container" style={{ height: '500px', width: '100%' }}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                onInit={setReactFlowInstance}
                fitView
                attributionPosition="bottom-left"
                minZoom={0.3}
                maxZoom={2}
                defaultViewport={{ x: 0, y: 0, zoom: 1 }}
                snapToGrid={false}
                nodesDraggable={true}
                nodesConnectable={false}
                elementsSelectable={false}
                defaultEdgeOptions={{
                    type: 'bezier',
                    style: { strokeWidth: 2 },
                    markerEnd: {
                        type: MarkerType.ArrowClosed,
                        color: '#9ca3af',
                        width: 20,
                        height: 20,
                    },
                }}
                connectionLineType="bezier"
            >
                <Background color="#e5e7eb" gap={16} />
                <Controls />
            </ReactFlow>
        </div>
    );
};

export default NFAGraph;
