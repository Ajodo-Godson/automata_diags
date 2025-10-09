import React from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import './stylings/DFATestCases.css';

export function DFATestCases({ onLoadTest, currentExample }) {
  const getTestCases = () => {
    if (currentExample === "ends_with_ab") {
      return [
        { input: 'ab', expected: 'Accept', shouldAccept: true },
        { input: 'aab', expected: 'Accept', shouldAccept: true },
        { input: 'bab', expected: 'Accept', shouldAccept: true },
        { input: 'aaab', expected: 'Accept', shouldAccept: true },
        { input: 'a', expected: 'Reject', shouldAccept: false },
        { input: 'b', expected: 'Reject', shouldAccept: false },
        { input: 'ba', expected: 'Reject', shouldAccept: false },
        { input: 'aba', expected: 'Reject', shouldAccept: false },
      ];
    } else if (currentExample === "contains_aa") {
      return [
        { input: 'aa', expected: 'Accept', shouldAccept: true },
        { input: 'aab', expected: 'Accept', shouldAccept: true },
        { input: 'baa', expected: 'Accept', shouldAccept: true },
        { input: 'baab', expected: 'Accept', shouldAccept: true },
        { input: 'a', expected: 'Reject', shouldAccept: false },
        { input: 'b', expected: 'Reject', shouldAccept: false },
        { input: 'ab', expected: 'Reject', shouldAccept: false },
        { input: 'aba', expected: 'Reject', shouldAccept: false },
      ];
    } else if (currentExample === "even_number_of_as") {
      return [
        { input: '', expected: 'Accept', shouldAccept: true },
        { input: 'aa', expected: 'Accept', shouldAccept: true },
        { input: 'b', expected: 'Accept', shouldAccept: true },
        { input: 'bbaabb', expected: 'Accept', shouldAccept: true },
        { input: 'a', expected: 'Reject', shouldAccept: false },
        { input: 'aaa', expected: 'Reject', shouldAccept: false },
        { input: 'ba', expected: 'Reject', shouldAccept: false },
        { input: 'aaab', expected: 'Reject', shouldAccept: false },
      ];
    } else if (currentExample === "divisible_by_3") {
      return [
        { input: '0', expected: 'Accept (0 ÷ 3)', shouldAccept: true },
        { input: '11', expected: 'Accept (3 ÷ 3)', shouldAccept: true },
        { input: '110', expected: 'Accept (6 ÷ 3)', shouldAccept: true },
        { input: '1001', expected: 'Accept (9 ÷ 3)', shouldAccept: true },
        { input: '1', expected: 'Reject (1)', shouldAccept: false },
        { input: '10', expected: 'Reject (2)', shouldAccept: false },
        { input: '100', expected: 'Reject (4)', shouldAccept: false },
        { input: '101', expected: 'Reject (5)', shouldAccept: false },
      ];
    }
    return [];
  };

  const testCases = getTestCases();

  if (testCases.length === 0) {
    return null;
  }

  return (
    <div className="dfa-test-cases-card">
      <div className="dfa-test-cases-header">
        <h3 className="dfa-test-cases-title">Example Test Cases</h3>
        <p className="dfa-test-cases-subtitle">
          Click to load and test the current DFA
        </p>
      </div>

      <div className="dfa-test-cases-list">
        {testCases.map((testCase, index) => (
          <div key={index} className="dfa-test-case-item">
            <div className="dfa-test-case-content">
              <div className="dfa-test-case-input">
                <code className="dfa-test-case-code">
                  {testCase.input || '(empty string)'}
                </code>
              </div>
              <div className="dfa-test-case-expected">
                {testCase.shouldAccept ? (
                  <CheckCircle2 className="dfa-icon-success" />
                ) : (
                  <XCircle className="dfa-icon-warning" />
                )}
                <span className={testCase.shouldAccept ? 'dfa-text-success' : 'dfa-text-warning'}>
                  {testCase.expected}
                </span>
              </div>
            </div>
            <button
              onClick={() => onLoadTest(testCase.input)}
              className="dfa-btn dfa-btn-outline dfa-btn-small"
            >
              Test
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

