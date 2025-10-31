import { Card } from './ui/card';
import { Button } from './ui/button';
import { CheckCircle2, XCircle } from 'lucide-react';

interface ExampleTestCasesProps {
  onLoadExample: (input: string) => void;
}

export function ExampleTestCases({ onLoadExample }: ExampleTestCasesProps) {
  const examples = [
    {
      input: '#110000',
      description: '2 ones, 4 zeros',
      expected: 'Accept',
      shouldAccept: true,
      explanation: 'Ratio is correct (4 = 2 × 2)'
    },
    {
      input: '#1000',
      description: '1 one, 3 zeros',
      expected: 'Accept',
      shouldAccept: true,
      explanation: 'Ratio is correct (3 > 2 × 1, but will consume 1:2)'
    },
    {
      input: '#1100',
      description: '2 ones, 2 zeros',
      expected: 'Reject',
      shouldAccept: false,
      explanation: 'Not enough zeros (need 4, have 2)'
    },
    {
      input: '#100',
      description: '1 one, 2 zeros',
      expected: 'Accept',
      shouldAccept: true,
      explanation: 'Exact ratio (2 = 2 × 1)'
    },
    {
      input: '#10',
      description: '1 one, 1 zero',
      expected: 'Reject',
      shouldAccept: false,
      explanation: 'Not enough zeros (need 2, have 1)'
    },
  ];

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div>
          <h3>Example Test Cases</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Click to load and test. This machine checks if #0s ≥ 2 × #1s
          </p>
        </div>

        <div className="space-y-2">
          {examples.map((example, index) => (
            <div
              key={index}
              className="border rounded-lg p-3 hover:border-primary/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <code className="bg-muted px-2 py-1 rounded text-sm font-mono">
                      {example.input}
                    </code>
                    <span className="text-xs text-muted-foreground">
                      ({example.description})
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {example.explanation}
                  </p>
                  <div className="flex items-center gap-2">
                    {example.shouldAccept ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-yellow-500" />
                    )}
                    <span className="text-sm">
                      Expected: <span className={example.shouldAccept ? 'text-green-600' : 'text-yellow-600'}>
                        {example.expected}
                      </span>
                    </span>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onLoadExample(example.input)}
                >
                  Load
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t pt-4 mt-4">
          <h4 className="text-sm mb-2">Algorithm Overview:</h4>
          <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
            <li>Start from # (beginning marker)</li>
            <li>Find a '1', change to 'x'</li>
            <li>Find first '0', change to 'y'</li>
            <li>Find second '0', change to 'z'</li>
            <li>Return to # and repeat</li>
            <li>When no more '1's: check if only x, y, z remain</li>
            <li>Accept if valid, reject if any 0 or 1 remains</li>
          </ol>
        </div>
      </div>
    </Card>
  );
}
