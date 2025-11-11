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

        // Create edges from transitions
        const edges = nfa.transitions.map((transition, index) => {
            const edgeId = `${transition.from}-${transition.to}-${transition.symbol}-${index}`;
            const isHighlighted = highlightTransition &&
                highlightTransition.from?.includes(transition.from) &&
                highlightTransition.to?.includes(transition.to) &&
                highlightTransition.symbol === transition.symbol;
            
            // Check if this is an epsilon transition
            const isEpsilon = transition.symbol === 'ε' || transition.symbol === 'epsilon';
            
            // Color coding:
            // - Highlighted: Blue (#3b82f6)
            // - Epsilon: Purple (#8b5cf6)
            // - Regular: Gray (#6b7280)
            const edgeColor = isHighlighted ? '#3b82f6' : (isEpsilon ? '#8b5cf6' : '#6b7280');
            const labelColor = isHighlighted ? '#3b82f6' : (isEpsilon ? '#8b5cf6' : '#374151');

            return {
                id: edgeId,
                source: transition.from,
                target: transition.to,
                label: transition.symbol,
                type: transition.from === transition.to ? 'default' : 'smoothstep',
                animated: isHighlighted,
                style: {
                    stroke: edgeColor,
                    strokeWidth: isHighlighted ? 3 : (isEpsilon ? 2.5 : 2),
                    strokeDasharray: isEpsilon ? '5,5' : 'none',
                },
                labelStyle: {
                    fill: labelColor,
                    fontWeight: isHighlighted ? 700 : (isEpsilon ? 700 : 600),
                    fontSize: isEpsilon ? 16 : 14,
                    fontStyle: isEpsilon ? 'italic' : 'normal',
                },
                labelBgStyle: {
                    fill: isEpsilon ? '#f3e8ff' : '#ffffff',
                    fillOpacity: 0.95,
                    rx: 4,
                    ry: 4,
                },
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
