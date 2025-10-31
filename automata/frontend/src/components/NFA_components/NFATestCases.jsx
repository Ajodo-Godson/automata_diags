import React, { useState } from 'react';
import { CheckCircle2, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import '../DFA_components/stylings/DFATestCases.css';

export const NFATestCases = ({ nfa, onTestString, currentExample }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const getTestCases = () => {
    // Prefer example-specific test cases when available
    if (currentExample === 'basic_nfa') {
      return [
        { input: 'ab', expected: 'Accept', shouldAccept: true },
        { input: 'aab', expected: 'Accept', shouldAccept: true },
        { input: 'bab', expected: 'Accept', shouldAccept: true },
        { input: 'aaab', expected: 'Accept', shouldAccept: true },
        { input: 'a', expected: 'Reject', shouldAccept: false },
        { input: 'b', expected: 'Reject', shouldAccept: false },
      ];
    }

    if (currentExample === 'epsilon_nfa') {
      return [
        { input: '', expected: 'Accept (via ε)', shouldAccept: true },
        { input: 'a', expected: 'Accept', shouldAccept: true },
        { input: 'b', expected: 'Accept', shouldAccept: true },
        { input: 'ab', expected: 'Reject', shouldAccept: false },
      ];
    }

    if (currentExample === 'or_nfa') {
      return [
        { input: 'aa', expected: 'Accept', shouldAccept: true },
        { input: 'bb', expected: 'Accept', shouldAccept: true },
        { input: 'aab', expected: 'Reject', shouldAccept: false },
        { input: 'bba', expected: 'Reject', shouldAccept: false },
      ];
    }

    // Generic fallback
    return [
      { input: 'ab', expected: 'Accept', shouldAccept: true },
      { input: 'ba', expected: 'Reject', shouldAccept: false },
    ];
  };

  const testCases = getTestCases();

  if (!testCases || testCases.length === 0) return null;

  return (
    <div className="dfa-test-cases-card">
      <div
        className="dfa-test-cases-header"
        onClick={() => setIsCollapsed(!isCollapsed)}
        style={{ cursor: 'pointer' }}
      >
        <div className="dfa-test-cases-header-content">
          <div>
            <h3 className="dfa-test-cases-title">Example Test Cases</h3>
            <p className="dfa-test-cases-subtitle">Click to load and test the current NFA</p>
          </div>
          <button className="dfa-collapse-btn">
            {isCollapsed ? <ChevronDown className="dfa-collapse-icon" /> : <ChevronUp className="dfa-collapse-icon" />}
          </button>
        </div>
      </div>

      <div className={`dfa-test-cases-list ${isCollapsed ? 'collapsed' : ''}`}>
        {testCases.map((testCase, idx) => (
          <div key={idx} className="dfa-test-case-item">
            <div className="dfa-test-case-content">
              <div className="dfa-test-case-input">
                <code className="dfa-test-case-code">{testCase.input || '(empty string)'}</code>
              </div>
              <div className="dfa-test-case-expected">
                {testCase.shouldAccept ? <CheckCircle2 className="dfa-icon-success" /> : <XCircle className="dfa-icon-warning" />}
                <span className={testCase.shouldAccept ? 'dfa-text-success' : 'dfa-text-warning'}>{testCase.expected}</span>
              </div>
            </div>
            <button
              onClick={() => onTestString(testCase.input)}
              className="dfa-btn dfa-btn-outline dfa-btn-small"
            >
              Test
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

