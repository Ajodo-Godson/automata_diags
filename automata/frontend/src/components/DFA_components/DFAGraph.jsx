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
            {showDelete && !isStartState && (
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

    const getLayoutedElements = useCallback(() => {
        const nodePositions = {};
        const nodeWidth = 70;
        const nodeHeight = 70;
        const horizontalSpacing = 200;
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

            let edgeStyle = {
                stroke: edgeColor,
                strokeWidth: isActiveTransition ? 4 : 2,
                opacity: isActiveTransition ? 1 : 0.7,
            };

            let edgeType = 'smoothstep';
            let sourceHandle = Position.Right;
            let targetHandle = Position.Left;

            const sourcePos = nodePositions[group.from];
            const targetPos = nodePositions[group.to];
            
            // Determines if the label should be shifted up (top/standard) or down (bottom lanes)
            let isBottomLane = false;

            if (isSelfLoop) {
                edgeType = 'default'; 
                sourceHandle = Position.Top;
                targetHandle = Position.Right;
                edgeStyle.strokeWidth = isActiveTransition ? 3 : 2.5;
            } else if (sourcePos && targetPos) {
                const dx = targetPos.x - sourcePos.x;
                const dy = targetPos.y - sourcePos.y;
                const isHorizontal = Math.abs(dx) > Math.abs(dy);

                if (isHorizontal) {
                     if (dx > 0) {
                        // Forward
                        sourceHandle = Position.Right;
                        targetHandle = Position.Left;
                    } else {
                        // Backward (Return lane)
                        sourceHandle = Position.Bottom;
                        targetHandle = Position.Bottom;
                        isBottomLane = true; // Mark this as a bottom lane
                    }
                } else {
                    if (dy > 0) {
                        sourceHandle = Position.Bottom;
                        targetHandle = Position.Top;
                    } else {
                        sourceHandle = Position.Right;
                        targetHandle = Position.Right;
                    }
                }
            }

            return {
                id: `${group.from}-${group.to}-${index}`,
                source: group.from,
                target: group.to,
                sourceHandle,
                targetHandle,
                label,
                type: edgeType,
                animated: isActiveTransition,
                style: edgeStyle,
                // Apply CSS class to shift label position based on lane
                className: isBottomLane ? 'edge-bottom' : 'edge-top',
                data: { isSelfLoop },
                labelStyle: {
                    fill: labelColor,
                    fontWeight: '800', // Extra bold since we lost the bg
                    fontSize: 18,      // Slightly larger
                },
                // REMOVED: labelShowBg and labelBgStyle to remove the white box
                labelShowBg: false,
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

export default DFAGraph;