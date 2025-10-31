import { useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface TapeVisualizerProps {
  tape: string[];
  headPosition: number;
  currentState: string;
  initialInput: string;
  onInitialInputChange: (input: string) => void;
}

export function TapeVisualizer({
  tape,
  headPosition,
  currentState,
  initialInput,
  onInitialInputChange
}: TapeVisualizerProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to keep the head in view
  useEffect(() => {
    if (scrollContainerRef.current) {
      const cellWidth = 64; // w-16 = 64px
      const containerWidth = scrollContainerRef.current.clientWidth;
      const scrollPosition = headPosition * cellWidth - containerWidth / 2 + cellWidth / 2;
      
      scrollContainerRef.current.scrollTo({
        left: scrollPosition,
        behavior: 'smooth'
      });
    }
  }, [headPosition]);

  return (
    <Card className="p-6 space-y-6">
      <div className="space-y-2">
        <Label htmlFor="initial-input">Initial Tape Input</Label>
        <Input
          id="initial-input"
          value={initialInput}
          onChange={(e) => onInitialInputChange(e.target.value)}
          placeholder="Enter symbols (e.g., 0010)"
          className="font-mono"
        />
        <p className="text-sm text-muted-foreground">
          Set the initial tape contents. Use any characters. Blank cells are represented by □.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-center">
          <motion.div
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg inline-block"
            initial={{ scale: 1 }}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
          >
            Read/Write Head ↓
          </motion.div>
        </div>

        <div 
          ref={scrollContainerRef}
          className="relative overflow-x-auto pb-4"
          style={{ scrollbarWidth: 'thin' }}
        >
          <div className="flex gap-1 min-w-full justify-center px-4">
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

        <div className="text-center text-sm text-muted-foreground">
          Scroll to view more of the tape • Head Position: {headPosition}
        </div>
      </div>
    </Card>
  );
}

interface TapeCellProps {
  symbol: string;
  isActive: boolean;
  position: number;
}

function TapeCell({ symbol, isActive, position }: TapeCellProps) {
  return (
    <div className="relative flex-shrink-0">
      {/* Active indicator arrow */}
      {isActive && (
        <motion.div
          className="absolute -top-8 left-1/2 -translate-x-1/2 text-primary"
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="drop-shadow-lg"
          >
            <path d="M12 16L6 10h12z" />
          </svg>
        </motion.div>
      )}

      {/* Cell */}
      <motion.div
        className={`
          w-16 h-16 border-2 rounded-lg flex items-center justify-center
          font-mono transition-colors duration-200
          ${isActive 
            ? 'border-primary bg-primary/10 shadow-lg shadow-primary/20' 
            : 'border-border bg-card hover:border-primary/50'
          }
        `}
        initial={false}
        animate={{
          scale: isActive ? 1.05 : 1,
          borderWidth: isActive ? 3 : 2
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      >
        <motion.span
          key={`${position}-${symbol}`}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="text-lg"
        >
          {symbol}
        </motion.span>
      </motion.div>

      {/* Position label */}
      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-muted-foreground">
        {position}
      </div>
    </div>
  );
}
