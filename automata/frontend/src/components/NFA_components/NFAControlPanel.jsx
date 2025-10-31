import React from 'react';

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
        <div className="nfa-control-card">
            <h3 className="nfa-card-title">Simulation Controls</h3>
            
            <div className="control-section">
                <div className="playback-controls">
                    <button 
                        onClick={onStepBackward}
                        disabled={!canStepBackward}
                        className="control-btn secondary"
                    >
                        ⏪ Step Back
                    </button>
                    
                    <button 
                        onClick={onTogglePlayback}
                        className="control-btn primary"
                    >
                        {isPlaying ? '⏸️ Pause' : '▶️ Play'}
                    </button>
                    
                    <button 
                        onClick={onStepForward}
                        disabled={!canStepForward}
                        className="control-btn secondary"
                    >
                        Step Forward ⏩
                    </button>
                </div>
                
                <button 
                    onClick={onReset}
                    className="control-btn outline reset-btn"
                >
                    🔄 Reset
                </button>
            </div>
            
            <div className="speed-control">
                <label className="speed-label">Playback Speed</label>
                <input
                    type="range"
                    min="100"
                    max="2000"
                    step="100"
                    value={speed}
                    onChange={(e) => onSpeedChange(Number(e.target.value))}
                    className="speed-slider"
                />
                <div className="speed-value">{speed}ms</div>
            </div>
        </div>
    );
};