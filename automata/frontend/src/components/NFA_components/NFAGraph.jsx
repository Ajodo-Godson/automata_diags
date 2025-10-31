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
    const isAcceptState = data.isAcceptState;
    const isStartState = data.isStartState;
    const isCurrentState = data.isCurrentState;

    return (
        <div
            className={`nfa-state-node ${isAcceptState ? 'nfa-accept-state' : ''} 
                       ${isStartState ? 'nfa-start-state' : ''} 
                       ${isCurrentState ? 'nfa-current-state' : ''}`}
        >
            <Handle type="target" position={Position.Left} isConnectable={isConnectable} />
            <div className="nfa-state-label">{data.label}</div>
            {isAcceptState && <div className="nfa-accept-circle" />}
            <Handle type="source" position={Position.Right} isConnectable={isConnectable} />
        </div>
    );
};

const nodeTypes = {
    state: StateNode,
};

const NFAGraph = ({ nfa, currentStates = [], highlightTransition = null }) => {
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

            return {
                id: edgeId,
                source: transition.from,
                target: transition.to,
                label: transition.symbol,
                type: transition.from === transition.to ? 'default' : 'smoothstep',
                animated: isHighlighted,
                style: {
                    stroke: isHighlighted ? '#3b82f6' : '#6b7280',
                    strokeWidth: isHighlighted ? 3 : 2,
                },
                labelStyle: {
                    fill: isHighlighted ? '#3b82f6' : '#374151',
                    fontWeight: isHighlighted ? 700 : 600,
                    fontSize: 14,
                },
                labelBgStyle: {
                    fill: '#ffffff',
                    fillOpacity: 0.9,
                },
                markerEnd: {
                    type: MarkerType.ArrowClosed,
                    color: isHighlighted ? '#3b82f6' : '#6b7280',
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
                fitView
                attributionPosition="bottom-left"
                minZoom={0.5}
                maxZoom={2}
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
