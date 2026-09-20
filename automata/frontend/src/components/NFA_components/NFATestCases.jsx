import React from 'react';
import TestCaseList from '../shared/TestCaseList';

export const NFATestCases = ({ onLoadTest, currentExample }) => {

  const getTestCases = () => {
    if (currentExample === 'lexer_digits_plus') {
      return [
        { input: '42', expected: 'Accept', shouldAccept: true },
        { input: '0', expected: 'Accept', shouldAccept: true },
        { input: '9876543210', expected: 'Accept', shouldAccept: true },
        { input: '', expected: 'Reject', shouldAccept: false },
        { input: '42a', expected: 'Reject', shouldAccept: false },
      ];
    }
    if (currentExample === 'lexer_digit_once') {
      return [
        { input: '7', expected: 'Accept', shouldAccept: true },
        { input: '42', expected: 'Reject', shouldAccept: false },
        { input: '', expected: 'Reject', shouldAccept: false },
      ];
    }
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

    if (currentExample === 'contains_aa') {
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
    }

    if (currentExample === 'epsilon_nfa') {
      return [
        { input: '', expected: 'Accept (via ε)', shouldAccept: true },
        { input: 'a', expected: 'Accept', shouldAccept: true },
        { input: 'b', expected: 'Accept', shouldAccept: true },
        { input: 'ab', expected: 'Reject', shouldAccept: false },
      ];
    }

    if (currentExample === 'starts_with_a') {
      return [
        { input: 'a', expected: 'Accept', shouldAccept: true },
        { input: 'ab', expected: 'Accept', shouldAccept: true },
        { input: 'aa', expected: 'Accept', shouldAccept: true },
        { input: 'abb', expected: 'Accept', shouldAccept: true },
        { input: 'b', expected: 'Reject', shouldAccept: false },
        { input: 'ba', expected: 'Reject', shouldAccept: false },
        { input: '', expected: 'Reject', shouldAccept: false },
      ];
    }

    if (currentExample === 'contains_ab_or_ba') {
      return [
        { input: 'ab', expected: 'Accept', shouldAccept: true },
        { input: 'ba', expected: 'Accept', shouldAccept: true },
        { input: 'aab', expected: 'Accept', shouldAccept: true },
        { input: 'bba', expected: 'Accept', shouldAccept: true },
        { input: 'aa', expected: 'Reject', shouldAccept: false },
        { input: 'bb', expected: 'Reject', shouldAccept: false },
        { input: 'a', expected: 'Reject', shouldAccept: false },
        { input: 'b', expected: 'Reject', shouldAccept: false },
      ];
    }

    if (currentExample === 'a_then_b') {
      return [
        { input: 'ab', expected: 'Accept', shouldAccept: true },
        { input: 'aab', expected: 'Accept', shouldAccept: true },
        { input: 'abb', expected: 'Accept', shouldAccept: true },
        { input: 'aabb', expected: 'Accept', shouldAccept: true },
        { input: 'a', expected: 'Reject', shouldAccept: false },
        { input: 'b', expected: 'Reject', shouldAccept: false },
        { input: 'ba', expected: 'Reject', shouldAccept: false },
        { input: 'aa', expected: 'Reject', shouldAccept: false },
      ];
    }

    if (currentExample === 'third_symbol_a') {
      return [
        { input: 'aba', expected: 'Accept', shouldAccept: true },
        { input: 'bba', expected: 'Accept', shouldAccept: true },
        { input: 'aaa', expected: 'Accept', shouldAccept: true },
        { input: 'baa', expected: 'Accept', shouldAccept: true },
        { input: 'aab', expected: 'Reject', shouldAccept: false },
        { input: 'abb', expected: 'Reject', shouldAccept: false },
        { input: 'ab', expected: 'Reject', shouldAccept: false },
        { input: 'a', expected: 'Reject', shouldAccept: false },
      ];
    }

    if (currentExample === 'ends_with_aa_or_bb') {
      return [
        { input: 'aa', expected: 'Accept', shouldAccept: true },
        { input: 'bb', expected: 'Accept', shouldAccept: true },
        { input: 'baa', expected: 'Accept', shouldAccept: true },
        { input: 'abb', expected: 'Accept', shouldAccept: true },
        { input: 'ab', expected: 'Reject', shouldAccept: false },
        { input: 'ba', expected: 'Reject', shouldAccept: false },
        { input: 'a', expected: 'Reject', shouldAccept: false },
        { input: 'b', expected: 'Reject', shouldAccept: false },
      ];
    }

    if (currentExample === 'odd_length') {
      return [
        { input: 'a', expected: 'Accept', shouldAccept: true },
        { input: 'b', expected: 'Accept', shouldAccept: true },
        { input: 'aba', expected: 'Accept', shouldAccept: true },
        { input: 'bbb', expected: 'Accept', shouldAccept: true },
        { input: '', expected: 'Reject', shouldAccept: false },
        { input: 'ab', expected: 'Reject', shouldAccept: false },
        { input: 'aa', expected: 'Reject', shouldAccept: false },
        { input: 'abab', expected: 'Reject', shouldAccept: false },
      ];
    }

    // Generic fallback
    return [
      { input: 'ab', expected: 'Accept', shouldAccept: true },
      { input: 'ba', expected: 'Reject', shouldAccept: false },
    ];
  };

  const testCases = getTestCases();


    return <TestCaseList testCases={testCases} onLoadTest={onLoadTest} />;
};
