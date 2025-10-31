import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Slider } from '../ui/slider';
import { Badge } from '../ui/badge';
import { Play, Pause, SkipForward, RotateCcw, Plus, Trash2, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Switch } from '../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface DFATransition {
  id: string;
  from: string;
  to: string;
  symbol: string;
}

interface DFAState {
  id: string;
  name: string;
  isInitial: boolean;
  isFinal: boolean;
  x: number;
  y: number;
}

export function DFANFASimulator() {
  const [isNFA, setIsNFA] = useState(false);
  const [states, setStates] = useState<DFAState[]>([
    { id: '1', name: 'q0', isInitial: true, isFinal: false, x: 150, y: 200 },
    { id: '2', name: 'q1', isInitial: false, isFinal: false, x: 350, y: 200 },
    { id: '3', name: 'q2', isInitial: false, isFinal: true, x: 550, y: 200 },
  ]);

  const [transitions, setTransitions] = useState<DFATransition[]>([
    { id: '1', from: 'q0', to: 'q1', symbol: 'a' },
    { id: '2', from: 'q1', to: 'q2', symbol: 'b' },
    { id: '3', from: 'q2', to: 'q2', symbol: 'a,b' },
    { id: '4', from: 'q0', to: 'q0', symbol: 'b' },
    { id: '5', from: 'q1', to: 'q1', symbol: 'a' },
  ]);

  const [inputString, setInputString] = useState('aab');
  const [currentPosition, setCurrentPosition] = useState(0);
  const [currentStates, setCurrentStates] = useState<string[]>(['q0']);
  const [isRunning, setIsRunning] = useState(false);
  const [isAccepted, setIsAccepted] = useState<boolean | null>(null);
  const [speed, setSpeed] = useState(500);
  const [stepCount, setStepCount] = useState(0);

  useEffect(() => {
    if (!isRunning || currentPosition >= inputString.length) return;

    const timer = setTimeout(() => {
      executeStep();
    }, speed);

    return () => clearTimeout(timer);
  }, [isRunning, currentPosition, speed]);

  const executeStep = () => {
    if (currentPosition >= inputString.length) {
      const finalStates = states.filter(s => s.isFinal);
      const accepted = currentStates.some(cs => 
        finalStates.some(fs => fs.name === cs)
      );
      setIsAccepted(accepted);
      setIsRunning(false);
      return;
    }

    const symbol = inputString[currentPosition];
    const nextStates: string[] = [];

    currentStates.forEach(currentState => {
      const validTransitions = transitions.filter(t => 
        t.from === currentState && 
        (t.symbol === symbol || t.symbol.split(',').includes(symbol))
      );

      validTransitions.forEach(t => {
        if (!nextStates.includes(t.to)) {
          nextStates.push(t.to);
        }
      });
    });

    if (nextStates.length === 0) {
      setIsAccepted(false);
      setIsRunning(false);
      return;
    }

    setCurrentStates(nextStates);
    setCurrentPosition(prev => prev + 1);
    setStepCount(prev => prev + 1);

    if (currentPosition + 1 >= inputString.length) {
      const finalStates = states.filter(s => s.isFinal);
      const accepted = nextStates.some(ns => 
        finalStates.some(fs => fs.name === ns)
      );
      setIsAccepted(accepted);
      setIsRunning(false);
    }
  };

  const handleReset = () => {
    setCurrentPosition(0);
    setCurrentStates([states.find(s => s.isInitial)?.name || 'q0']);
    setIsRunning(false);
    setIsAccepted(null);
    setStepCount(0);
  };

  const handleRun = () => {
    if (currentPosition >= inputString.length) return;
    setIsRunning(true);
  };

  const handleStep = () => {
    if (isRunning || currentPosition >= inputString.length) return;
    executeStep();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left: State Diagram */}
      <div className="lg:col-span-2 space-y-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3>State Diagram</h3>
              <p className="text-sm text-muted-foreground">
                Visual representation of the automaton
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="nfa-mode" className="text-sm">NFA Mode</Label>
              <Switch
                id="nfa-mode"
                checked={isNFA}
                onCheckedChange={setIsNFA}
              />
            </div>
          </div>

          <div className="relative bg-muted/30 rounded-lg border-2 border-border" style={{ height: '400px' }}>
            <svg className="w-full h-full">
              {/* Draw transitions */}
              {transitions.map(transition => {
                const fromState = states.find(s => s.name === transition.from);
                const toState = states.find(s => s.name === transition.to);
                
                if (!fromState || !toState) return null;

                const isSelfLoop = fromState.name === toState.name;
                const isActive = currentStates.includes(fromState.name);

                if (isSelfLoop) {
                  return (
                    <g key={transition.id}>
                      <path
                        d={`M ${fromState.x + 30} ${fromState.y - 20} 
                            Q ${fromState.x + 60} ${fromState.y - 50} 
                              ${fromState.x} ${fromState.y - 30}`}
                        fill="none"
                        stroke={isActive ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))'}
                        strokeWidth={isActive ? 3 : 2}
                        markerEnd={`url(#arrowhead-${isActive ? 'active' : 'normal'})`}
                      />
                      <text
                        x={fromState.x + 35}
                        y={fromState.y - 45}
                        className="text-sm fill-foreground"
                        textAnchor="middle"
                      >
                        {transition.symbol}
                      </text>
                    </g>
                  );
                }

                const dx = toState.x - fromState.x;
                const dy = toState.y - fromState.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const unitX = dx / distance;
                const unitY = dy / distance;

                const startX = fromState.x + unitX * 30;
                const startY = fromState.y + unitY * 30;
                const endX = toState.x - unitX * 30;
                const endY = toState.y - unitY * 30;

                const midX = (startX + endX) / 2;
                const midY = (startY + endY) / 2;

                return (
                  <g key={transition.id}>
                    <line
                      x1={startX}
                      y1={startY}
                      x2={endX}
                      y2={endY}
                      stroke={isActive ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))'}
                      strokeWidth={isActive ? 3 : 2}
                      markerEnd={`url(#arrowhead-${isActive ? 'active' : 'normal'})`}
                    />
                    <text
                      x={midX}
                      y={midY - 10}
                      className="text-sm fill-foreground"
                      textAnchor="middle"
                    >
                      {transition.symbol}
                    </text>
                  </g>
                );
              })}

              {/* Arrow markers */}
              <defs>
                <marker
                  id="arrowhead-normal"
                  markerWidth="10"
                  markerHeight="10"
                  refX="9"
                  refY="3"
                  orient="auto"
                >
                  <polygon
                    points="0 0, 10 3, 0 6"
                    fill="hsl(var(--muted-foreground))"
                  />
                </marker>
                <marker
                  id="arrowhead-active"
                  markerWidth="10"
                  markerHeight="10"
                  refX="9"
                  refY="3"
                  orient="auto"
                >
                  <polygon
                    points="0 0, 10 3, 0 6"
                    fill="hsl(var(--primary))"
                  />
                </marker>
              </defs>

              {/* Draw states */}
              {states.map(state => {
                const isActive = currentStates.includes(state.name);
                
                return (
                  <g key={state.id}>
                    {/* Initial state arrow */}
                    {state.isInitial && (
                      <line
                        x1={state.x - 50}
                        y1={state.y}
                        x2={state.x - 32}
                        y2={state.y}
                        stroke="hsl(var(--foreground))"
                        strokeWidth="2"
                        markerEnd="url(#arrowhead-initial)"
                      />
                    )}
                    
                    {/* State circle */}
                    <motion.circle
                      cx={state.x}
                      cy={state.y}
                      r={30}
                      fill={isActive ? 'hsl(var(--primary) / 0.1)' : 'hsl(var(--card))'}
                      stroke={isActive ? 'hsl(var(--primary))' : 'hsl(var(--border))'}
                      strokeWidth={isActive ? 4 : 2}
                      animate={{
                        scale: isActive ? 1.1 : 1,
                      }}
                      transition={{ duration: 0.2 }}
                    />
                    
                    {/* Final state double circle */}
                    {state.isFinal && (
                      <circle
                        cx={state.x}
                        cy={state.y}
                        r={24}
                        fill="none"
                        stroke={isActive ? 'hsl(var(--primary))' : 'hsl(var(--border))'}
                        strokeWidth={2}
                      />
                    )}
                    
                    {/* State label */}
                    <text
                      x={state.x}
                      y={state.y + 5}
                      className="text-base"
                      textAnchor="middle"
                      fill="hsl(var(--foreground))"
                    >
                      {state.name}
                    </text>
                  </g>
                );
              })}

              {/* Initial arrow marker */}
              <defs>
                <marker
                  id="arrowhead-initial"
                  markerWidth="10"
                  markerHeight="10"
                  refX="9"
                  refY="3"
                  orient="auto"
                >
                  <polygon
                    points="0 0, 10 3, 0 6"
                    fill="hsl(var(--foreground))"
                  />
                </marker>
              </defs>
            </svg>
          </div>
        </Card>

        {/* Input String Visualization */}
        <Card className="p-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="input-string">Input String</Label>
              <Input
                id="input-string"
                value={inputString}
                onChange={(e) => setInputString(e.target.value)}
                placeholder="Enter input string (e.g., aab)"
                className="font-mono mt-2"
              />
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
                  <Button onClick={handleRun} className="flex-1" size="lg">
                    <Play className="w-4 h-4 mr-2" />
                    Run
                  </Button>
                ) : (
                  <Button onClick={() => setIsRunning(false)} variant="secondary" className="flex-1" size="lg">
                    <Pause className="w-4 h-4 mr-2" />
                    Pause
                  </Button>
                )}
                
                <Button onClick={handleStep} disabled={isRunning} variant="outline" size="lg">
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
                  <Label htmlFor="speed">Speed</Label>
                  <span className="text-sm text-muted-foreground">
                    {speed <= 200 ? 'Fast' : speed <= 500 ? 'Medium' : 'Slow'}
                  </span>
                </div>
                <Slider
                  id="speed"
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
                  <div className="text-sm text-muted-foreground mb-1">Current State(s)</div>
                  <div className="flex gap-2 flex-wrap">
                    {currentStates.map(state => (
                      <Badge key={state} variant="default" className="font-mono">
                        {state}
                      </Badge>
                    ))}
                  </div>
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
                <h3>Transition Table</h3>
                <p className="text-sm text-muted-foreground">
                  Define state transitions
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => {
                  const newTransition: DFATransition = {
                    id: Date.now().toString(),
                    from: 'q0',
                    to: 'q0',
                    symbol: 'a'
                  };
                  setTransitions([...transitions, newTransition]);
                }}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add
              </Button>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {transitions.map(transition => (
                <TransitionEditor
                  key={transition.id}
                  transition={transition}
                  states={states}
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
              <h4 className="text-sm mb-2">States</h4>
              <div className="space-y-2">
                {states.map(state => (
                  <div key={state.id} className="flex items-center justify-between text-sm border rounded p-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono">{state.name}</span>
                      {state.isInitial && <Badge variant="outline" className="text-xs">Initial</Badge>}
                      {state.isFinal && <Badge variant="outline" className="text-xs">Final</Badge>}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2"
                        onClick={() => {
                          setStates(states.map(s => 
                            s.id === state.id ? { ...s, isFinal: !s.isFinal } : s
                          ));
                        }}
                      >
                        Toggle Final
                      </Button>
                    </div>
                  </div>
                ))}
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    const newState: DFAState = {
                      id: Date.now().toString(),
                      name: `q${states.length}`,
                      isInitial: false,
                      isFinal: false,
                      x: 150 + (states.length * 100) % 500,
                      y: 200
                    };
                    setStates([...states, newState]);
                  }}
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add State
                </Button>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="text-sm mb-2">Legend</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full border-2 border-foreground"></div>
                  <span>Regular State</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative w-6 h-6">
                    <div className="absolute inset-0 rounded-full border-2 border-foreground"></div>
                    <div className="absolute inset-1 rounded-full border-2 border-foreground"></div>
                  </div>
                  <span>Final State</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

interface TransitionEditorProps {
  transition: DFATransition;
  states: DFAState[];
  onUpdate: (transition: DFATransition) => void;
  onDelete: () => void;
}

function TransitionEditor({ transition, states, onUpdate, onDelete }: TransitionEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTransition, setEditedTransition] = useState(transition);

  if (isEditing) {
    return (
      <div className="border-2 border-primary rounded-lg p-3 text-sm bg-primary/5">
        <div className="space-y-2">
          <div className="grid grid-cols-3 gap-2">
            <div>
              <Label htmlFor={`from-${transition.id}`} className="text-xs">From</Label>
              <Select
                value={editedTransition.from}
                onValueChange={(value) => setEditedTransition({ ...editedTransition, from: value })}
              >
                <SelectTrigger id={`from-${transition.id}`} className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {states.map(state => (
                    <SelectItem key={state.id} value={state.name}>{state.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor={`symbol-${transition.id}`} className="text-xs">Symbol</Label>
              <Input
                id={`symbol-${transition.id}`}
                value={editedTransition.symbol}
                onChange={(e) => setEditedTransition({ ...editedTransition, symbol: e.target.value })}
                className="h-8 font-mono"
                placeholder="a"
              />
            </div>
            <div>
              <Label htmlFor={`to-${transition.id}`} className="text-xs">To</Label>
              <Select
                value={editedTransition.to}
                onValueChange={(value) => setEditedTransition({ ...editedTransition, to: value })}
              >
                <SelectTrigger id={`to-${transition.id}`} className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {states.map(state => (
                    <SelectItem key={state.id} value={state.name}>{state.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
    <div className="border rounded-lg p-3 text-sm hover:border-primary/50 transition-colors">
      <div className="flex items-center justify-between">
        <div className="font-mono">
          <span className="text-muted-foreground">δ(</span>
          <span className="text-primary">{transition.from}</span>
          <span className="text-muted-foreground">, </span>
          <span className="text-primary">{transition.symbol}</span>
          <span className="text-muted-foreground">) = </span>
          <span className="text-primary">{transition.to}</span>
        </div>
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0"
            onClick={() => setIsEditing(true)}
          >
            <Plus className="w-3 h-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0 text-destructive"
            onClick={onDelete}
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}
