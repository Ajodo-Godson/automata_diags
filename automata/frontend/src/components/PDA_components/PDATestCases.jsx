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
            { input: 'abcc', expected: 'Accept' }, // 1a, 1b, 2c (1+1=2) ✓
            { input: 'aabbcccc', expected: 'Accept' }, // 2a, 2b, 4c (2+2=4) ✓
            { input: 'aabccc', expected: 'Accept' }, // 2a, 1b, 3c (2+1=3) ✓
            { input: 'bbcc', expected: 'Accept' }, // 0a, 2b, 2c (0+2=2) ✓
            { input: 'aacc', expected: 'Accept' }, // 2a, 0b, 2c (2+0=2) ✓
            { input: 'abc', expected: 'Reject' }, // 1a, 1b, 1c (need 2c)
            { input: 'aabbcc', expected: 'Reject' }, // 2a, 2b, 2c (need 4c)
            { input: 'a', expected: 'Reject' },
            { input: 'ab', expected: 'Reject' },
            { input: 'ac', expected: 'Reject' },
            { input: 'abccc', expected: 'Reject' }, // 1a, 1b, 3c (need 2c)
            { input: 'abbcc', expected: 'Reject' } // 1a, 2b, 2c (need 3c)
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