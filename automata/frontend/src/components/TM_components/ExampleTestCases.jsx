import React from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import './stylings/ExampleTestCases.css';

export function ExampleTestCases({ onLoadExample, currentExample }) {
  const getExamples = () => {
    if (currentExample === 'Test: Write 3 ones') {
      return [
        {
          input: '',
          description: 'Empty tape',
          expected: 'Accept → 111',
          shouldAccept: true,
        },
      ];
    } else if (currentExample === 'Binary Incrementer') {
      return [
        {
          input: '0',
          description: 'Single 0',
          expected: 'Accept → 1',
          shouldAccept: true,
        },
        {
          input: '1',
          description: 'Single 1',
          expected: 'Accept → 10',
          shouldAccept: true,
        },
        {
          input: '101',
          description: 'Binary 101',
          expected: 'Accept → 110',
          shouldAccept: true,
        },
        {
          input: '111',
          description: 'Binary 111',
          expected: 'Accept → 1000',
          shouldAccept: true,
        },
      ];
    } else if (currentExample === 'Palindrome Checker') {
      return [
        {
          input: '0',
          description: 'Single 0',
          expected: 'Accept',
          shouldAccept: true,
        },
        {
          input: '101',
          description: 'Palindrome',
          expected: 'Accept',
          shouldAccept: true,
        },
        {
          input: '0110',
          description: 'Palindrome',
          expected: 'Accept',
          shouldAccept: true,
        },
        {
          input: '011',
          description: 'Not palindrome',
          expected: 'Reject',
          shouldAccept: false,
        },
      ];
    } else if (currentExample === '0^n 1^n') {
      return [
        {
          input: '01',
          description: 'One 0, one 1',
          expected: 'Accept',
          shouldAccept: true,
        },
        {
          input: '0011',
          description: 'Two 0s, two 1s',
          expected: 'Accept',
          shouldAccept: true,
        },
        {
          input: '0101',
          description: 'Interleaved',
          expected: 'Reject',
          shouldAccept: false,
        },
        {
          input: '001',
          description: 'Unequal',
          expected: 'Reject',
          shouldAccept: false,
        },
      ];
    } else if (currentExample === 'Busy Beaver (3-state)') {
      return [
        {
          input: '',
          description: 'Empty tape (non-halting)',
          expected: 'Runs indefinitely (may timeout)',
          shouldAccept: false, // Non-halting machine - will timeout, not accept
        },
      ];
    } else if (currentExample === 'Copy Machine') {
      return [
        {
          input: '0',
          description: 'Copy single 0',
          expected: 'Accept → 00',
          shouldAccept: true,
        },
        {
          input: '1',
          description: 'Copy single 1',
          expected: 'Accept → 11',
          shouldAccept: true,
        },
        {
          input: '101',
          description: 'Copy 101',
          expected: 'Accept → 101101',
          shouldAccept: true,
        },
        {
          input: '10',
          description: 'Copy 10',
          expected: 'Accept → 1010',
          shouldAccept: true,
        },
      ];
    } else if (currentExample === 'Unary Addition') {
      return [
        {
          input: '1+1',
          description: '1 + 1',
          expected: 'Accept → 11',
          shouldAccept: true,
        },
        {
          input: '111+11',
          description: '3 + 2',
          expected: 'Accept → 11111',
          shouldAccept: true,
        },
        {
          input: '11+111',
          description: '2 + 3',
          expected: 'Accept → 11111',
          shouldAccept: true,
        },
      ];
    } else if (currentExample === 'Unary Doubling') {
      return [
        {
          input: '1',
          description: '1 → 2',
          expected: 'Accept → 11',
          shouldAccept: true,
        },
        {
          input: '11',
          description: '2 → 4',
          expected: 'Accept → 1111',
          shouldAccept: true,
        },
        {
          input: '111',
          description: '3 → 6',
          expected: 'Accept → 111111',
          shouldAccept: true,
        },
      ];
    } else if (currentExample === 'String Reversal') {
      return [
        {
          input: 'a',
          description: 'Single char',
          expected: 'Accept → a',
          shouldAccept: true,
        },
        {
          input: 'ab',
          description: 'Two chars',
          expected: 'Accept → ba',
          shouldAccept: true,
        },
        {
          input: 'abc',
          description: 'Three chars',
          expected: 'Accept → cba',
          shouldAccept: true,
        },
        {
          input: 'abca',
          description: 'Four chars',
          expected: 'Accept → acba',
          shouldAccept: true,
        },
        {
          input: 'abcba',
          description: 'Palindrome',
          expected: 'Accept → abcba',
          shouldAccept: true,
        },
      ];
    } else if (currentExample === 'Unary Multiplication') {
      return [
        {
          input: '1*1',
          description: '1 × 1',
          expected: 'Accept → 1',
          shouldAccept: true,
        },
        {
          input: '11*1',
          description: '2 × 1',
          expected: 'Accept → 11',
          shouldAccept: true,
        },
        {
          input: '1*11',
          description: '1 × 2',
          expected: 'Accept → 11',
          shouldAccept: true,
        },
        {
          input: '11*11',
          description: '2 × 2',
          expected: 'Accept → 1111',
          shouldAccept: true,
        },
        {
          input: '11*111',
          description: '2 × 3',
          expected: 'Accept → 111111',
          shouldAccept: true,
        },
        {
          input: '111*11',
          description: '3 × 2',
          expected: 'Accept → 111111',
          shouldAccept: true,
        },
      ];
    }
    return [];
  };

  const examples = getExamples();

  if (examples.length === 0) {
    return null;
  }

  return (
    <div className="examples-card">
      <div className="examples-header">
        <h3 className="tm-card-title">🧪 Example Test Cases</h3>
        <p className="examples-subtitle">
          Click to load and test the current machine
        </p>
      </div>

      <div className="examples-list">
        {examples.map((example, index) => (
          <div key={index} className="example-item">
            <div className="example-content">
              <div className="example-input">
                <code className="example-code">{example.input}</code>
                <span className="example-description">({example.description})</span>
              </div>
              <div className="example-expected">
                {example.shouldAccept ? (
                  <CheckCircle2 className="icon-success" />
                ) : (
                  <XCircle className="icon-warning" />
                )}
                <span className={example.shouldAccept ? 'text-success' : 'text-warning'}>
                  {example.expected}
                </span>
              </div>
            </div>
            <button
              onClick={() => onLoadExample(example.input)}
              className="btn btn-outline btn-small"
            >
              Load
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}








