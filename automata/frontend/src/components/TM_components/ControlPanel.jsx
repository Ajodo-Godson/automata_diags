import React from 'react';
import { Play, Pause, SkipForward, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';
import './stylings/ControlPanel.css';

export function ControlPanel({
  currentState,
  stepCount,
  isRunning,
  isHalted,
  haltReason,
  speed,
  onRun,
  onPause,
  onStep,
  onReset,
  onSpeedChange
}) {
  const getStateColor = () => {
    if (!isHalted) return 'state-running';
    if (haltReason === 'accept') return 'state-accepted';
    if (haltReason === 'reject') return 'state-rejected';
    return 'state-rejected'; // Default to rejected if halted without explicit reason
  };

  const getStateLabel = () => {
    if (!isHalted) return 'Running';
    if (haltReason === 'accept') return 'Accepted';
    if (haltReason === 'reject') return 'Rejected';
    return 'Halted (Rejected)';
  };

  return (
    <div className="control-panel-card">
      <div className="control-grid">
        {/* Left: Controls */}
        <div className="controls-section">
          <div className="control-group">
            <label className="control-label">Simulation Controls</label>
            <div className="button-group">
              {!isRunning ? (
                <button
                  onClick={onRun}
                  disabled={isHalted}
                  className="btn btn-primary btn-large"
                >
                  <Play className="btn-icon" />
                  Run
                </button>
              ) : (
                <button
                  onClick={onPause}
                  className="btn btn-secondary btn-large"
                >
                  <Pause className="btn-icon" />
                  Pause
                </button>
              )}
              
              <button
                onClick={onStep}
                disabled={isRunning || isHalted}
                className="btn btn-outline btn-large"
              >
                <SkipForward className="btn-icon" />
                Step
              </button>
              
              <button
                onClick={onReset}
                className="btn btn-outline btn-large"
              >
                <RotateCcw className="btn-icon" />
                Reset
              </button>
            </div>
          </div>

          <div className="speed-control-group">
            <div className="speed-label-row">
              <label htmlFor="speed-slider" className="control-label">Speed</label>
              <span className="speed-value">
                {speed <= 200 ? 'Fast' : speed <= 500 ? 'Medium' : 'Slow'}
              </span>
            </div>
            <input
              id="speed-slider"
              type="range"
              value={speed}
              onChange={(e) => onSpeedChange(Number(e.target.value))}
              min="100"
              max="1000"
              step="100"
              className="speed-slider"
            />
          </div>
        </div>

        {/* Right: State Display */}
        <div className="state-display-section">
          <div className="state-group">
            <label className="control-label">Current State</label>
            <motion.div
              className={`state-display ${getStateColor()}`}
              animate={{
                boxShadow: isRunning 
                  ? ['0 4px 6px rgba(0,0,0,0.1)', '0 8px 15px rgba(59,130,246,0.3)', '0 4px 6px rgba(0,0,0,0.1)']
                  : '0 4px 6px rgba(0,0,0,0.1)'
              }}
              transition={{
                duration: 1,
                repeat: isRunning ? Infinity : 0,
                repeatType: 'reverse'
              }}
            >
              <div className="state-name">{currentState}</div>
              {isHalted && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="state-status"
                >
                  {getStateLabel()}
                </motion.div>
              )}
            </motion.div>
          </div>

          <div className="steps-group">
            <label className="control-label">Steps Executed</label>
            <div className="steps-display">
              <motion.div
                key={stepCount}
                initial={{ scale: 1.2, color: '#3b82f6' }}
                animate={{ scale: 1, color: 'inherit' }}
                transition={{ duration: 0.2 }}
                className="step-count"
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

