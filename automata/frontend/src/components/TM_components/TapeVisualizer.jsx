import React, { useEffect, useRef } from 'react';
import './stylings/TapeVisualizer.css';

const CELL_WIDTH = 56;

/**
 * The tape.
 *
 * This used to also own the "Initial Tape Input" field, its own card header
 * and a halt summary — all of which now live in the simulator toolbar, where
 * every other machine keeps the same things. This just draws the tape.
 */
export function TapeVisualizer({ tape, headPosition, currentState, isHalted }) {
    const scrollRef = useRef(null);

    // Follow the head, but never fight the user mid-drag.
    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;
        const target = Math.max(headPosition * CELL_WIDTH - el.clientWidth / 2 + CELL_WIDTH / 2, 0);
        // scrollTo is missing in jsdom and in older engines; fall back to the
        // property, which every implementation supports.
        if (typeof el.scrollTo === 'function') {
            el.scrollTo({ left: target, behavior: 'smooth' });
        } else {
            el.scrollLeft = target;
        }
    }, [headPosition]);

    return (
        <div className="tm-tape">
            <div className="tm-tape-track" ref={scrollRef}>
                <div className="tm-tape-cells">
                    {tape.map((symbol, index) => {
                        const isHead = index === headPosition;
                        return (
                            <div className="tm-tape-slot" key={index}>
                                {/* The head label rides above the active cell. */}
                                <span
                                    className={`tm-tape-head ${isHead ? 'is-visible' : ''}`}
                                    aria-hidden={!isHead}
                                >
                                    {currentState}
                                </span>
                                <div
                                    className={`tm-tape-cell ${isHead ? 'is-head' : ''} ${
                                        isHead && isHalted ? 'is-halted' : ''
                                    }`}
                                >
                                    {symbol}
                                </div>
                                <span className="tm-tape-index">{index}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
