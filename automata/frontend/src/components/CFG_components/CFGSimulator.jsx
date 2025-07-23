import React, { useState } from 'react';

// Simple CFG S -> a S b | epsilon
function derive(target) {
    const deriveRec = (current) => {
        if (current === target) return true;
        if (current.length > target.length) return false;
        const idx = current.indexOf('S');
        if (idx === -1) return false;
        return deriveRec(current.replace('S', 'aSb')) || deriveRec(current.replace('S', ''));
    };
    return deriveRec('S');
}

const CFGSimulator = () => {
    const [str, setStr] = useState('');
    const [result, setResult] = useState(null);

    const handleRun = () => {
        setResult(derive(str) ? 'Generated' : 'Not generated');
    };

    return (
        <div>
            <h2>CFG Simulator</h2>
            <input value={str} onChange={e => setStr(e.target.value)} />
            <button onClick={handleRun}>Run</button>
            {result && <div data-testid="cfg-result">{result}</div>}
        </div>
    );
};

export default CFGSimulator;
