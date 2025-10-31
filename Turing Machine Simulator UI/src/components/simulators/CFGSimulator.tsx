import { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Play, RotateCcw, Plus, Trash2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Production {
  id: string;
  left: string;
  right: string;
}

interface DerivationStep {
  step: number;
  string: string;
  production: string;
  highlightStart?: number;
  highlightEnd?: number;
}

export function CFGSimulator() {
  const [productions, setProductions] = useState<Production[]>([
    { id: '1', left: 'S', right: 'aSb' },
    { id: '2', left: 'S', right: 'ab' },
    { id: '3', left: 'S', right: 'ε' },
  ]);

  const [startSymbol, setStartSymbol] = useState('S');
  const [targetString, setTargetString] = useState('aaabbb');
  const [derivation, setDerivation] = useState<DerivationStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);

  const [newProduction, setNewProduction] = useState({ left: '', right: '' });

  const addProduction = () => {
    if (!newProduction.left || !newProduction.right) return;

    const production: Production = {
      id: Date.now().toString(),
      left: newProduction.left,
      right: newProduction.right,
    };

    setProductions([...productions, production]);
    setNewProduction({ left: '', right: '' });
  };

  const deleteProduction = (id: string) => {
    setProductions(productions.filter(p => p.id !== id));
  };

  // Simple leftmost derivation generator
  const generateDerivation = () => {
    setIsGenerating(true);
    const steps: DerivationStep[] = [
      { step: 0, string: startSymbol, production: 'Start' }
    ];

    let current = startSymbol;
    let stepNum = 1;
    const maxSteps = 20;

    // Simple derivation strategy (not a complete parser)
    while (stepNum < maxSteps) {
      // Find leftmost non-terminal
      let leftmostNonTerminal = '';
      let position = -1;

      for (let i = 0; i < current.length; i++) {
        if (current[i] === current[i].toUpperCase() && current[i] !== 'ε') {
          leftmostNonTerminal = current[i];
          position = i;
          break;
        }
      }

      if (leftmostNonTerminal === '') {
        // No more non-terminals
        break;
      }

      // Find applicable productions
      const applicableProductions = productions.filter(
        p => p.left === leftmostNonTerminal
      );

      if (applicableProductions.length === 0) break;

      // Choose production (prefer productions that help reach target)
      let chosenProduction = applicableProductions[0];
      
      // Simple heuristic: if target has more characters, prefer longer productions
      if (targetString.length > current.replace(/[A-Z]/g, '').length) {
        const longestProd = applicableProductions.reduce((prev, curr) => 
          curr.right.length > prev.right.length ? curr : prev
        );
        chosenProduction = longestProd;
      }

      // Apply production
      const replacement = chosenProduction.right === 'ε' ? '' : chosenProduction.right;
      const newString = 
        current.substring(0, position) + 
        replacement + 
        current.substring(position + 1);

      steps.push({
        step: stepNum,
        string: newString,
        production: `${chosenProduction.left} → ${chosenProduction.right}`,
        highlightStart: position,
        highlightEnd: position + replacement.length
      });

      current = newString;
      stepNum++;

      // Check if we reached target
      if (current === targetString) {
        break;
      }
    }

    setDerivation(steps);
    setCurrentStep(0);
    setIsGenerating(false);
  };

  const reset = () => {
    setDerivation([]);
    setCurrentStep(0);
  };

  // Parse tree node structure
  interface TreeNode {
    value: string;
    children: TreeNode[];
    x: number;
    y: number;
  }

  const buildParseTree = (): TreeNode | null => {
    if (derivation.length === 0) return null;

    // Simplified tree building (just for visualization)
    const root: TreeNode = {
      value: startSymbol,
      children: [],
      x: 400,
      y: 50
    };

    // For demo purposes, create a simple tree structure
    if (derivation.length > 1) {
      const step1 = derivation[1];
      const chars = step1.string.split('');
      
      const spacing = 80;
      const startX = 400 - (chars.length * spacing) / 2;

      root.children = chars.map((char, i) => ({
        value: char,
        children: [],
        x: startX + i * spacing,
        y: 150
      }));
    }

    return root;
  };

  const renderTree = (node: TreeNode, parentX?: number, parentY?: number): JSX.Element => {
    return (
      <g key={`${node.x}-${node.y}-${node.value}`}>
        {/* Draw line to parent */}
        {parentX !== undefined && parentY !== undefined && (
          <line
            x1={parentX}
            y1={parentY}
            x2={node.x}
            y2={node.y}
            stroke="hsl(var(--border))"
            strokeWidth="2"
          />
        )}

        {/* Draw node */}
        <circle
          cx={node.x}
          cy={node.y}
          r="25"
          fill="hsl(var(--card))"
          stroke="hsl(var(--primary))"
          strokeWidth="2"
        />
        <text
          x={node.x}
          y={node.y + 5}
          textAnchor="middle"
          className="fill-foreground font-mono"
        >
          {node.value}
        </text>

        {/* Render children */}
        {node.children.map(child => renderTree(child, node.x, node.y))}
      </g>
    );
  };

  const tree = buildParseTree();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left: Derivation & Parse Tree */}
      <div className="lg:col-span-2 space-y-6">
        {/* Parse Tree */}
        <Card className="p-6">
          <div className="space-y-4">
            <div>
              <h3>Parse Tree Visualization</h3>
              <p className="text-sm text-muted-foreground">
                Graphical representation of the derivation
              </p>
            </div>

            <div className="relative bg-muted/30 rounded-lg border-2 border-border" style={{ height: '300px' }}>
              {tree ? (
                <svg className="w-full h-full">
                  {renderTree(tree)}
                </svg>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Click "Generate Derivation" to see the parse tree
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Derivation Steps */}
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3>Derivation Steps</h3>
                <p className="text-sm text-muted-foreground">
                  Leftmost derivation sequence
                </p>
              </div>
              <div className="flex gap-2">
                <Button onClick={generateDerivation} disabled={isGenerating}>
                  <Play className="w-4 h-4 mr-2" />
                  Generate Derivation
                </Button>
                <Button onClick={reset} variant="outline">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="target-string">Target String</Label>
              <Input
                id="target-string"
                value={targetString}
                onChange={(e) => setTargetString(e.target.value)}
                placeholder="e.g., aaabbb"
                className="font-mono mt-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                The string you want to derive from the grammar
              </p>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              <AnimatePresence>
                {derivation.map((step, index) => (
                  <motion.div
                    key={step.step}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border rounded-lg p-4 bg-card"
                  >
                    <div className="flex items-start gap-4">
                      <Badge variant="outline" className="shrink-0">
                        Step {step.step}
                      </Badge>
                      <div className="flex-1">
                        <div className="font-mono text-lg mb-2">
                          {step.string.split('').map((char, i) => (
                            <span
                              key={i}
                              className={
                                step.highlightStart !== undefined &&
                                i >= step.highlightStart &&
                                i < (step.highlightEnd || step.highlightStart + 1)
                                  ? 'text-primary bg-primary/10 px-1 rounded'
                                  : ''
                              }
                            >
                              {char}
                            </span>
                          ))}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Applied: {step.production}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {derivation.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No derivation generated yet
                </div>
              )}

              {derivation.length > 0 && (
                <div className="border-t pt-4 mt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Final string:</span>
                    <code className="font-mono text-lg">
                      {derivation[derivation.length - 1].string}
                    </code>
                  </div>
                  {derivation[derivation.length - 1].string === targetString ? (
                    <div className="mt-2 bg-green-500 text-white rounded-lg p-3 text-center">
                      ✓ Successfully derived target string!
                    </div>
                  ) : (
                    <div className="mt-2 bg-yellow-500 text-white rounded-lg p-3 text-center">
                      ⚠ Did not reach target string
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Grammar Info */}
        <Card className="p-6">
          <div className="space-y-4">
            <div>
              <h3>Grammar Information</h3>
              <p className="text-sm text-muted-foreground">
                Context-Free Grammar (CFG) notation
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <Label className="w-32">Start Symbol:</Label>
                <Input
                  value={startSymbol}
                  onChange={(e) => setStartSymbol(e.target.value)}
                  className="font-mono w-24"
                  maxLength={1}
                />
              </div>

              <div className="text-sm text-muted-foreground space-y-1">
                <p><strong>Non-terminals:</strong> Uppercase letters (A, B, S, etc.)</p>
                <p><strong>Terminals:</strong> Lowercase letters and symbols</p>
                <p><strong>ε:</strong> Epsilon (empty string)</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Right: Production Rules */}
      <div className="lg:col-span-1">
        <Card className="p-6">
          <div className="space-y-4">
            <div>
              <h3>Production Rules</h3>
              <p className="text-sm text-muted-foreground">
                Define grammar productions
              </p>
            </div>

            {/* Add new production */}
            <div className="border-2 border-primary/30 rounded-lg p-4 bg-primary/5">
              <Label className="text-xs mb-2 block">Add New Production</Label>
              <div className="flex items-center gap-2 mb-2">
                <Input
                  value={newProduction.left}
                  onChange={(e) => setNewProduction({ ...newProduction, left: e.target.value })}
                  placeholder="S"
                  className="font-mono w-16"
                  maxLength={1}
                />
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
                <Input
                  value={newProduction.right}
                  onChange={(e) => setNewProduction({ ...newProduction, right: e.target.value })}
                  placeholder="aSb"
                  className="font-mono flex-1"
                />
              </div>
              <Button onClick={addProduction} size="sm" className="w-full">
                <Plus className="w-3 h-3 mr-1" />
                Add Production
              </Button>
            </div>

            {/* Production list */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {productions.map((production) => (
                <div
                  key={production.id}
                  className="border rounded-lg p-3 bg-card hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-mono flex items-center gap-2">
                      <span className="text-primary">{production.left}</span>
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                      <span>{production.right}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteProduction(production.id)}
                      className="h-8 w-8 p-0 text-destructive"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {productions.length === 0 && (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No productions defined yet
              </div>
            )}

            {/* Example grammars */}
            <div className="border-t pt-4">
              <h4 className="text-sm mb-2">Example Grammars</h4>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-left justify-start"
                  onClick={() => {
                    setProductions([
                      { id: '1', left: 'S', right: 'aSb' },
                      { id: '2', left: 'S', right: 'ab' },
                      { id: '3', left: 'S', right: 'ε' },
                    ]);
                    setStartSymbol('S');
                    setTargetString('aaabbb');
                    reset();
                  }}
                >
                  <div className="text-xs">
                    <div>a<sup>n</sup>b<sup>n</sup></div>
                    <div className="text-muted-foreground">Balanced strings</div>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-left justify-start"
                  onClick={() => {
                    setProductions([
                      { id: '1', left: 'S', right: 'aSa' },
                      { id: '2', left: 'S', right: 'bSb' },
                      { id: '3', left: 'S', right: 'a' },
                      { id: '4', left: 'S', right: 'b' },
                      { id: '5', left: 'S', right: 'ε' },
                    ]);
                    setStartSymbol('S');
                    setTargetString('ababa');
                    reset();
                  }}
                >
                  <div className="text-xs">
                    <div>Palindromes</div>
                    <div className="text-muted-foreground">Symmetric strings</div>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-left justify-start"
                  onClick={() => {
                    setProductions([
                      { id: '1', left: 'E', right: 'E+T' },
                      { id: '2', left: 'E', right: 'T' },
                      { id: '3', left: 'T', right: 'T*F' },
                      { id: '4', left: 'T', right: 'F' },
                      { id: '5', left: 'F', right: '(E)' },
                      { id: '6', left: 'F', right: 'id' },
                    ]);
                    setStartSymbol('E');
                    setTargetString('id+id*id');
                    reset();
                  }}
                >
                  <div className="text-xs">
                    <div>Arithmetic Expressions</div>
                    <div className="text-muted-foreground">With precedence</div>
                  </div>
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
