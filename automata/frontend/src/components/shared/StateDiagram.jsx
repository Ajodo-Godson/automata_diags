import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactFlow, {
    Background,
    BaseEdge,
    Controls,
    EdgeLabelRenderer,
    Handle,
    MarkerType,
    Position,
    getSmoothStepPath,
    useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
    edgeLabelLines,
    groupTransitions,
    labelLineCount,
    layoutStates,
    loopHeadroom,
    NODE_SIZE,
    pickHandles,
    SELF_LOOP_RISE,
} from '../../lib/automatonLayout';
import './StateDiagram.css';

/**
 * The state diagram shared by the DFA, NFA and PDA simulators.
 *
 * Callers pass a normalised `transitions` list of {from, to, label} and this
 * handles layout, edge grouping, self-loops, labels and the active highlight.
 */

/** How far a transition label sits clear of its edge. */
const LABEL_OFFSET = 13;

/*
 * Return lanes (backward edges) dip below the last rank and carry a label
 * there. Like the self-loop headroom, that space is outside the node boxes
 * fitView measures, so each node reserves it beneath the circle.
 */
const LANE_CLEARANCE = 30;

const HANDLE_IDS = ['top', 'right', 'bottom', 'left'];
const HANDLE_POSITIONS = {
    top: Position.Top,
    right: Position.Right,
    bottom: Position.Bottom,
    left: Position.Left,
};

function StateNode({ data }) {
    const { label, isStart, isAccept, isCurrent, headroom, onDelete } = data;

    return (
        /*
         * The shell reserves the space a self-loop arc occupies above the
         * circle. ReactFlow derives its fitView bounds from node boxes, so
         * without it the arcs were clipped against the top of the canvas.
         */
        <div className="sd-node-shell" style={{ paddingTop: headroom }}>
        <div
            className={[
                'sd-node',
                isAccept ? 'is-accept' : '',
                isStart ? 'is-start' : '',
                isCurrent ? 'is-current' : '',
            ]
                .filter(Boolean)
                .join(' ')}
        >
            {/*
              * Handles are anchor points for edge routing, not UI. They used to
              * render as visible dots all over the diagram; `sd-handle` makes
              * them invisible without removing them from layout.
              */}
            {HANDLE_IDS.map((id) => (
                <React.Fragment key={id}>
                    <Handle
                        type="target"
                        id={id}
                        position={HANDLE_POSITIONS[id]}
                        className="sd-handle"
                        isConnectable={false}
                    />
                    <Handle
                        type="source"
                        id={id}
                        position={HANDLE_POSITIONS[id]}
                        className="sd-handle"
                        isConnectable={false}
                    />
                </React.Fragment>
            ))}

            {/* The conventional "start" arrow entering the initial state. */}
            {isStart && (
                <svg className="sd-start-arrow" viewBox="0 0 28 12" aria-hidden="true">
                    <path d="M0 6 H20" />
                    <path d="M18 2 L24 6 L18 10 Z" className="sd-start-arrow-head" />
                </svg>
            )}

            <span className="sd-node-label">{label}</span>

            {onDelete && !isStart && (
                <button
                    type="button"
                    className="sd-node-delete"
                    title={`Delete state ${label}`}
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(label);
                    }}
                >
                    ×
                </button>
            )}
        </div>
        </div>
    );
}

/** Edge label text. See edgeLabelLines for how the lines are chosen. */
function EdgeLabelText({ labels = [] }) {
    const lines = edgeLabelLines(labels);
    if (lines.length === 1) return lines[0];
    return lines.map((line, i) => (
        <span
            className={`sd-edge-label-line ${
                i === lines.length - 1 && /^\+\d+ more$/.test(line) ? 'is-overflow' : ''
            }`}
            key={`${line}-${i}`}
        >
            {line}
        </span>
    ));
}

/**
 * Self-loops. ReactFlow's built-in edges collapse to a stub when source and
 * target are the same node, so this draws an explicit arc above the node.
 */
function SelfLoopEdge({ id, sourceX, sourceY, data, markerEnd, style }) {
    // Both handles sit at the top centre of the node, so the loop is drawn as
    // a symmetric arc rising from it. The ends are offset sideways so the
    // arrowhead meets the circle at an angle rather than head-on.
    const spread = 16;
    const rise = SELF_LOOP_RISE;
    const cx = sourceX;
    const cy = sourceY;
    // Seat the label above the arc, allowing for however many lines it takes:
    // a PDA's three stacked rules used to land on top of the arc itself.
    const labelHeight = labelLineCount(data?.labels) * 19;
    const path = [
        `M ${cx - spread} ${cy - 2}`,
        `C ${cx - spread - 26} ${cy - rise}`,
        `${cx + spread + 26} ${cy - rise}`,
        `${cx + spread} ${cy - 2}`,
    ].join(' ');

    return (
        <>
            <BaseEdge id={id} path={path} markerEnd={markerEnd} style={style} />
            <EdgeLabelRenderer>
                <div
                    className={`sd-edge-label ${data?.isActive ? 'is-active' : ''}`}
                    style={{
                        transform: `translate(-50%, -50%) translate(${cx}px, ${
                            cy - rise - labelHeight / 2 - 6
                        }px)`,
                    }}
                >
                    <EdgeLabelText labels={data?.labels} />
                </div>
            </EdgeLabelRenderer>
        </>
    );
}

/**
 * Standard edge. Identical routing to ReactFlow's smoothstep, but the label is
 * rendered through EdgeLabelRenderer so it gets a readable plate instead of
 * sitting bare on top of whatever it crosses.
 */
function LabelledEdge({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    data,
    markerEnd,
    style,
}) {
    const [path, labelX, labelY] = getSmoothStepPath({
        sourceX,
        sourceY,
        targetX,
        targetY,
        sourcePosition,
        targetPosition,
        borderRadius: 12,
    });

    /*
     * Sit the label beside the edge rather than on top of it. Centred on the
     * path, the line runs straight through the text — the convention is to
     * write the symbol alongside the arrow, clear of it.
     */
    const isReturnLane =
        sourcePosition === Position.Bottom && targetPosition === Position.Bottom;
    const isHorizontal = Math.abs(targetX - sourceX) >= Math.abs(targetY - sourceY);

    // Above the line for anything running horizontally, including the return
    // lanes: below them the label falls outside the fitted bounds and clips.
    // Vertical edges take the label to one side instead.
    const offsetX = isHorizontal || isReturnLane ? 0 : LABEL_OFFSET + 4;
    const offsetY = isHorizontal || isReturnLane ? -LABEL_OFFSET : 0;

    return (
        <>
            <BaseEdge id={id} path={path} markerEnd={markerEnd} style={style} />
            <EdgeLabelRenderer>
                <div
                    className={`sd-edge-label ${data?.isActive ? 'is-active' : ''}`}
                    style={{
                        transform: `translate(-50%, -50%) translate(${labelX + offsetX}px, ${
                            labelY + offsetY
                        }px)`,
                    }}
                >
                    <EdgeLabelText labels={data?.labels} />
                </div>
            </EdgeLabelRenderer>
        </>
    );
}

const nodeTypes = { state: StateNode };
const edgeTypes = { labelled: LabelledEdge, selfLoop: SelfLoopEdge };

/*
 * Backward edges route beneath the last rank and self-loops rise above the
 * first, and neither is part of the node bounds fitView measures — so the
 * padding has to cover both.
 */
const FIT_OPTIONS = { padding: 0.2, duration: 200 };

/**
 * Refits the view when the graph's shape changes or the container is resized —
 * but not on every render, which is what made the old diagram re-animate
 * continuously and fight the user for control of the viewport.
 */
function FitView({ shapeKey, containerRef }) {
    const { fitView } = useReactFlow();
    const previous = useRef(null);

    useEffect(() => {
        if (previous.current === shapeKey) return undefined;
        previous.current = shapeKey;
        const t = setTimeout(() => fitView(FIT_OPTIONS), 30);
        return () => clearTimeout(t);
    }, [shapeKey, fitView]);

    useEffect(() => {
        const el = containerRef.current;
        if (!el || typeof ResizeObserver === 'undefined') return undefined;

        let frame = 0;
        const observer = new ResizeObserver(() => {
            cancelAnimationFrame(frame);
            frame = requestAnimationFrame(() => fitView({ ...FIT_OPTIONS, duration: 0 }));
        });
        observer.observe(el);
        return () => {
            cancelAnimationFrame(frame);
            observer.disconnect();
        };
    }, [containerRef, fitView]);

    return null;
}

export default function StateDiagram({
    states = [],
    transitions = [],
    startState,
    acceptStates,
    currentState,
    currentStates,
    activeTransition,
    onDeleteState,
    height = '100%',
    emptyMessage = 'Add a state to see the diagram.',
}) {
    // Accept either a Set, an array, or nothing.
    const acceptSet = useMemo(() => {
        if (!acceptStates) return new Set();
        return acceptStates instanceof Set ? acceptStates : new Set(acceptStates);
    }, [acceptStates]);

    // NFAs highlight a set of states; DFA/PDA highlight one.
    const activeSet = useMemo(() => {
        if (currentStates) {
            return currentStates instanceof Set ? currentStates : new Set(currentStates);
        }
        return new Set(currentState ? [currentState] : []);
    }, [currentState, currentStates]);

    const groups = useMemo(() => groupTransitions(transitions), [transitions]);

    /* Headroom each looping state needs for its arc and label, keyed by state. */
    const headrooms = useMemo(() => {
        const map = {};
        groups.forEach((g) => {
            if (g.from === g.to) map[g.from] = loopHeadroom(g.labels);
        });
        return map;
    }, [groups]);

    /*
     * Layout depends only on the graph's shape, so it is keyed on that. It used
     * to be recomputed on every render, which meant dragging a node snapped
     * back the moment anything else changed.
     */
    const shapeKey = useMemo(
        () =>
            JSON.stringify([
                states,
                groups.map((g) => [g.from, g.to, g.labels.join('|')]),
                startState,
            ]),
        [states, groups, startState]
    );

    const positions = useMemo(
        () => layoutStates(states, groups, startState, headrooms),
        // eslint-disable-next-line react-hooks/exhaustive-deps -- keyed on shape
        [shapeKey]
    );

    // User-dragged positions win over the computed layout until the shape changes.
    const [dragged, setDragged] = useState({});
    useEffect(() => {
        setDragged({});
    }, [shapeKey]);

    const nodes = useMemo(
        () =>
            states.map((state) => {
                const headroom = headrooms[state] || 0;
                const hasSelfLoop = headroom > 0;
                const base = dragged[state] || positions[state] || { x: 0, y: 0 };

                return {
                    id: state,
                    type: 'state',
                    // Shift up by the headroom the shell adds, so the circle
                    // lands exactly where the layout put it.
                    position: { x: base.x, y: base.y - headroom },
                    width: NODE_SIZE,
                    height: NODE_SIZE + headroom + LANE_CLEARANCE,
                    data: {
                        label: state,
                        isStart: state === startState,
                        isAccept: acceptSet.has(state),
                        isCurrent: activeSet.has(state),
                        headroom,
                        onDelete: onDeleteState,
                    },
                };
            }),
        [states, dragged, positions, startState, acceptSet, activeSet, headrooms, onDeleteState]
    );

    const edges = useMemo(
        () =>
            groups.map((group) => {
                const isSelfLoop = group.from === group.to;
                const label = group.labels.join(', ');
                const isActive =
                    !!activeTransition &&
                    activeTransition.from === group.from &&
                    activeTransition.to === group.to &&
                    (activeTransition.label == null ||
                        group.labels.includes(activeTransition.label));

                const color = isActive ? 'var(--edge-active)' : 'var(--edge)';
                const { sourceHandle, targetHandle } = pickHandles(
                    group.from,
                    group.to,
                    positions
                );

                return {
                    id: `${group.from}->${group.to}`,
                    source: group.from,
                    target: group.to,
                    sourceHandle,
                    targetHandle,
                    type: isSelfLoop ? 'selfLoop' : 'labelled',
                    animated: isActive,
                    zIndex: isActive ? 2 : 1,
                    data: { label, labels: group.labels, isActive },
                    style: {
                        stroke: color,
                        strokeWidth: isActive ? 2.5 : 1.5,
                    },
                    markerEnd: {
                        type: MarkerType.ArrowClosed,
                        color: isActive ? 'var(--edge-active)' : 'var(--edge)',
                        width: 18,
                        height: 18,
                    },
                };
            }),
        [groups, activeTransition, positions]
    );

    const containerRef = useRef(null);

    const onNodeDragStop = useCallback(
        (_event, node) => {
            const headroom = headrooms[node.id] || 0;
            setDragged((prev) => ({
                ...prev,
                [node.id]: { x: node.position.x, y: node.position.y + headroom },
            }));
        },
        [headrooms]
    );

    if (!states.length) {
        return (
            <div className="sd-wrap" style={{ height }}>
                <p className="empty">{emptyMessage}</p>
            </div>
        );
    }

    return (
        <div className="sd-wrap" style={{ height }}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                onNodeDragStop={onNodeDragStop}
                fitView
                fitViewOptions={FIT_OPTIONS}
                minZoom={0.2}
                maxZoom={1.8}
                nodesConnectable={false}
                elementsSelectable={false}
                /*
                 * Let a wheel or trackpad scroll over the canvas move the page
                 * instead of zooming the diagram; zooming stays on pinch and
                 * the controls. Dragging to pan is unchanged.
                 */
                preventScrolling={false}
                zoomOnPinch
                proOptions={{ hideAttribution: true }}
            >
                <FitView shapeKey={shapeKey} containerRef={containerRef} />
                <Background color="var(--diagram-grid)" gap={18} size={1} />
                <Controls showInteractive={false} />
            </ReactFlow>
        </div>
    );
}
