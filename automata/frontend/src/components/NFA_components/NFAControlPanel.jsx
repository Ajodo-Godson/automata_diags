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
            <div className="dfa-control-panel-card">
                <div className="dfa-control-grid">
                    <div className="dfa-controls-section">
                        <div className="dfa-control-group">
                            <label className="dfa-control-label">Simulation Controls</label>
                            <div className="dfa-button-group">
                                <button
                                    onClick={onStepBackward}
                                    disabled={!canStepBackward}
                                    className="dfa-btn dfa-btn-outline dfa-btn-large"
                                >
                                    <SkipBack className="dfa-btn-icon" />
                                    Step Back
                                </button>
                                {!isPlaying ? (
                                    <button
                                        onClick={onTogglePlayback}
                                        className="dfa-btn dfa-btn-primary dfa-btn-large"
                                    >
                                        <Play className="dfa-btn-icon" />
                                        Run
                                    </button>
                                ) : (
                                    <button
                                        onClick={onTogglePlayback}
                                        className="dfa-btn dfa-btn-secondary dfa-btn-large"
                                    >
                                        <Pause className="dfa-btn-icon" />
                                        Pause
                                    </button>
                                )}
                                <button
                                    onClick={onStepForward}
                                    disabled={!canStepForward}
                                    className="dfa-btn dfa-btn-outline dfa-btn-large"
                                >
                                    <SkipForward className="dfa-btn-icon" />
                                    Step Forward
                                </button>
                                <button
                                    onClick={onReset}
                                    className="dfa-btn dfa-btn-outline dfa-btn-large"
                                >
                                    <RotateCcw className="dfa-btn-icon" />
                                    Reset
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="dfa-speed-section">
                        <label className="dfa-control-label">Playback Speed</label>
                        <input
                            type="range"
                            min="100"
                            max="2000"
                            step="100"
                            value={speed}
                            onChange={(e) => onSpeedChange(Number(e.target.value))}
                            className="dfa-speed-slider"
                        />
                        <span className="dfa-speed-value">{speed} ms</span>
                    </div>
                </div>
            </div>
        );
    };