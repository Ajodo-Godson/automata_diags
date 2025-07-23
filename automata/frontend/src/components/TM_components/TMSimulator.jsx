import React, { useState } from 'react';

// Simple TM that accepts binary strings with an even number of 0s
const transitions = {
    'q0,0': ['q1', '0', 'R'],
    'q0,1': ['q0', '1', 'R'],
    'q0,_': ['qa', '_', 'R'],
    'q1,0': ['q0', '0', 'R'],
    'q1,1': ['q1', '1', 'R'],
    'q1,_': ['qr', '_', 'R'],
};

function runTM(input) {
    let tape = input.split('');
    let head = 0;
    let state = 'q0';
    const blank = '_';
    while (true) {
        const symbol = tape[head] === undefined ? blank : tape[head];
        const key = `${state},${symbol}`;
        const trans = transitions[key];
        if (!trans) return state === 'qa';
        const [next, write, move] = trans;
        tape[head] = write;
        head += move === 'R' ? 1 : -1;
        state = next;
        if (state === 'qa') return true;
        if (state === 'qr') return false;
    }
}

const TMSimulator = () => {
    const [str, setStr] = useState('');
    const [result, setResult] = useState(null);

    const handleRun = () => {
        setResult(runTM(str) ? 'Accepted' : 'Rejected');
    };

    return (
        <div>
            <h2>Turing Machine Simulator</h2>
            <input value={str} onChange={e => setStr(e.target.value)} />
            <button onClick={handleRun}>Run</button>
            {result && <div data-testid="tm-result">{result}</div>}
        </div>
    );
};

export default TMSimulator;
