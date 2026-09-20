import React from 'react';
import './TestCaseList.css';

/**
 * The example test cases for whichever machine is loaded.
 *
 * Each machine used to render its own card, its own title and its own
 * collapse toggle — which then sat *inside* the panel's collapsible section,
 * giving two nested accordions and a header repeated twice. This is just the
 * list; the surrounding section provides the heading and the toggle.
 *
 * `expected` is free text ("Accept", "Reject (0 ÷ 3)"), so acceptance is taken
 * from `shouldAccept` when present and inferred from the text otherwise.
 */
export default function TestCaseList({ testCases, onLoadTest, emptyMessage }) {
    // Callers build their cases from per-example lookups that can miss, so a
    // non-array here is a data problem, not a reason to take down the tree.
    const cases = Array.isArray(testCases) ? testCases : [];

    if (cases.length === 0) {
        return <p className="empty">{emptyMessage || 'No test cases for this example.'}</p>;
    }

    return (
        <ul className="tc-list">
            {cases.map((testCase, index) => {
                const accepts =
                    typeof testCase.shouldAccept === 'boolean'
                        ? testCase.shouldAccept
                        : /^accept/i.test(testCase.expected || '');

                return (
                    <li className="tc-item" key={`${testCase.input}-${index}`}>
                        <span className={`dot ${accepts ? 'dot-accept' : 'dot-reject'}`} />
                        <code className="tc-input">
                            {testCase.input === '' ? 'ε' : testCase.input}
                        </code>
                        <span className={`tc-expected ${accepts ? 'is-accept' : 'is-reject'}`}>
                            {testCase.expected}
                        </span>
                        <button
                            type="button"
                            className="btn btn-sm tc-load"
                            onClick={() => onLoadTest(testCase.input)}
                        >
                            Load
                        </button>
                    </li>
                );
            })}
        </ul>
    );
}
