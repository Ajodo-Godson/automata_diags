import { Play, Pause, SkipForward, RotateCcw } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { motion } from 'motion/react';

interface ControlPanelProps {
  currentState: string;
  stepCount: number;
  isRunning: boolean;
  isHalted: boolean;
  haltReason?: 'accept' | 'reject' | 'error';
  speed: number;
  onRun: () => void;
  onPause: () => void;
  onStep: () => void;
  onReset: () => void;
  onSpeedChange: (speed: number) => void;
}

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
}: ControlPanelProps) {
  const getStateColor = () => {
    if (!isHalted) return 'bg-blue-500';
    if (haltReason === 'accept') return 'bg-green-500';
    if (haltReason === 'reject') return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getStateLabel = () => {
    if (!isHalted) return 'Running';
    if (haltReason === 'accept') return 'Accepted';
    if (haltReason === 'reject') return 'Rejected';
    return 'Error: No rule found';
  };

  return (
    <Card className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Controls */}
        <div className="space-y-6">
          <div>
            <Label className="mb-3 block">Simulation Controls</Label>
            <div className="flex gap-2">
              {!isRunning ? (
                <Button
                  onClick={onRun}
                  disabled={isHalted}
                  className="flex-1"
                  size="lg"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Run
                </Button>
              ) : (
                <Button
                  onClick={onPause}
                  variant="secondary"
                  className="flex-1"
                  size="lg"
                >
                  <Pause className="w-4 h-4 mr-2" />
                  Pause
                </Button>
              )}
              
              <Button
                onClick={onStep}
                disabled={isRunning || isHalted}
                variant="outline"
                size="lg"
              >
                <SkipForward className="w-4 h-4 mr-2" />
                Step
              </Button>
              
              <Button
                onClick={onReset}
                variant="outline"
                size="lg"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="speed-slider">Speed</Label>
              <span className="text-sm text-muted-foreground">
                {speed <= 200 ? 'Fast' : speed <= 500 ? 'Medium' : 'Slow'}
              </span>
            </div>
            <Slider
              id="speed-slider"
              value={[speed]}
              onValueChange={([value]) => onSpeedChange(value)}
              min={100}
              max={1000}
              step={100}
              className="w-full"
            />
          </div>
        </div>

        {/* Right: State Display */}
        <div className="space-y-4">
          <div className="space-y-3">
            <Label>Current State</Label>
            <motion.div
              className={`
                ${getStateColor()}
                text-white rounded-lg p-4 text-center
                shadow-lg
              `}
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
              <div className="font-mono text-2xl">{currentState}</div>
              {isHalted && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm mt-2 opacity-90"
                >
                  {getStateLabel()}
                </motion.div>
              )}
            </motion.div>
          </div>

          <div className="space-y-2">
            <Label>Steps Executed</Label>
            <div className="bg-muted rounded-lg p-4 text-center">
              <motion.div
                key={stepCount}
                initial={{ scale: 1.2, color: 'rgb(59, 130, 246)' }}
                animate={{ scale: 1, color: 'inherit' }}
                transition={{ duration: 0.2 }}
                className="font-mono text-2xl"
              >
                {stepCount}
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
