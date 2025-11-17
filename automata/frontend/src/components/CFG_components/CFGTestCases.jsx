import React from 'react';

export const CFGTestCases = ({ onLoadTest, currentExample }) => {
    const testCases = {
        balanced_parentheses: [
            { input: '()', expected: 'Accept' },
            { input: '(())', expected: 'Accept' },
            { input: '((()))', expected: 'Accept' },
            { input: '(', expected: 'Reject' },
            { input: ')', expected: 'Reject' },
            { input: '(()', expected: 'Reject' },
            { input: '())', expected: 'Reject' },
            { input: '', expected: 'Accept' }
        ],
        simple_arithmetic: [
            { input: 'a', expected: 'Accept' },
            { input: 'a+a', expected: 'Accept' },
            { input: 'a*a', expected: 'Accept' },
            { input: '(a+a)', expected: 'Accept' },
            { input: 'a+a*a', expected: 'Accept' },
            { input: '+a', expected: 'Reject' },
            { input: 'a+', expected: 'Reject' },
            { input: 'aa', expected: 'Reject' }
        ],
        equal_as_bs: [
            { input: 'ab', expected: 'Accept' },
            { input: 'aabb', expected: 'Accept' },
            { input: 'aaabbb', expected: 'Accept' },
            { input: 'abab', expected: 'Accept' },
            { input: 'a', expected: 'Reject' },
            { input: 'b', expected: 'Reject' },
            { input: 'aab', expected: 'Reject' },
            { input: 'abb', expected: 'Reject' }
        ],
        an_bn: [
            { input: '', expected: 'Accept' },
            { input: 'ab', expected: 'Accept' },
            { input: 'aabb', expected: 'Accept' },
            { input: 'aaabbb', expected: 'Accept' },
            { input: 'a', expected: 'Reject' },
            { input: 'b', expected: 'Reject' },
            { input: 'abab', expected: 'Reject' },
            { input: 'aab', expected: 'Reject' }
        ],
        palindrome: [
            { input: '', expected: 'Accept' },
            { input: 'a', expected: 'Accept' },
            { input: 'b', expected: 'Accept' },
            { input: 'aa', expected: 'Accept' },
            { input: 'bb', expected: 'Accept' },
            { input: 'aba', expected: 'Accept' },
            { input: 'ab', expected: 'Reject' },
            { input: 'ba', expected: 'Reject' }
        ],
        arithmetic_with_subtraction: [
            { input: 'a', expected: 'Accept' },
            { input: 'a+a', expected: 'Accept' },
            { input: 'a-a', expected: 'Accept' },
            { input: 'a*a', expected: 'Accept' },
            { input: '(a-a)', expected: 'Accept' },
            { input: 'a+a-a', expected: 'Accept' },
            { input: '+a', expected: 'Reject' },
            { input: 'a+', expected: 'Reject' }
        ],
        if_then_else: [
            { input: 'if a then a else a', expected: 'Accept' },
            { input: 'if b then b else b', expected: 'Accept' },
            { input: 'if a then if b then a else b else a', expected: 'Accept' },
            { input: 'a', expected: 'Accept' },
            { input: 'b', expected: 'Accept' },
            { input: 'if a', expected: 'Reject' },
            { input: 'then a', expected: 'Reject' },
            { input: 'if a then a', expected: 'Reject' }
        ],
        double_letters: [
            { input: '', expected: 'Accept' },
            { input: 'aa', expected: 'Accept' },
            { input: 'bb', expected: 'Accept' },
            { input: 'aabb', expected: 'Accept' },
            { input: 'bbaa', expected: 'Accept' },
            { input: 'a', expected: 'Reject' },
            { input: 'b', expected: 'Reject' },
            { input: 'ab', expected: 'Reject' }
        ],
        ww: [
            { input: 'aa', expected: 'Accept' },
            { input: 'bb', expected: 'Accept' },
            { input: 'abab', expected: 'Accept' },
            { input: 'baba', expected: 'Accept' },
            { input: 'a', expected: 'Reject' },
            { input: 'b', expected: 'Reject' },
            { input: 'ab', expected: 'Reject' },
            { input: 'ba', expected: 'Reject' }
        ]
    };

    const currentTestCases = testCases[currentExample] || [];

    return (
        <div className="cfg-test-cases">
            <h3 className="cfg-card-title">Test Cases</h3>
            <div className="cfg-test-list">
                {currentTestCases.map((testCase, index) => (
                    <div key={index} className="cfg-test-item">
                        <button
                            onClick={() => onLoadTest(testCase.input)}
                            className="cfg-test-btn"
                        >
                            <code className="cfg-test-input">
                                "{testCase.input || 'ε'}"
                            </code>
                        </button>
                        <span className={`cfg-test-expected ${testCase.expected.toLowerCase()}`}>
                            {testCase.expected}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};