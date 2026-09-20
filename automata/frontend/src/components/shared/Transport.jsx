import React from 'react';
import { Pause, Play, RotateCcw, SkipForward } from 'lucide-react';

const SPEEDS = [
    { value: 900, label: 'Slow' },
    { value: 500, label: 'Medium' },
    { value: 250, label: 'Fast' },
    { value: 100, label: 'Fastest' },
];

/**
 * Playback controls shared by every simulator.
 *
 * Each machine used to ship its own control panel with its own button casing
 * ("RUN"/"Run"), its own speed slider and its own readout markup. This is the
 * one implementation; `readouts` lets a machine add what is specific to it
 * (stack depth for a PDA, head position for a TM).
 */
export default function Transport({
    isPlaying,
    canStep,
    canPlay,
    onRun,
    onPause,
    onStep,
    onReset,
    speed,
    onSpeedChange,
    readouts = [],
}) {
    return (
        <div className="sim-transport">
            <div className="sim-transport-group">
                {isPlaying ? (
                    <button type="button" className="btn" onClick={onPause}>
                        <Pause size={14} aria-hidden="true" />
                        Pause
                    </button>
                ) : (
                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={onRun}
                        disabled={!canPlay}
                    >
                        <Play size={14} aria-hidden="true" />
                        Run
                    </button>
                )}

                <button
                    type="button"
                    className="btn"
                    onClick={onStep}
                    disabled={isPlaying || !canStep}
                >
                    <SkipForward size={14} aria-hidden="true" />
                    Step
                </button>

                <button type="button" className="btn" onClick={onReset}>
                    <RotateCcw size={14} aria-hidden="true" />
                    Reset
                </button>
            </div>

            <div className="sim-speed">
                <label className="hint" htmlFor="sim-speed">
                    Speed
                </label>
                <select
                    id="sim-speed"
                    className="field field-sm"
                    style={{ width: 'auto' }}
                    value={speed}
                    onChange={(e) => onSpeedChange(Number(e.target.value))}
                >
                    {SPEEDS.map((s) => (
                        <option key={s.value} value={s.value}>
                            {s.label}
                        </option>
                    ))}
                </select>
            </div>

            {readouts.length > 0 && (
                <div className="sim-transport-readout">
                    {readouts.map(({ label, value }) => (
                        <div className="sim-readout" key={label}>
                            <span className="eyebrow">{label}</span>
                            <span className="sim-readout-value">{value}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
