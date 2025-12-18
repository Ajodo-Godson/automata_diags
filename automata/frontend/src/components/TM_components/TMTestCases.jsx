import React from 'react';
import './stylings/TMTestCases.css';

export function TMTestCases({ onLoadExample, currentExample }) {
  const getExamples = () => {
    if (currentExample === 'Test: Write 3 ones') {
      return [
        { input: '', expected: 'Accept' },
      ];
    } else if (currentExample === 'Binary Incrementer') {
      return [
        { input: '0', expected: 'Accept' },
        { input: '1', expected: 'Accept' },
        { input: '101', expected: 'Accept' },
        { input: '111', expected: 'Accept' },
      ];
    } else if (currentExample === 'Palindrome Checker') {
      return [
        { input: '0', expected: 'Accept' },
        { input: '101', expected: 'Accept' },
        { input: '0110', expected: 'Accept' },
        { input: '011', expected: 'Reject' },
      ];
    } else if (currentExample === '0^n 1^n') {
      return [
        { input: '01', expected: 'Accept' },
        { input: '0011', expected: 'Accept' },
        { input: '0101', expected: 'Reject' },
        { input: '001', expected: 'Reject' },
      ];
    } else if (currentExample === 'Busy Beaver (3-state)') {
      return [
        { input: '', expected: 'Reject' },
      ];
    } else if (currentExample === 'Copy Machine') {
      return [
        { input: '0', expected: 'Accept' },
        { input: '1', expected: 'Accept' },
        { input: '101', expected: 'Accept' },
        { input: '10', expected: 'Accept' },
      ];
    } else if (currentExample === 'Unary Addition') {
      return [
        { input: '1+1', expected: 'Accept' },
        { input: '111+11', expected: 'Accept' },
        { input: '11+111', expected: 'Accept' },
      ];
    } else if (currentExample === 'Unary Doubling') {
      return [
        { input: '1', expected: 'Accept' },
        { input: '11', expected: 'Accept' },
        { input: '111', expected: 'Accept' },
      ];
    } else if (currentExample === 'String Reversal') {
      return [
        { input: 'a', expected: 'Accept' },
        { input: 'ab', expected: 'Accept' },
        { input: 'abc', expected: 'Accept' },
        { input: 'abca', expected: 'Accept' },
        { input: 'abcba', expected: 'Accept' },
      ];
    } else if (currentExample === 'Unary Multiplication') {
      return [
        { input: '1*1', expected: 'Accept' },
        { input: '11*1', expected: 'Accept' },
        { input: '1*11', expected: 'Accept' },
        { input: '11*11', expected: 'Accept' },
        { input: '11*111', expected: 'Accept' },
        { input: '111*11', expected: 'Accept' },
      ];
    }
    return [];
  };

  const examples = getExamples();

  if (examples.length === 0) {
    return null;
  }

  return (
    <div className="tm-test-list-container">
      <h3 className="tm-card-title">Test Cases</h3>
      <div className="tm-test-list">
        {examples.map((example, index) => (
          <div key={index} className="tm-test-item">
            <button
              onClick={() => onLoadExample(example.input)}
              className="tm-test-btn"
            >
              <code className="tm-test-input">"{example.input || '(empty)'}"</code>
            </button>
            <span className={`tm-test-expected ${example.expected.toLowerCase()}`}>
              {example.expected}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
