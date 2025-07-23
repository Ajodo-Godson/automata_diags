import React, { useState } from 'react';

// Very small PDA that accepts strings of the form a^n b^n
function runPDA(input) {
    const stack = ['Z'];
    for (let ch of input) {
        if (ch === 'a') {
            stack.push('A');
        } else if (ch === 'b') {
            if (stack.length <= 1) return false;
            stack.pop();
        } else {
            return false;
        }
    }
    return stack.length === 1;
}

const PDASimulator = () => {
    const [str, setStr] = useState('');
    const [result, setResult] = useState(null);

    const handleRun = () => {
        setResult(runPDA(str) ? 'Accepted' : 'Rejected');
    };

    return (
        <div>
            <h2>PDA Simulator</h2>
            <input value={str} onChange={e => setStr(e.target.value)} />
            <button onClick={handleRun}>Run</button>
            {result && <div data-testid="pda-result">{result}</div>}
        </div>
    );
};

export default PDASimulator;
