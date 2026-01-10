import React, { useCallback, useEffect } from 'react';
import ReactFlow, {
    Background,
    Controls,
    Handle,
    Position,
    MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import './stylings/PDAGraph.css';

const StateNode = ({ data, isConnectable }) => {
    const isAcceptState = data.isAcceptState;
    const isStartState = data.isStartState;
    const isCurrentState = data.isCurrentState;

    return (
        <div
            className={`pda-state-node ${isAcceptState ? 'accept-state' : ''} 
                       ${isStartState ? 'start-state' : ''} 
                       ${isCurrentState ? 'current-state' : ''}`}
        >
            <Handle type="target" position={Position.Top} id="top" isConnectable={isConnectable} />
            <Handle type="target" position={Position.Right} id="right" isConnectable={isConnectable} />
            <Handle type="target" position={Position.Bottom} id="bottom" isConnectable={isConnectable} />
            <Handle type="target" position={Position.Left} id="left" isConnectable={isConnectable} />
            <Handle type="source" position={Position.Top} id="top" isConnectable={isConnectable} />
            <Handle type="source" position={Position.Right} id="right" isConnectable={isConnectable} />
            <Handle type="source" position={Position.Bottom} id="bottom" isConnectable={isConnectable} />
            <Handle type="source" position={Position.Left} id="left" isConnectable={isConnectable} />
            <div className="pda-state-label">{data.label}</div>
            {isAcceptState && <div className="pda-accept-ring" />}
        </div>
    );
};

const nodeTypes = {
    state: StateNode,
};

const PDAGraph = ({ states, transitions, startState, acceptStates, currentState }) => {
    const [reactFlowInstance, setReactFlowInstance] = React.useState(null);

    const getLayoutedElements = useCallback(() => {
        const nodePositions = {};
        const nodeWidth = 50;
        const horizontalSpacing = 180;
        
        const startX = 120;
        const centerY = 180;
        
        // Sort states: start state first, then others
        const sortedStates = [...states].sort((a, b) => {
            if (a === startState) return -1;
            if (b === startState) return 1;
            if (acceptStates.has(a) && !acceptStates.has(b)) return 1;
            if (!acceptStates.has(a) && acceptStates.has(b)) return -1;
            return 0;
        });
        
        // Arrange states horizontally
        sortedStates.forEach((state, index) => {
            nodePositions[state] = { 
                x: startX + index * horizontalSpacing,
                y: centerY 
            };
        });

        // Generate Nodes
        const nodes = states.map((state) => {
            const isCurrentNode = state === currentState;
            const pos = nodePositions[state] || { x: startX, y: centerY };

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

        // Generate Edges - each transition is its own edge
        const edges = [];
        const edgeCounts = {}; // Track how many edges between same pair
        
        transitions.forEach((t, idx) => {
            const key = `${t.from}-${t.to}`;
            edgeCounts[key] = (edgeCounts[key] || 0) + 1;
            const edgeIndex = edgeCounts[key];
            
            const inputLabel = (t.input === '' || t.input === 'epsilon' || t.input === 'ε') ? 'ε' : t.input;
            const popLabel = (t.pop === '' || t.pop === 'epsilon' || t.pop === 'ε') ? 'ε' : t.pop;
            const pushLabel = (t.push === '' || t.push === 'epsilon' || t.push === 'ε') ? 'ε' : t.push;
            
            const label = `${inputLabel}, ${popLabel}→${pushLabel}`;
            const isSelfLoop = t.from === t.to;
            
            const edgeColor = '#333333';
            let edgeType = 'smoothstep';
            let sourceHandle = 'right';
            let targetHandle = 'left';

            const sourcePos = nodePositions[t.from];
            const targetPos = nodePositions[t.to];

            // Calculate label offset for multiple edges
            let labelBgPadding = [4, 6];
            
            if (isSelfLoop) {
                edgeType = 'default'; 
                // Self-loop from top to top, label will be positioned above via CSS
                sourceHandle = 'top';
                targetHandle = 'top';
            } else if (sourcePos && targetPos) {
                const dx = targetPos.x - sourcePos.x;
                
                if (dx > 0) {
                    sourceHandle = 'right';
                    targetHandle = 'left';
                } else {
                    sourceHandle = 'bottom';
                    targetHandle = 'bottom';
                }
            }

            edges.push({
                id: `edge-${t.from}-${t.to}-${idx}`,
                source: t.from,
                target: t.to,
                sourceHandle,
                targetHandle,
                label,
                type: edgeType,
                style: {
                    stroke: edgeColor,
                    strokeWidth: 1.5,
                },
                labelStyle: {
                    fill: '#000000',
                    fontWeight: '500',
                    fontSize: 11,
                    fontFamily: 'Arial, sans-serif',
                },
                labelShowBg: true,
                labelBgStyle: {
                    fill: '#ffffff',
                    stroke: '#dddddd',
                    strokeWidth: 1,
                },
                labelBgPadding,
                labelBgBorderRadius: 2,
                markerEnd: {
                    type: MarkerType.ArrowClosed,
                    color: edgeColor,
                    width: 12,
                    height: 12,
                },
            });
        });

        return { nodes, edges };
    }, [states, transitions, startState, acceptStates, currentState]);

    const { nodes, edges } = getLayoutedElements();

    useEffect(() => {
        if (reactFlowInstance) {
            setTimeout(() => {
                reactFlowInstance.fitView({ padding: 0.4, duration: 300 });
            }, 100);
        }
    }, [nodes, edges, reactFlowInstance]);

    const onInit = (instance) => {
        setReactFlowInstance(instance);
        setTimeout(() => {
            instance.fitView({ padding: 0.4, duration: 300 });
        }, 100);
    };

    return (
        <div className="pda-graph-container">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                onInit={onInit}
                fitView
                attributionPosition="bottom-left"
                minZoom={0.3}
                maxZoom={2}
                fitViewOptions={{ padding: 0.4 }}
                snapToGrid={false}
                nodesDraggable={true}
                nodesConnectable={false}
                elementsSelectable={false}
                defaultEdgeOptions={{
                    type: 'smoothstep',
                    style: { strokeWidth: 1.5, stroke: '#333333' },
                    markerEnd: {
                        type: MarkerType.ArrowClosed,
                        color: '#333333',
                        width: 12,
                        height: 12,
                    },
                }}
                connectionLineType="smoothstep"
            >
                <Background color="#f0f0f0" gap={20} variant="dots" />
                <Controls />
            </ReactFlow>
        </div>
    );
};

export default PDAGraph;
