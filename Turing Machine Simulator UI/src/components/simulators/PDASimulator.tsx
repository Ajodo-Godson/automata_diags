import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Slider } from '../ui/slider';
import { Badge } from '../ui/badge';
import { Play, Pause, SkipForward, RotateCcw, Plus, Trash2, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PDATransition {
  id: string;
  from: string;
  to: string;
  inputSymbol: string;
  popSymbol: string;
  pushSymbol: string;
}

export function PDASimulator() {
  // Example: PDA that accepts strings of form a^n b^n
  const [transitions, setTransitions] = useState<PDATransition[]>([
    { id: '1', from: 'q0', to: 'q0', inputSymbol: 'a', popSymbol: 'Z', pushSymbol: 'AZ' },
    { id: '2', from: 'q0', to: 'q0', inputSymbol: 'a', popSymbol: 'A', pushSymbol: 'AA' },
    { id: '3', from: 'q0', to: 'q1', inputSymbol: 'b', popSymbol: 'A', pushSymbol: 'ε' },
    { id: '4', from: 'q1', to: 'q1', inputSymbol: 'b', popSymbol: 'A', pushSymbol: 'ε' },
    { id: '5', from: 'q1', to: 'q2', inputSymbol: 'ε', popSymbol: 'Z', pushSymbol: 'Z' },
  ]);

  const [inputString, setInputString] = useState('aaabbb');
  const [currentPosition, setCurrentPosition] = useState(0);
  const [currentState, setCurrentState] = useState('q0');
  const [stack, setStack] = useState<string[]>(['Z']); // Z is initial stack symbol
  const [isRunning, setIsRunning] = useState(false);
  const [isAccepted, setIsAccepted] = useState<boolean | null>(null);
  const [speed, setSpeed] = useState(500);
  const [stepCount, setStepCount] = useState(0);
  const [activeTransitionId, setActiveTransitionId] = useState<string | null>(null);
  const [history, setHistory] = useState<{ state: string; stack: string[]; position: number }[]>([
    { state: 'q0', stack: ['Z'], position: 0 }
  ]);

  useEffect(() => {
    if (!isRunning) return;

    const timer = setTimeout(() => {
      executeStep();
    }, speed);

    return () => clearTimeout(timer);
  }, [isRunning, currentPosition, currentState, stack, speed]);

  const executeStep = () => {
    // Check if we can accept
    if (currentState === 'q2' && stack.length === 1 && stack[0] === 'Z') {
      setIsAccepted(true);
      setIsRunning(false);
      setActiveTransitionId(null);
      return;
    }

    // Get current input symbol (or epsilon)
    const inputSymbol = currentPosition < inputString.length ? inputString[currentPosition] : 'ε';
    const topOfStack = stack[stack.length - 1] || '';

    // Find valid transitions
    let validTransitions = transitions.filter(t => 
      t.from === currentState &&
      t.popSymbol === topOfStack &&
      (t.inputSymbol === inputSymbol || t.inputSymbol === 'ε')
    );

    // Prioritize non-epsilon transitions
    const nonEpsilonTransitions = validTransitions.filter(t => t.inputSymbol !== 'ε');
    if (nonEpsilonTransitions.length > 0) {
      validTransitions = nonEpsilonTransitions;
    }

    if (validTransitions.length === 0) {
      // No valid transition found
      if (currentPosition >= inputString.length && currentState === 'q2' && stack.length === 1) {
        setIsAccepted(true);
      } else {
        setIsAccepted(false);
      }
      setIsRunning(false);
      setActiveTransitionId(null);
      return;
    }

    // Take the first valid transition
    const transition = validTransitions[0];
    setActiveTransitionId(transition.id);

    // Update stack
    const newStack = [...stack];
    newStack.pop(); // Pop the symbol

    // Push new symbols (if not epsilon)
    if (transition.pushSymbol !== 'ε') {
      const symbolsToPush = transition.pushSymbol.split('').reverse();
      newStack.push(...symbolsToPush);
    }

    // Update state and position
    const newState = transition.to;
    const newPosition = transition.inputSymbol !== 'ε' ? currentPosition + 1 : currentPosition;

    setStack(newStack);
    setCurrentState(newState);
    setCurrentPosition(newPosition);
    setStepCount(prev => prev + 1);
    
    // Add to history
    setHistory(prev => [...prev, { state: newState, stack: newStack, position: newPosition }]);

    // Clear active transition after a short delay
    setTimeout(() => setActiveTransitionId(null), 300);
  };

  const handleReset = () => {
    setCurrentPosition(0);
    setCurrentState('q0');
    setStack(['Z']);
    setIsRunning(false);
    setIsAccepted(null);
    setStepCount(0);
    setActiveTransitionId(null);
    setHistory([{ state: 'q0', stack: ['Z'], position: 0 }]);
  };

  const handleRun = () => {
    if (isAccepted !== null) return;
    setIsRunning(true);
  };

  const handleStep = () => {
    if (isRunning || isAccepted !== null) return;
    executeStep();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left: Visualization */}
      <div className="lg:col-span-2 space-y-6">
        {/* Stack Visualization */}
        <Card className="p-6">
          <div className="space-y-4">
            <div>
              <h3>Stack Visualization</h3>
              <p className="text-sm text-muted-foreground">
                Real-time stack contents (top at the right)
              </p>
            </div>

            <div className="relative bg-muted/30 rounded-lg border-2 border-border p-8 min-h-[300px]">
              <div className="flex flex-col items-center justify-end h-full">
                <AnimatePresence>
                  {stack.length === 0 ? (
                    <div className="text-muted-foreground text-center py-8">
                      Stack is empty
                    </div>
                  ) : (
                    <div className="flex flex-row-reverse items-end gap-2">
                      {[...stack].reverse().map((symbol, index) => (
                        <motion.div
                          key={`${stack.length - index}-${symbol}`}
                          initial={{ scale: 0, y: -20 }}
                          animate={{ scale: 1, y: 0 }}
                          exit={{ scale: 0, opacity: 0 }}
                          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                          className={`
                            w-20 h-20 border-4 rounded-lg flex items-center justify-center
                            font-mono text-2xl
                            ${index === 0 
                              ? 'border-primary bg-primary/10 shadow-lg' 
                              : 'border-border bg-card'
                            }
                          `}
                        >
                          {symbol}
                        </motion.div>
                      ))}
                    </div>
                  )}
                </AnimatePresence>

                {stack.length > 0 && (
                  <div className="mt-6 flex flex-row-reverse gap-2">
                    {[...stack].reverse().map((_, index) => (
                      <div 
                        key={index}
                        className={`
                          text-xs text-center w-20
                          ${index === 0 ? 'text-primary' : 'text-muted-foreground'}
                        `}
                      >
                        {index === 0 ? '← Top' : ''}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Input String */}
        <Card className="p-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="input-string">Input String</Label>
              <Input
                id="input-string"
                value={inputString}
                onChange={(e) => setInputString(e.target.value)}
                placeholder="e.g., aaabbb"
                className="font-mono mt-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                This PDA accepts strings of form a<sup>n</sup>b<sup>n</sup> (equal a's and b's)
              </p>
            </div>

            <div className="flex gap-2 flex-wrap">
              {inputString.split('').map((char, index) => (
                <motion.div
                  key={index}
                  className={`
                    w-12 h-12 border-2 rounded-lg flex items-center justify-center font-mono
                    ${index < currentPosition
                      ? 'border-green-500 bg-green-500/10 text-green-600'
                      : index === currentPosition
                      ? 'border-primary bg-primary/10 text-primary shadow-lg'
                      : 'border-border bg-card'
                    }
                  `}
                  animate={{
                    scale: index === currentPosition ? 1.1 : 1,
                  }}
                >
                  {char}
                </motion.div>
              ))}
            </div>
          </div>
        </Card>

        {/* Controls */}
        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Label>Simulation Controls</Label>
              <div className="flex gap-2">
                {!isRunning ? (
                  <Button onClick={handleRun} disabled={isAccepted !== null} className="flex-1" size="lg">
                    <Play className="w-4 h-4 mr-2" />
                    Run
                  </Button>
                ) : (
                  <Button onClick={() => setIsRunning(false)} variant="secondary" className="flex-1" size="lg">
                    <Pause className="w-4 h-4 mr-2" />
                    Pause
                  </Button>
                )}
                
                <Button onClick={handleStep} disabled={isRunning || isAccepted !== null} variant="outline" size="lg">
                  <SkipForward className="w-4 h-4 mr-2" />
                  Step
                </Button>
                
                <Button onClick={handleReset} variant="outline" size="lg">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Speed</Label>
                  <span className="text-sm text-muted-foreground">
                    {speed <= 200 ? 'Fast' : speed <= 500 ? 'Medium' : 'Slow'}
                  </span>
                </div>
                <Slider
                  value={[speed]}
                  onValueChange={([value]) => setSpeed(value)}
                  min={100}
                  max={1000}
                  step={100}
                />
              </div>
            </div>

            <div className="space-y-4">
              <Label>Status</Label>
              <div className="space-y-3">
                <div className="bg-muted rounded-lg p-4">
                  <div className="text-sm text-muted-foreground mb-1">Current State</div>
                  <Badge variant="default" className="font-mono text-lg">
                    {currentState}
                  </Badge>
                </div>

                <div className="bg-muted rounded-lg p-4">
                  <div className="text-sm text-muted-foreground mb-1">Steps</div>
                  <div className="font-mono text-xl">{stepCount}</div>
                </div>

                {isAccepted !== null && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`
                      rounded-lg p-4 text-center
                      ${isAccepted 
                        ? 'bg-green-500 text-white' 
                        : 'bg-red-500 text-white'
                      }
                    `}
                  >
                    {isAccepted ? '✓ Accepted' : '✗ Rejected'}
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Right: Transition Table */}
      <div className="lg:col-span-1">
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3>Transition Function</h3>
                <p className="text-sm text-muted-foreground">
                  δ(state, input, pop) → (state, push)
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => {
                  const newTransition: PDATransition = {
                    id: Date.now().toString(),
                    from: 'q0',
                    to: 'q0',
                    inputSymbol: 'a',
                    popSymbol: 'Z',
                    pushSymbol: 'Z'
                  };
                  setTransitions([...transitions, newTransition]);
                }}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add
              </Button>
            </div>

            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {transitions.map(transition => (
                <PDATransitionEditor
                  key={transition.id}
                  transition={transition}
                  isActive={activeTransitionId === transition.id}
                  onUpdate={(updated) => {
                    setTransitions(transitions.map(t => 
                      t.id === transition.id ? updated : t
                    ));
                  }}
                  onDelete={() => {
                    setTransitions(transitions.filter(t => t.id !== transition.id));
                  }}
                />
              ))}
            </div>

            <div className="border-t pt-4">
              <h4 className="text-sm mb-2">Notation</h4>
              <div className="text-xs text-muted-foreground space-y-1">
                <p><strong>ε</strong> = epsilon (empty string/no action)</p>
                <p><strong>Z</strong> = initial stack symbol</p>
                <p><strong>A</strong> = stack symbol for counting</p>
                <p className="pt-2">
                  The PDA accepts when it reaches state q2 with only Z on the stack.
                </p>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="text-sm mb-2">Example Inputs</h4>
              <div className="space-y-2">
                {['ab', 'aabb', 'aaabbb', 'aaaabbbb'].map(example => (
                  <Button
                    key={example}
                    variant="outline"
                    size="sm"
                    className="w-full font-mono"
                    onClick={() => {
                      setInputString(example);
                      handleReset();
                    }}
                  >
                    {example}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

interface PDATransitionEditorProps {
  transition: PDATransition;
  isActive: boolean;
  onUpdate: (transition: PDATransition) => void;
  onDelete: () => void;
}

function PDATransitionEditor({ transition, isActive, onUpdate, onDelete }: PDATransitionEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTransition, setEditedTransition] = useState(transition);

  if (isEditing) {
    return (
      <div className="border-2 border-primary rounded-lg p-3 text-sm bg-primary/5">
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor={`from-${transition.id}`} className="text-xs">From State</Label>
              <Input
                id={`from-${transition.id}`}
                value={editedTransition.from}
                onChange={(e) => setEditedTransition({ ...editedTransition, from: e.target.value })}
                className="h-8 font-mono"
                placeholder="q0"
              />
            </div>
            <div>
              <Label htmlFor={`to-${transition.id}`} className="text-xs">To State</Label>
              <Input
                id={`to-${transition.id}`}
                value={editedTransition.to}
                onChange={(e) => setEditedTransition({ ...editedTransition, to: e.target.value })}
                className="h-8 font-mono"
                placeholder="q1"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <Label htmlFor={`input-${transition.id}`} className="text-xs">Input</Label>
              <Input
                id={`input-${transition.id}`}
                value={editedTransition.inputSymbol}
                onChange={(e) => setEditedTransition({ ...editedTransition, inputSymbol: e.target.value })}
                className="h-8 font-mono"
                placeholder="a"
              />
            </div>
            <div>
              <Label htmlFor={`pop-${transition.id}`} className="text-xs">Pop</Label>
              <Input
                id={`pop-${transition.id}`}
                value={editedTransition.popSymbol}
                onChange={(e) => setEditedTransition({ ...editedTransition, popSymbol: e.target.value })}
                className="h-8 font-mono"
                placeholder="Z"
              />
            </div>
            <div>
              <Label htmlFor={`push-${transition.id}`} className="text-xs">Push</Label>
              <Input
                id={`push-${transition.id}`}
                value={editedTransition.pushSymbol}
                onChange={(e) => setEditedTransition({ ...editedTransition, pushSymbol: e.target.value })}
                className="h-8 font-mono"
                placeholder="AZ"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              className="flex-1"
              onClick={() => {
                onUpdate(editedTransition);
                setIsEditing(false);
              }}
            >
              <Check className="w-3 h-3 mr-1" />
              Save
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={() => {
                setEditedTransition(transition);
                setIsEditing(false);
              }}
            >
              <X className="w-3 h-3 mr-1" />
              Cancel
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className={`
        border-2 rounded-lg p-3 text-sm transition-all hover:border-primary/50
        ${isActive
          ? 'border-primary bg-primary/10 shadow-lg'
          : 'border-border bg-card'
        }
      `}
      animate={{
        scale: isActive ? 1.02 : 1,
      }}
    >
      <div className="space-y-1">
        <div className="flex items-center justify-between mb-2">
          <div className="text-muted-foreground text-xs">Transition</div>
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0"
              onClick={() => setIsEditing(true)}
            >
              <Plus className="w-3 h-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0 text-destructive"
              onClick={onDelete}
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
        <div className="font-mono space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="outline">{transition.from}</Badge>
            <span className="text-xs text-muted-foreground">reading</span>
            <Badge variant="outline">{transition.inputSymbol}</Badge>
            <span className="text-xs text-muted-foreground">pop</span>
            <Badge variant="outline">{transition.popSymbol}</Badge>
          </div>
          <div className="text-primary text-center">↓</div>
          <div className="flex items-center gap-2">
            <Badge className="bg-primary/20 border-primary/40">{transition.to}</Badge>
            <span className="text-xs text-muted-foreground">push</span>
            <Badge className="bg-primary/20 border-primary/40">{transition.pushSymbol}</Badge>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
