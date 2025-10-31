import React from 'react';

export const CFGControlPanel = ({
    currentStep,
    totalSteps,
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
        <div className="cfg-control-panel">
            <h3 className="cfg-card-title">Simulation Controls</h3>

            <div className="cfg-control-grid">
                {/* Status */}
                <div className="cfg-status">
                    <div className="cfg-status-item">
                        <span className="cfg-status-label">Current Step:</span>
                        <span className="cfg-status-value">
                            {totalSteps > 0 ? `${currentStep + 1} / ${totalSteps}` : '0 / 0'}
                        </span>
                    </div>
                    {isComplete && (
                        <div className="cfg-status-item">
                            <span className="cfg-status-label">Result:</span>
                            <span className={`cfg-status-result ${isAccepted ? 'accepted' : 'rejected'}`}>
                                {isAccepted ? 'ACCEPTED' : 'REJECTED'}
                            </span>
                        </div>
                    )}
                </div>

                {/* Controls */}
                <div className="cfg-controls">
                    {!isPlaying ? (
                        <button
                            onClick={onRun}
                            disabled={isComplete}
                            className="cfg-btn cfg-btn-primary cfg-control-btn"
                        >
                            ▶ Run
                        </button>
                    ) : (
                        <button
                            onClick={onPause}
                            className="cfg-btn cfg-btn-secondary cfg-control-btn"
                        >
                            ⏸ Pause
                        </button>
                    )}

                    <button
                        onClick={onStep}
                        disabled={isPlaying || isComplete}
                        className="cfg-btn cfg-btn-outline cfg-control-btn"
                    >
                        ▶▶ Step
                    </button>

                    <button
                        onClick={onReset}
                        className="cfg-btn cfg-btn-outline cfg-control-btn"
                    >
                        🔄 Reset
                    </button>
                </div>

                {/* Speed Control */}
                <div className="cfg-speed-control">
                    <label className="cfg-speed-label">Speed:</label>
                    <input
                        type="range"
                        min="200"
                        max="3000"
                        value={speed}
                        onChange={(e) => onSpeedChange(parseInt(e.target.value))}
                        className="cfg-speed-slider"
                    />
                    <span className="cfg-speed-value">
                        {speed < 1000 ? 'Fast' : speed < 2000 ? 'Medium' : 'Slow'}
                    </span>
                </div>
            </div>
        </div>
    );
};