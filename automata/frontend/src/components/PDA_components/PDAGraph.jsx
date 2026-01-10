import React, { useCallback, useEffect, useMemo } from 'react';
import ReactFlow, {
    Background,
    Controls,
    Handle,
    Position,
    MarkerType,
    useNodesState,
    useEdgesState,
} from 'reactflow';
import dagre from 'dagre';
import 'reactflow/dist/style.css';
import './stylings/PDAGraph.css';
import PDAEdge from './PDAEdge';

// --- CUSTOM NODE ---
const StateNode = ({ data }) => {
    const { label, isAcceptState, isStartState, isCurrentState } = data;
    return (
        <div className={`pda-node ${isCurrentState ? 'active' : ''} ${isAcceptState ? 'accept' : ''}`}>
            {/* Handles for all directions */}
            <Handle type="source" position={Position.Top} id="top" className="pda-handle" />
            <Handle type="source" position={Position.Right} id="right" className="pda-handle" />
            <Handle type="source" position={Position.Bottom} id="bottom" className="pda-handle" />
            <Handle type="source" position={Position.Left} id="left" className="pda-handle" />
            
            <Handle type="target" position={Position.Top} id="top" className="pda-handle" />
            <Handle type="target" position={Position.Right} id="right" className="pda-handle" />
            <Handle type="target" position={Position.Bottom} id="bottom" className="pda-handle" />
            <Handle type="target" position={Position.Left} id="left" className="pda-handle" />

            <div className="pda-node-content">
                {isStartState && <div className="pda-start-arrow"></div>}
                <span className="pda-label">{label}</span>
                {isAcceptState && <div className="pda-double-ring"></div>}
            </div>
        </div>
    );
};

const nodeTypes = { state: StateNode };
const edgeTypes = { pdaEdge: PDAEdge };

// --- DAGRE LAYOUT ENGINE ---
const getLayoutedElements = (nodes, edges, states, startState) => {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));

    // LR = Left to Right layout, wide spacing for label cards
    dagreGraph.setGraph({ 
        rankdir: 'LR', 
        ranksep: 200,  // Horizontal separation between ranks
        nodesep: 100,  // Vertical separation between nodes
        marginx: 50,
        marginy: 50,
    });

    // Tell dagre the size of our nodes
    nodes.forEach((node) => {
        dagreGraph.setNode(node.id, { width: 70, height: 70 });
    });

    // Add edges to dagre (it uses these to determine layout)
    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    // Run the layout algorithm
    dagre.layout(dagreGraph);

    // Apply calculated positions to nodes
    const layoutedNodes = nodes.map((node) => {
        const nodeWithPosition = dagreGraph.node(node.id);
        return {
            ...node,
            targetPosition: Position.Left,
            sourcePosition: Position.Right,
            position: {
                x: nodeWithPosition.x - 35, // Center offset (half of node width)
                y: nodeWithPosition.y - 35, // Center offset (half of node height)
            },
        };
    });

    return { nodes: layoutedNodes, edges };
};

const PDAGraph = ({ states, transitions, startState, acceptStates, currentState }) => {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    // Memoize acceptStates Set for stable comparison
    const acceptStatesSet = useMemo(() => {
        if (acceptStates instanceof Set) return acceptStates;
        return new Set(acceptStates || []);
    }, [acceptStates]);

    // --- BUILD GRAPH ---
    const calculateLayout = useCallback(() => {
        if (!states || states.length === 0) return;

        // 1. Create initial nodes (positions will be set by dagre)
        const newNodes = states.map((state) => ({
            id: state,
            type: 'state',
            position: { x: 0, y: 0 }, // Placeholder, dagre will set real position
            data: {
                label: state,
                isStartState: state === startState,
                isAcceptState: acceptStatesSet.has(state),
                isCurrentState: state === currentState,
            },
            draggable: true,
        }));

        // 2. Group transitions by source->target pair
        const groupedEdges = {};
        transitions.forEach((t) => {
            const key = `${t.from}|${t.to}`;
            if (!groupedEdges[key]) {
                groupedEdges[key] = [];
            }
            // Store the WHOLE transition object for the custom edge
            groupedEdges[key].push({
                input: t.input || 'ε',
                pop: t.pop || 'ε',
                push: t.push || 'ε',
            });
        });

        // 3. Create edges with custom type
        const newEdges = Object.keys(groupedEdges).map((key) => {
            const [from, to] = key.split('|');
            const transList = groupedEdges[key];
            const isSelfLoop = from === to;

            return {
                id: `e-${key}`,
                source: from,
                target: to,
                type: 'pdaEdge', // Use the custom edge component
                sourceHandle: isSelfLoop ? 'top' : 'right',
                targetHandle: isSelfLoop ? 'right' : 'left',
                data: {
                    transitions: transList,
                    isSelfLoop: isSelfLoop,
                },
                style: {
                    stroke: '#64748b',
                    strokeWidth: 2,
                },
                markerEnd: {
                    type: MarkerType.ArrowClosed,
                    width: 15,
                    height: 15,
                    color: '#64748b',
                },
            };
        });

        // 4. Apply dagre layout
        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
            newNodes,
            newEdges,
            states,
            startState
        );

        setNodes(layoutedNodes);
        setEdges(layoutedEdges);
    }, [states, transitions, startState, acceptStatesSet, currentState, setNodes, setEdges]);

    useEffect(() => {
        calculateLayout();
    }, [calculateLayout]);

    // Update active state highlight without full re-layout
    useEffect(() => {
        setNodes((nds) =>
            nds.map((node) => ({
                ...node,
                data: { ...node.data, isCurrentState: node.id === currentState },
            }))
        );
    }, [currentState, setNodes]);

    return (
        <div className="pda-graph-wrapper">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                fitView
                fitViewOptions={{ padding: 0.4, minZoom: 0.5, maxZoom: 1.5 }}
                minZoom={0.2}
                maxZoom={4}
                attributionPosition="bottom-right"
            >
                <Background color="#f1f5f9" gap={20} size={1} variant="dots" />
                <Controls showInteractive={false} />
            </ReactFlow>
        </div>
    );
};

export default PDAGraph;
