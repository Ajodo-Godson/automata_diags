import React from 'react';

export const PDAControlPanel = ({
    currentState,
    stepCount,
    isPlaying,
    isComplete,
    isAccepted,
    speed,
    onRun,
    onPause,
    onStep,
    onReset,
    onSpeedChange
}) => {
    return (
        <div className="pda-control-panel">
            <h3 className="pda-card-title">Simulation Controls</h3>

            <div className="pda-control-grid">
                {/* Status */}
                <div className="pda-status">
                    <div className="pda-status-item">
                        <span className="pda-status-label">Current State:</span>
                        <span className="pda-status-value">{currentState}</span>
                    </div>
                    <div className="pda-status-item">
                        <span className="pda-status-label">Step:</span>
                        <span className="pda-status-value">{stepCount}</span>
                    </div>
                    {isComplete && (
                        <div className="pda-status-item">
                            <span className="pda-status-label">Result:</span>
                            <span className={`pda-status-result ${isAccepted ? 'accepted' : 'rejected'}`}>
                                {isAccepted ? 'ACCEPTED' : 'REJECTED'}
                            </span>
                        </div>
                    )}
                </div>

                {/* Controls */}
                <div className="pda-controls">
                    {!isPlaying ? (
                        <button
                            onClick={onRun}
                            disabled={isComplete}
                            className="pda-btn pda-btn-primary pda-control-btn"
                        >
                            ▶ Run
                        </button>
                    ) : (
                        <button
                            onClick={onPause}
                            className="pda-btn pda-btn-secondary pda-control-btn"
                        >
                            ⏸ Pause
                        </button>
                    )}

                    <button
                        onClick={onStep}
                        disabled={isPlaying || isComplete}
                        className="pda-btn pda-btn-outline pda-control-btn"
                    >
                        ▶▶ Step
                    </button>

                    <button
                        onClick={onReset}
                        className="pda-btn pda-btn-outline pda-control-btn"
                    >
                        🔄 Reset
                    </button>
                </div>

                {/* Speed Control */}
                <div className="pda-speed-control">
                    <label className="pda-speed-label">Speed:</label>
                    <input
                        type="range"
                        min="100"
                        max="2000"
                        value={speed}
                        onChange={(e) => onSpeedChange(parseInt(e.target.value))}
                        className="pda-speed-slider"
                    />
                    <span className="pda-speed-value">
                        {speed < 500 ? 'Fast' : speed < 1000 ? 'Medium' : 'Slow'}
                    </span>
                </div>
            </div>
        </div>
    );
};