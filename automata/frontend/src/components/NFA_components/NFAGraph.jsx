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
    const isHidden = data.isHidden;

    // For hidden nodes (start state arrow source), render only handles
    if (isHidden) {
        return (
            <>
                <Handle type="source" position={Position.Right} id="right" isConnectable={isConnectable} />
            </>
        );
    }

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
        
        // Position start state on the left, then arrange others
        // Start state MUST be positioned logically (usually on the left)
        const startStateIndex = nfa.states.indexOf(nfa.startState);
        const otherStates = nfa.states.filter((_, idx) => idx !== startStateIndex);
        
        // Position start state on the left
        if (startStateIndex !== -1) {
            nodePositions[nfa.startState] = { 
                x: centerX - horizontalSpacing * 2 - nodeWidth / 2, 
                y: centerY - nodeHeight / 2 
            };
        }
        
        // Position remaining states
        otherStates.forEach((state, index) => {
            let x, y;
            const totalOtherStates = otherStates.length;
            
            if (totalOtherStates === 4) {
                // 2 rows: 2 each
                const row = index < 2 ? 0 : 1;
                const col = index % 2;
                x = centerX - horizontalSpacing / 2 + col * horizontalSpacing;
                y = centerY - verticalSpacing / 2 + row * verticalSpacing;
            } else if (totalOtherStates === 3) {
                // Single row
                x = centerX - horizontalSpacing + index * horizontalSpacing;
                y = centerY;
            } else {
                // Default: horizontal layout starting from centerX
                x = centerX - (totalOtherStates - 1) * horizontalSpacing / 2 + index * horizontalSpacing;
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

        // Create start state arrow from "nowhere" (no source state)
        // Use a hidden node positioned to the left of start state
        const startStateNodes = [];
        const startStateEdges = [];
        if (nfa.startState && nodePositions[nfa.startState]) {
            const startPos = nodePositions[nfa.startState];
            const startNodeX = startPos.x - 80; // Position hidden node 80px to the left
            const startNodeY = startPos.y; // Same vertical position
            
            // Create hidden start node (invisible, positioned to the left of start state)
            startStateNodes.push({
                id: `start-node-${nfa.startState}`,
                type: 'state',
                position: { x: startNodeX, y: startNodeY },
                data: { 
                    label: '', 
                    isStartState: false, 
                    isAcceptState: false, 
                    isCurrentState: false,
                    isHidden: true // Flag to hide this node
                },
                style: { opacity: 0, width: 1, height: 1 },
                draggable: false,
            });
            
            // Create arrow edge from hidden start node to start state
            startStateEdges.push({
                id: `start-${nfa.startState}`,
                source: `start-node-${nfa.startState}`,
                target: nfa.startState,
                sourceHandle: 'right',
                targetHandle: 'left',
                type: 'smoothstep',
                style: {
                    stroke: '#000000',
                    strokeWidth: 2,
                },
                markerEnd: {
                    type: MarkerType.ArrowClosed,
                    color: '#000000',
                    width: 20,
                    height: 20,
                },
            });
        }

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
            
            // Color scheme matching reference image: purple for regular transitions
            let edgeColor = '#8b5cf6'; // Purple for regular transitions (matching reference)
            let labelColor = '#1f2937'; // Dark gray/black for labels
            let labelBgColor = 'transparent'; // No white background
            let arrowColor = '#8b5cf6'; // Purple arrowheads
            
            if (isHighlighted) {
                // Use the color from the active path
                const pathColor = matchingTransitions[0].color;
                edgeColor = pathColor;
                arrowColor = pathColor;
                labelColor = pathColor;
                labelBgColor = 'transparent'; // No background for highlighted edges
            } else if (isEpsilon) {
                // Epsilon transitions: purple
                edgeColor = '#8b5cf6';
                arrowColor = '#8b5cf6';
                labelColor = '#1f2937';
                labelBgColor = 'transparent'; // No white background
            }

            // Regular transitions: STRAIGHT lines (default type)
            // Self-loops: CURVED arrows (smoothstep with curvature)
            let edgeType = 'default'; // Straight lines for regular transitions
            let edgeStyle = {
                stroke: edgeColor,
                strokeWidth: isHighlighted ? 4 : 2,
                strokeDasharray: 'none',
                opacity: isHighlighted ? 1 : 1, // Full opacity for all transitions
            };

            // Calculate source and target handles
            const sourcePos = nodePositions[group.from];
            const targetPos = nodePositions[group.to];
            let sourceHandle = 'right';
            let targetHandle = 'left';
            let pathOptions = {};
            
            if (isSelfLoop) {
                // Self-loops: CURVED arrow looping from node back to itself
                // Reference shows curved loop above node (from top-right to top-left)
                // Use smoothstep with top handles and high curvature for visible curved loop
                edgeType = 'smoothstep';
                sourceHandle = 'top'; // Start from top
                targetHandle = 'top'; // End at top - creates curved loop above
                pathOptions = {
                    curvature: 1.0, // Maximum curvature for pronounced loop
                };
                edgeStyle = {
                    stroke: edgeColor,
                    strokeWidth: isHighlighted ? 3 : 2.5, // Thicker for visibility
                    opacity: 1, // Full opacity - ensure it's visible
                    strokeDasharray: 'none',
                };
            } else if (sourcePos && targetPos) {
                // Regular transitions: STRAIGHT lines
                const dx = targetPos.x - sourcePos.x;
                const dy = targetPos.y - sourcePos.y;
                
                // Determine handle positions for straight connections
                if (Math.abs(dx) > Math.abs(dy)) {
                    // Horizontal connection
                    sourceHandle = dx > 0 ? 'right' : 'left';
                    targetHandle = dx > 0 ? 'left' : 'right';
                } else {
                    // Vertical connection
                    sourceHandle = dy > 0 ? 'bottom' : 'top';
                    targetHandle = dy > 0 ? 'top' : 'bottom';
                }
                
                // No curvature for regular transitions - keep them straight
                pathOptions = {};
            }

            const edgeConfig = {
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
                data: {
                    isSelfLoop: isSelfLoop, // Add data attribute for CSS targeting
                },
                labelStyle: {
                    fill: labelColor,
                    fontWeight: isHighlighted ? 700 : (isEpsilon ? 700 : 600),
                    fontSize: isEpsilon ? 18 : 16, // Larger for visibility, even bigger for epsilon
                    fontStyle: isEpsilon ? 'italic' : 'normal',
                },
                labelBgStyle: {
                    fill: labelBgColor,
                    fillOpacity: 0,
                    rx: 5,
                    ry: 5,
                },
                labelBgPadding: [4, 4],
                labelShowBg: false, // No background for labels
                // Position labels above the arrow lines
                labelOffset: isSelfLoop ? -20 : -15, // Negative offset moves label above the line
                markerEnd: {
                    type: MarkerType.ArrowClosed,
                    color: arrowColor,
                    width: isSelfLoop ? 15 : 20,
                    height: isSelfLoop ? 15 : 20,
                },
            };
            
            return edgeConfig;
        });

        // Combine start state nodes and edges with regular nodes and edges
        const allNodes = [...startStateNodes, ...nodes];
        const allEdges = [...startStateEdges, ...edges];
        
        return { nodes: allNodes, edges: allEdges };
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
                    type: 'default', // Straight lines by default
                    style: { strokeWidth: 2, stroke: '#8b5cf6' },
                    markerEnd: {
                        type: MarkerType.ArrowClosed,
                        color: '#8b5cf6',
                        width: 20,
                        height: 20,
                    },
                }}
                connectionLineType="default"
            >
                <Background color="#e5e7eb" gap={16} />
                <Controls />
            </ReactFlow>
        </div>
    );
};

export default NFAGraph;
