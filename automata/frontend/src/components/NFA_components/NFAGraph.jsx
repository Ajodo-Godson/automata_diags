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
            {/* Handles on all four sides */}
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
        const nodePositions = {};
        const nodeWidth = 70;
        const nodeHeight = 70;
        const horizontalSpacing = 200;
        const verticalSpacing = 180;
        
        const centerX = 400;
        const centerY = 250;
        
        const startStateIndex = nfa.states.indexOf(nfa.startState);
        const otherStates = nfa.states.filter((_, idx) => idx !== startStateIndex);
        
        // Position start state
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
                // 2 rows
                const row = index < 2 ? 0 : 1;
                const col = index % 2;
                x = centerX - horizontalSpacing / 2 + col * horizontalSpacing;
                y = centerY - verticalSpacing / 2 + row * verticalSpacing;
            } else if (totalOtherStates === 3) {
                // Single row centered
                x = centerX - horizontalSpacing + index * horizontalSpacing;
                y = centerY;
            } else {
                // Default horizontal
                x = centerX - (totalOtherStates - 1) * horizontalSpacing / 2 + index * horizontalSpacing;
                y = centerY;
            }
            
            nodePositions[state] = { x: x - nodeWidth / 2, y: y - nodeHeight / 2 };
        });

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

        // Group transitions
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

        // Create hidden start arrow logic
        const startStateNodes = [];
        const startStateEdges = [];
        if (nfa.startState && nodePositions[nfa.startState]) {
            const startPos = nodePositions[nfa.startState];
            const startNodeX = startPos.x - 80;
            const startNodeY = startPos.y;
            
            startStateNodes.push({
                id: `start-node-${nfa.startState}`,
                type: 'state',
                position: { x: startNodeX, y: startNodeY },
                data: { label: '', isHidden: true },
                style: { opacity: 0, width: 1, height: 1 },
                draggable: false,
            });
            
            startStateEdges.push({
                id: `start-${nfa.startState}`,
                source: `start-node-${nfa.startState}`,
                target: nfa.startState,
                sourceHandle: 'right',
                targetHandle: 'left',
                type: 'smoothstep',
                style: { stroke: '#000000', strokeWidth: 2 },
                markerEnd: { type: MarkerType.ArrowClosed, color: '#000000', width: 20, height: 20 },
            });
        }

        // Create edges with combined labels and smart routing
        const edges = Object.values(edgeGroups).map((group, index) => {
            const isSelfLoop = group.from === group.to;
            const isEpsilon = group.isEpsilon;
            
            const sortedSymbols = group.symbols.sort((a, b) => {
                if (a === 'ε' || a === 'epsilon') return -1;
                if (b === 'ε' || b === 'epsilon') return 1;
                return a.localeCompare(b);
            });
            
            const label = sortedSymbols.join(', ');
            
            // Check for active path highlighting
            const matchingTransitions = activeTransitions.filter(at => 
                at.from === group.from && 
                at.to === group.to && 
                sortedSymbols.includes(at.symbol)
            );
            
            const isHighlighted = matchingTransitions.length > 0;
            
            let edgeColor = '#8b5cf6';
            let labelColor = '#1f2937';
            let arrowColor = '#8b5cf6';
            
            if (isHighlighted) {
                const pathColor = matchingTransitions[0].color;
                edgeColor = pathColor;
                arrowColor = pathColor;
                labelColor = pathColor;
            } else if (isEpsilon) {
                arrowColor = '#8b5cf6';
            }

            let edgeStyle = {
                stroke: edgeColor,
                strokeWidth: isHighlighted ? 4 : 2,
                opacity: isHighlighted ? 1 : 0.5,
            };

            // --- ROUTING LOGIC (Synced with DFAGraph) ---
            let edgeType = 'smoothstep';
            let sourceHandle = Position.Right;
            let targetHandle = Position.Left;
            let isBottomLane = false; // Flag to move label down via CSS

            const sourcePos = nodePositions[group.from];
            const targetPos = nodePositions[group.to];

            if (isSelfLoop) {
                // Self-Loop: Top -> Right (Standardized)
                edgeType = 'default'; // Bezier curve
                sourceHandle = Position.Top;
                targetHandle = Position.Right;
                edgeStyle.strokeWidth = isHighlighted ? 3 : 2.5;
                edgeStyle.opacity = 1;
            } else if (sourcePos && targetPos) {
                const dx = targetPos.x - sourcePos.x;
                const dy = targetPos.y - sourcePos.y;
                const isHorizontal = Math.abs(dx) > Math.abs(dy);

                if (isHorizontal) {
                     if (dx > 0) {
                        // Forward (Left -> Right): Right -> Left
                        sourceHandle = Position.Right;
                        targetHandle = Position.Left;
                    } else {
                        // Backward (Right -> Left): Bottom -> Bottom (Return Lane)
                        sourceHandle = Position.Bottom;
                        targetHandle = Position.Bottom;
                        isBottomLane = true; // Move label down
                    }
                } else {
                    // Vertical
                    if (dy > 0) {
                        // Down: Bottom -> Top
                        sourceHandle = Position.Bottom;
                        targetHandle = Position.Top;
                    } else {
                        // Up: Right -> Right (Loop around side)
                        sourceHandle = Position.Right;
                        targetHandle = Position.Right;
                    }
                }
            }

            return {
                id: `${group.from}-${group.to}-${label}-${index}`,
                source: group.from,
                target: group.to,
                sourceHandle,
                targetHandle,
                label,
                type: edgeType,
                animated: isHighlighted,
                style: edgeStyle,
                // Use classes to control label position (above/below line)
                className: isBottomLane ? 'edge-bottom' : 'edge-top',
                data: { isSelfLoop },
                labelStyle: {
                    fill: labelColor,
                    fontWeight: isHighlighted ? 700 : (isEpsilon ? 700 : 600),
                    fontSize: isEpsilon ? 18 : 16,
                    fontStyle: isEpsilon ? 'italic' : 'normal',
                },
                labelBgStyle: {
                    fill: 'transparent',
                    fillOpacity: 0,
                },
                labelShowBg: false, // No white background
                markerEnd: {
                    type: MarkerType.ArrowClosed,
                    color: arrowColor,
                    width: isSelfLoop ? 15 : 20,
                    height: isSelfLoop ? 15 : 20,
                },
            };
        });

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
                    type: 'smoothstep', 
                    style: { strokeWidth: 2, stroke: '#8b5cf6' },
                    markerEnd: {
                        type: MarkerType.ArrowClosed,
                        color: '#8b5cf6',
                        width: 20,
                        height: 20,
                    },
                }}
                connectionLineType="smoothstep"
            >
                <Background color="#e5e7eb" gap={16} />
                <Controls />
            </ReactFlow>
        </div>
    );
};

export default NFAGraph;