import React from 'react';
import { Play, Pause, SkipForward, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';
import './stylings/DFAControlPanel.css';

export function DFAControlPanel({
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
}) {
  const getStateColor = () => {
    if (!isComplete) return 'state-running';
    return isAccepted ? 'state-accepted' : 'state-rejected';
  };

  const getStateLabel = () => {
    if (!isComplete) return 'Running';
    return isAccepted ? 'Accepted' : 'Rejected';
  };

  return (
    <div className="dfa-control-panel-card-compact">
      <div className="dfa-control-grid-compact">
        {/* Left: Controls */}
        <div className="dfa-controls-section">
          <div className="dfa-control-group">
            <label className="dfa-control-label-compact">Simulation Controls</label>
            <div className="dfa-button-group-compact">
              {!isPlaying ? (
                <button
                  onClick={onRun}
                  disabled={isComplete}
                  className="dfa-btn dfa-btn-primary dfa-btn-small"
                >
                  <Play size={14} />
                  RUN
                </button>
              ) : (
                <button
                  onClick={onPause}
                  className="dfa-btn dfa-btn-secondary dfa-btn-small"
                >
                  <Pause size={14} />
                  Pause
                </button>
              )}
              
              <button
                onClick={onStep}
                disabled={isPlaying || isComplete}
                className="dfa-btn dfa-btn-outline dfa-btn-small"
              >
                <SkipForward size={14} />
                STEP
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
              <label htmlFor="dfa-speed-slider" className="dfa-control-label">Speed</label>
              <span className="dfa-speed-value">
                {speed <= 200 ? 'Fast' : speed <= 500 ? 'Medium' : 'Slow'}
              </span>
            </div>
            <input
              id="dfa-speed-slider"
              type="range"
              value={speed}
              onChange={(e) => onSpeedChange(Number(e.target.value))}
              min="100"
              max="1000"
              step="100"
              className="dfa-speed-slider"
            />
          </div>
        </div>

        {/* Right: State Display */}
        <div className="dfa-state-display-section">
          <div className="dfa-state-group">
            <label className="dfa-control-label">Current State</label>
            <motion.div
              className={`dfa-state-display ${getStateColor()}`}
              animate={{
                boxShadow: isPlaying 
                  ? ['0 4px 6px rgba(0,0,0,0.1)', '0 8px 15px rgba(59,130,246,0.3)', '0 4px 6px rgba(0,0,0,0.1)']
                  : '0 4px 6px rgba(0,0,0,0.1)'
              }}
              transition={{
                duration: 1,
                repeat: isPlaying ? Infinity : 0,
                repeatType: 'reverse'
              }}
            >
              <div className="dfa-state-name">{currentState || 'N/A'}</div>
              {isComplete && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="dfa-state-status"
                >
                  {getStateLabel()}
                </motion.div>
              )}
            </motion.div>
          </div>

          <div className="dfa-steps-group">
            <label className="dfa-control-label">Steps Executed</label>
            <div className="dfa-steps-display">
              <motion.div
                key={stepCount}
                initial={{ scale: 1.2, color: '#3b82f6' }}
                animate={{ scale: 1, color: 'inherit' }}
                transition={{ duration: 0.2 }}
                className="dfa-step-count"
              >
                {stepCount}
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}




