import React, { useCallback, useEffect } from 'react';
import ReactFlow, {
    Background,
    Controls,
    Handle,
    Position,
    MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import './stylings/DFAGraph.css';

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
            className={`state-node ${isAcceptState ? 'accept-state' : ''} 
                       ${isStartState ? 'start-state' : ''} 
                       ${isCurrentState ? 'current-state' : ''}`}
            onMouseEnter={() => setShowDelete(true)}
            onMouseLeave={() => setShowDelete(false)}
        >
            <Handle type="target" position={Position.Left} isConnectable={isConnectable} />
            <div className="state-label">{data.label}</div>
            {isAcceptState && <div className="accept-circle" />}
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

const DFAGraph = ({ states, transitions, startState, acceptStates, currentState, currentTransition, isPlaying }) => {
    const [reactFlowInstance, setReactFlowInstance] = React.useState(null);

    // Auto zoom out to fit all nodes when DFA changes
    React.useEffect(() => {
        if (reactFlowInstance) {
            setTimeout(() => {
                reactFlowInstance.fitView({ padding: 0.2, duration: 300 });
            }, 100);
        }
    }, [states, transitions, reactFlowInstance]);

    const getLayoutedElements = useCallback(() => {
        // Calculate radius and center
        const radius = Math.min(150, 600 / states.length);
        const centerX = 300;
        const centerY = 200;

        // Create nodes in a circular layout
        const nodes = states.map((state, index) => {
            const angle = (index / states.length) * 2 * Math.PI;
            const isCurrentNode = state === currentState;

            return {
                id: state,
                type: 'state',
                position: {
                    x: centerX + radius * Math.cos(angle),
                    y: centerY + radius * Math.sin(angle)
                },
                data: {
                    label: state,
                    isStartState: state === startState,
                    isAcceptState: acceptStates.has(state),
                    isCurrentState: isCurrentNode
                }
            };
        });

        // Create edges with better styling
        const edges = [];
        Object.entries(transitions).forEach(([fromState, trans]) => {
            Object.entries(trans).forEach(([symbol, toState]) => {
                const existingEdge = edges.find(
                    (e) => e.source === fromState && e.target === toState
                );

                const isActiveTransition = currentTransition &&
                    currentTransition.from === fromState &&
                    currentTransition.to === toState &&
                    currentTransition.symbol === symbol;

                if (existingEdge) {
                    existingEdge.label = `${existingEdge.label},${symbol}`;
                } else {
                    const isSelfLoop = fromState === toState;

                    edges.push({
                        id: `${fromState}-${symbol}-${toState}`,
                        source: fromState,
                        target: toState,
                        label: symbol,
                        type: isSelfLoop ? 'default' : 'smoothstep',
                        animated: isActiveTransition,
                        style: {
                            stroke: isActiveTransition ? '#2196F3' : '#555',
                            strokeWidth: isActiveTransition ? 3 : 1,
                            opacity: isActiveTransition ? 1 : 0.75,
                        },
                        labelStyle: {
                            fill: isActiveTransition ? '#2196F3' : '#555',
                            fontSize: '14px',
                            fontWeight: isActiveTransition ? 'bold' : 'normal',
                            background: isActiveTransition ? '#e3f2fd' : 'transparent',
                            padding: isActiveTransition ? '2px 4px' : '0',
                            borderRadius: '4px',
                        },
                        markerEnd: {
                            type: MarkerType.ArrowClosed,
                            width: 20,
                            height: 20,
                            color: isActiveTransition ? '#2196F3' : '#555',
                        },
                    });
                }
            });
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

    return (
        <div style={{ height: '400px' }} className="dfa-graph-container">
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
            >
                <Background color="#e5e7eb" gap={16} />
                <Controls />
            </ReactFlow>
        </div>
    );
};

export default DFAGraph; 