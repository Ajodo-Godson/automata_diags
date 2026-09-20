import React from 'react';
import TestCaseList from '../shared/TestCaseList';

export function TMTestCases({ onLoadExample, currentExample }) {
  const getExamples = () => {
    if (currentExample === 'Write Three 1s') {
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

  return <TestCaseList testCases={examples} onLoadTest={onLoadExample} />;
}
