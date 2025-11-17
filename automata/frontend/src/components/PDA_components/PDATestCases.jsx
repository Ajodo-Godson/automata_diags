import React from 'react';

export const PDATestCases = ({ onLoadTest, currentExample }) => {
    const testCases = {
        balanced_parentheses: [
            { input: '()', expected: 'Accept' },
            { input: '(())', expected: 'Accept' },
            { input: '((()))', expected: 'Accept' },
            { input: '(', expected: 'Reject' },
            { input: ')', expected: 'Reject' },
            { input: '(()', expected: 'Reject' },
            { input: '())', expected: 'Reject' }
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
            { input: 'ab', expected: 'Accept' },
            { input: 'aabb', expected: 'Accept' },
            { input: 'aaabbb', expected: 'Accept' },
            { input: 'aaaabbbb', expected: 'Accept' },
            { input: 'a', expected: 'Reject' },
            { input: 'b', expected: 'Reject' },
            { input: 'abab', expected: 'Reject' },
            { input: 'aab', expected: 'Reject' }
        ],
        palindrome_ab: [
            { input: '', expected: 'Accept' },
            { input: 'a', expected: 'Accept' },
            { input: 'b', expected: 'Accept' },
            { input: 'aa', expected: 'Accept' },
            { input: 'bb', expected: 'Accept' },
            { input: 'aba', expected: 'Accept' },
            { input: 'abba', expected: 'Accept' },
            { input: 'ab', expected: 'Reject' },
            { input: 'ba', expected: 'Reject' },
            { input: 'abab', expected: 'Reject' },
            { input: 'baba', expected: 'Reject' }
        ],
        balanced_brackets: [
            { input: '()', expected: 'Accept' },
            { input: '[]', expected: 'Accept' },
            { input: '{}', expected: 'Accept' },
            { input: '([{}])', expected: 'Accept' },
            { input: '({[]})', expected: 'Accept' },
            { input: '(', expected: 'Reject' },
            { input: '[)', expected: 'Reject' },
            { input: '([)]', expected: 'Reject' }
        ],
        an_bm_cn_plus_m: [
            { input: 'abc', expected: 'Accept' },
            { input: 'aabbcc', expected: 'Accept' },
            { input: 'abcc', expected: 'Accept' },
            { input: 'aabccc', expected: 'Accept' },
            { input: 'a', expected: 'Reject' },
            { input: 'ab', expected: 'Reject' },
            { input: 'ac', expected: 'Reject' },
            { input: 'abcabc', expected: 'Reject' }
        ]
    };

    const currentTestCases = testCases[currentExample] || [];

    return (
        <div className="pda-test-cases">
            <h3 className="pda-card-title">Test Cases</h3>
            <div className="pda-test-list">
                {currentTestCases.map((testCase, index) => (
                    <div key={index} className="pda-test-item">
                        <button
                            onClick={() => onLoadTest(testCase.input)}
                            className="pda-test-btn"
                        >
                            <code className="pda-test-input">"{testCase.input}"</code>
                        </button>
                        <span className={`pda-test-expected ${testCase.expected.toLowerCase()}`}>
                            {testCase.expected}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};