import React from 'react';
import { Play, Pause, SkipForward, SkipBack, RotateCcw } from 'lucide-react';

export const NFAControlPanel = ({
    onTogglePlayback,
    onStepForward,
    onStepBackward,
    onReset,
    isPlaying,
    canStepForward,
    canStepBackward,
    speed,
    onSpeedChange
}) => {
        return (
            <div className="dfa-control-panel-card-compact">
                <div className="dfa-control-grid-compact">
                    <div className="dfa-controls-section">
                        <div className="dfa-control-group">
                            <label className="dfa-control-label-compact">Simulation Controls</label>
                            <div className="dfa-button-group-compact">
                                <button
                                    onClick={onStepBackward}
                                    disabled={!canStepBackward}
                                    className="dfa-btn dfa-btn-outline dfa-btn-small"
                                >
                                    <SkipBack size={14} />
                                    BACK
                                </button>
                                {!isPlaying ? (
                                    <button
                                        onClick={onTogglePlayback}
                                        className="dfa-btn dfa-btn-primary dfa-btn-small"
                                    >
                                        <Play size={14} />
                                        RUN
                                    </button>
                                ) : (
                                    <button
                                        onClick={onTogglePlayback}
                                        className="dfa-btn dfa-btn-secondary dfa-btn-small"
                                    >
                                        <Pause size={14} />
                                        PAUSE
                                    </button>
                                )}
                                <button
                                    onClick={onStepForward}
                                    disabled={!canStepForward}
                                    className="dfa-btn dfa-btn-outline dfa-btn-small"
                                >
                                    <SkipForward size={14} />
                                    FORWARD
                                </button>
                                <button
                                    onClick={onReset}
                                    className="dfa-btn dfa-btn-outline dfa-btn-small"
                                >
                                    <RotateCcw size={14} />
                                    RESET
                                </button>
                            </div>
                        </div>

                        <div className="dfa-speed-control-group">
                            <div className="dfa-speed-label-row">
                                <label className="dfa-control-label">Speed</label>
                                <span className="dfa-speed-value">
                                    {speed <= 200 ? 'Fast' : speed <= 500 ? 'Medium' : 'Slow'}
                                </span>
                            </div>
                            <input
                                type="range"
                                min="100"
                                max="2000"
                                step="100"
                                value={speed}
                                onChange={(e) => onSpeedChange(Number(e.target.value))}
                                className="dfa-speed-slider"
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    };