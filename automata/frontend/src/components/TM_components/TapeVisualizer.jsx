import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import './stylings/TapeVisualizer.css';

export function TapeVisualizer({ tape, headPosition, currentState, initialInput, onInitialInputChange, isHalted, haltReason }) {
  const scrollContainerRef = useRef(null);

  // Auto-scroll to keep the head in view
  useEffect(() => {
    if (scrollContainerRef.current) {
      const cellWidth = 64; // matches .tape-cell width
      const containerWidth = scrollContainerRef.current.clientWidth;
      const scrollPosition = headPosition * cellWidth - containerWidth / 2 + cellWidth / 2;
      
      scrollContainerRef.current.scrollTo({
        left: scrollPosition,
        behavior: 'smooth'
      });
    }
  }, [headPosition]);

  // Extract output from tape (non-blank symbols)
  const getTapeOutput = () => {
    return tape.filter(s => s !== '□' && s !== '').join('');
  };

  const tapeOutput = getTapeOutput();

  return (
    <div className="tm-tape-card">
      <h3 className="tm-card-title"> Tape Visualizer</h3>
      <div className="input-section">
        <label htmlFor="initial-input" className="input-label">Initial Tape Input</label>
        <input
          id="initial-input"
          value={initialInput}
          onChange={(e) => onInitialInputChange(e.target.value)}
          placeholder="Enter symbols (e.g., 0010)"
          className="tape-input"
        />
        <p className="input-help">
          Set the initial tape contents. Use any characters. Blank cells are represented by □.
        </p>
      </div>

      <div className="tape-section">
        <div className="head-indicator-container">
          <motion.div
            className="head-indicator-label"
            initial={{ scale: 1 }}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
          >
            Read/Write Head ↓
          </motion.div>
        </div>

        <div 
          ref={scrollContainerRef}
          className="tape-scroll-container"
        >
          <div className="tape-cells-container">
            {tape.map((symbol, index) => (
              <TapeCell
                key={index}
                symbol={symbol}
                isActive={index === headPosition}
                position={index}
              />
            ))}
          </div>
        </div>

        <div className="tape-footer">
          Scroll to view more of the tape • Head Position: {headPosition}
        </div>
      </div>

      {/* Output Display */}
      {isHalted && (
        <div className={`output-section ${haltReason === 'accept' ? 'output-accepted' : 'output-rejected'}`}>
          <h4 className="output-title">
            {haltReason === 'accept' ? '✓ Computation Complete' : '✗ Computation Failed'}
          </h4>
          <div className="output-content">
            <div className="output-row">
              <span className="output-label">Input:</span>
              <span className="output-value">{initialInput || '(empty)'}</span>
            </div>
            {haltReason === 'accept' && (
              <div className="output-row">
                <span className="output-label">Output on Tape:</span>
                <span className="output-value tape-output">{tapeOutput}</span>
              </div>
            )}
            <div className="output-help">
              {haltReason === 'accept' 
                ? 'The result is written on the tape above. Look at the tape cells to see the output.'
                : 'The computation halted without completing. Check the tape and program rules.'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TapeCell({ symbol, isActive, position }) {
  return (
    <div className="tape-cell-wrapper">
      {/* Active indicator arrow */}
      {isActive && (
        <motion.div
          className="active-arrow"
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 16L6 10h12z" />
          </svg>
        </motion.div>
      )}

      {/* Cell */}
      <motion.div
        className={`tape-cell ${isActive ? 'active' : ''}`}
        initial={false}
        animate={{
          scale: isActive ? 1.05 : 1,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      >
        <motion.span
          key={`${position}-${symbol}`}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="tape-symbol"
        >
          {symbol}
        </motion.span>
      </motion.div>

      {/* Position label */}
      <div className="tape-position">{position}</div>
    </div>
  );
}








