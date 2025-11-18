import React, { useCallback, useEffect } from 'react';
import ReactFlow, {
    Background,
    Controls,
    Handle,
    Position,
    MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
// The local CSS file is loaded globally in this environment
import './stylings/DFAGraph.css';

const StateNode = ({ data, isConnectable }) => {
    const [showDelete, setShowDelete] = React.useState(false);
    const isAcceptState = data.isAcceptState;
    const isStartState = data.isStartState;
    const isCurrentState = data.isCurrentState;

    const handleDelete = (e) => {
        e.stopPropagation();
        // Dispatch a custom event to signal the delete request
        window.dispatchEvent(new CustomEvent('deleteState', { detail: data.label }));
    };

    return (
        <div
            className={`state-node ${isAcceptState ? 'accept-state' : ''} 
                       ${isStartState ? 'start-state' : ''} 
                       ${isCurrentState ? 'current-state' : ''}`}
            onMouseEnter={() => setShowDelete(true)}
            onMouseLeave={() => setShowDelete(false)}
        >
            {/* Handles on all four sides for better edge routing */}
            <Handle type="target" position={Position.Top} id="top" isConnectable={isConnectable} />
            <Handle type="target" position={Position.Right} id="right" isConnectable={isConnectable} />
            <Handle type="target" position={Position.Bottom} id="bottom" isConnectable={isConnectable} />
            <Handle type="target" position={Position.Left} id="left" isConnectable={isConnectable} />
            <Handle type="source" position={Position.Top} id="top" isConnectable={isConnectable} />
            <Handle type="source" position={Position.Right} id="right" isConnectable={isConnectable} />
            <Handle type="source" position={Position.Bottom} id="bottom" isConnectable={isConnectable} />
            <Handle type="source" position={Position.Left} id="left" isConnectable={isConnectable} />
            <div className="state-label">{data.label}</div>
            {isAcceptState && <div className="accept-circle" />}
            {showDelete && !isStartState && ( // Don't allow deleting start state
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

const DFAGraph = ({ states, transitions, startState, acceptStates, currentState, currentTransition }) => {
    const [reactFlowInstance, setReactFlowInstance] = React.useState(null);

    // REVERTED to your original, working layout logic.
    // This creates the clean, centered horizontal layout.
    const getLayoutedElements = useCallback(() => {
        const nodePositions = {};
        const nodeWidth = 70;
        const nodeHeight = 70;
        const horizontalSpacing = 180;
        const verticalSpacing = 150;
        
        const centerX = 400;
        const centerY = 250;
        
        const startStateIndex = states.indexOf(startState);
        const otherStates = states.filter((_, idx) => idx !== startStateIndex);
        
        if (startStateIndex !== -1) {
            nodePositions[startState] = { 
                x: centerX - horizontalSpacing * 1.5 - nodeWidth / 2,
                y: centerY - nodeHeight / 2 
            };
        }
        
        otherStates.forEach((state, index) => {
            let x, y;
            const totalOtherStates = otherStates.length;
            
            if (totalOtherStates === 1) {
                x = centerX;
                y = centerY;
            } else if (totalOtherStates === 2) {
                x = centerX - horizontalSpacing / 2 + index * horizontalSpacing;
                y = centerY;
            } else if (totalOtherStates === 3) {
                // This is the logic that created your "good" layout
                x = centerX - horizontalSpacing + index * horizontalSpacing;
                y = centerY;
            } else if (totalOtherStates === 4) {
                const row = index < 2 ? 0 : 1;
                const col = index % 2;
                x = centerX - horizontalSpacing / 2 + col * horizontalSpacing;
                y = centerY - verticalSpacing / 2 + row * verticalSpacing;
            } else {
                x = centerX - (totalOtherStates - 1) * horizontalSpacing / 2 + index * horizontalSpacing;
                y = centerY;
            }
            
            nodePositions[state] = { x: x - nodeWidth / 2, y: y - nodeHeight / 2 };
        });

        // Create nodes with calculated positions
        const nodes = states.map((state) => {
            const isCurrentNode = state === currentState;
            const pos = nodePositions[state] || { x: centerX, y: centerY };

            return {
                id: state,
                type: 'state',
                position: pos,
                data: {
                    label: state,
                    isStartState: state === startState,
                    isAcceptState: acceptStates.has(state),
                    isCurrentState: isCurrentNode
                },
                draggable: true,
            };
        });

        // Group transitions
        const edgeGroups = {};
        Object.entries(transitions).forEach(([fromState, trans]) => {
            Object.entries(trans).forEach(([symbol, toState]) => {
                const key = `${fromState}-${toState}`;
                if (!edgeGroups[key]) {
                    edgeGroups[key] = { from: fromState, to: toState, symbols: [] };
                }
                edgeGroups[key].symbols.push(symbol);
            });
        });

        // Create edges
        const edges = Object.values(edgeGroups).map((group, index) => {
            const isSelfLoop = group.from === group.to;
            const sortedSymbols = group.symbols.sort();
            const label = sortedSymbols.join(', ');
            
            const isActiveTransition = currentTransition &&
                currentTransition.from === group.from &&
                currentTransition.to === group.to &&
                sortedSymbols.includes(currentTransition.symbol);

            const edgeColor = isActiveTransition ? '#667eea' : '#8b5cf6';
            const labelColor = isActiveTransition ? '#667eea' : '#1f2937';

            let edgeType = 'smoothstep'; // Use smoothstep for nice curves
            let edgeStyle = {
                stroke: edgeColor,
                strokeWidth: isActiveTransition ? 4 : 2,
                opacity: isActiveTransition ? 1 : 0.7,
            };

            const sourcePos = nodePositions[group.from];
            const targetPos = nodePositions[group.to];
            let sourceHandle = Position.Right;
            let targetHandle = Position.Left;

            if (isSelfLoop) {
                // FIX: Use Top and Left handles. This creates the nice high arc.
                sourceHandle = Position.Top;
                targetHandle = Position.Left; 
                edgeStyle = {
                    ...edgeStyle,
                    strokeWidth: isActiveTransition ? 3 : 2.5,
                };
            } else if (sourcePos && targetPos) {
                // Regular transitions: determine best handles
                const dx = targetPos.x - sourcePos.x;
                const dy = targetPos.y - sourcePos.y;
                
                if (Math.abs(dx) > Math.abs(dy)) {
                    sourceHandle = dx > 0 ? Position.Right : Position.Left;
                    targetHandle = dx > 0 ? Position.Left : Position.Right;
                } else {
                    sourceHandle = dy > 0 ? Position.Bottom : Position.Top;
                    targetHandle = dy > 0 ? Position.Top : Position.Bottom;
                }
            }

            return {
                id: `${group.from}-${group.to}-${index}`,
                source: group.from,
                target: group.to,
                sourceHandle: sourceHandle,
                targetHandle: targetHandle,
                label: label,
                type: edgeType,
                animated: isActiveTransition,
                style: edgeStyle,
                data: { isSelfLoop: isSelfLoop },
                labelStyle: {
                    fill: labelColor,
                    fontWeight: 'bold',
                    fontSize: 16,
                },
                // FIX: Make label background opaque and add more padding
                labelBgStyle: {
                    fill: '#f8f9fa',
                    fillOpacity: 1.0, // Fully opaque
                    rx: 6,
                    ry: 6,
                },
                labelBgPadding: [8, 6], // More padding
                labelShowBg: true,
                markerEnd: {
                    type: MarkerType.ArrowClosed,
                    color: edgeColor,
                    width: 20,
                    height: 20,
                },
            };
        });

        return { nodes, edges };
    }, [states, transitions, startState, acceptStates, currentState, currentTransition]);

    const { nodes, edges } = getLayoutedElements();

    // Auto zoom to fit when graph changes
    useEffect(() => {
        if (reactFlowInstance) {
            setTimeout(() => {
                reactFlowInstance.fitView({ padding: 0.2, duration: 300 });
            }, 100);
        }
    }, [nodes, edges, reactFlowInstance]);

    const onInit = (instance) => {
        setReactFlowInstance(instance);
        setTimeout(() => {
            instance.fitView({ padding: 0.2, duration: 300 });
        }, 100);
    };

    return (
        <div style={{ height: '500px', width: '100%' }} className="dfa-graph-container">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                onInit={onInit}
                fitView
                attributionPosition="bottom-left"
                minZoom={0.3}
                maxZoom={2}
                fitViewOptions={{ padding: 0.3 }}
                snapToGrid={false}
                nodesDraggable={true}
                nodesConnectable={false}
                elementsSelectable={false}
                defaultEdgeOptions={{
                    type: 'smoothstep', // Default to smoothstep
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

export default DFAGraph;