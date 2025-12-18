import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import '../DFA_components/stylings/TransitionsEditor.css';

export function PDATransitionsEditor({ pda, onUpdate }) {
    const [hoveredIndex, setHoveredIndex] = useState(null);
    const [isAdding, setIsAdding] = useState(false);
    const [newTransition, setNewTransition] = useState({
        from: '',
        input: '',
        pop: '',
        to: '',
        push: ''
    });

    const handleAdd = () => {
        const { from, input, pop, to, push } = newTransition;
        
        if (!from || !input || !pop || !to || !push) {
            alert('All fields are required');
            return;
        }

        if (!pda.states.includes(from)) {
            alert(`State "${from}" does not exist`);
            return;
        }
        if (!pda.states.includes(to)) {
            alert(`State "${to}" does not exist`);
            return;
        }
        if (input !== 'ε' && !pda.alphabet.includes(input)) {
            alert(`Symbol "${input}" not in alphabet (use ε for epsilon)`);
            return;
        }
        if (!pda.stackAlphabet.includes(pop)) {
            alert(`Stack symbol "${pop}" not in stack alphabet`);
            return;
        }
        // Allow ε for push (means pop without push)
        if (push !== 'ε' && !push.split('').every(s => pda.stackAlphabet.includes(s))) {
            alert(`Push symbols must be from stack alphabet`);
            return;
        }

        pda.addTransition(from, to, input, pop, push);
        setNewTransition({ from: '', input: '', pop: '', to: '', push: '' });
        setIsAdding(false);
        onUpdate();
    };

    const handleDelete = (from, to, input, pop, push) => {
        if (window.confirm(`Delete transition δ(${from}, ${input}, ${pop})?`)) {
            pda.removeTransition(from, to, input, pop, push);
            onUpdate();
        }
    };

    return (
        <div className="transitions-editor">
            <div className="editor-header-simple">
                <p className="editor-subtitle">PDA transition rules: δ(state, input, pop) = (state, push)</p>
                <button 
                    className="btn-add"
                    onClick={() => setIsAdding(true)}
                    disabled={isAdding}
                >
                    <Plus size={16} />
                    Add
                </button>
            </div>

            <div className="transitions-list">
                {isAdding && (
                    <div className="transition-add-form">
                        <div className="form-inputs" style={{ flexWrap: 'wrap', gap: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span className="delta-symbol">δ(</span>
                                <input
                                    type="text"
                                    placeholder="q0"
                                    value={newTransition.from}
                                    onChange={(e) => setNewTransition({ ...newTransition, from: e.target.value })}
                                    className="input-small"
                                    list="pda-states-list"
                                />
                                <span className="separator">,</span>
                                <input
                                    type="text"
                                    placeholder="a or ε"
                                    value={newTransition.input}
                                    onChange={(e) => setNewTransition({ ...newTransition, input: e.target.value })}
                                    className="input-small"
                                    list="pda-alphabet-list"
                                    style={{ width: '60px' }}
                                />
                                <button 
                                    type="button"
                                    onClick={() => setNewTransition({ ...newTransition, input: 'ε' })}
                                    title="Insert Epsilon (ε)"
                                    style={{ padding: '2px 4px', cursor: 'pointer' }}
                                >ε</button>
                                <span className="separator">,</span>
                                <input
                                    type="text"
                                    placeholder="Z"
                                    value={newTransition.pop}
                                    onChange={(e) => setNewTransition({ ...newTransition, pop: e.target.value })}
                                    className="input-small"
                                    maxLength={1}
                                    list="pda-stack-list"
                                />
                                <span className="separator">)</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span className="equals">=</span>
                                <span>(</span>
                                <input
                                    type="text"
                                    placeholder="q1"
                                    value={newTransition.to}
                                    onChange={(e) => setNewTransition({ ...newTransition, to: e.target.value })}
                                    className="input-small"
                                    list="pda-states-list"
                                />
                                <span className="separator">,</span>
                                <input
                                    type="text"
                                    placeholder="XZ or ε"
                                    value={newTransition.push}
                                    onChange={(e) => setNewTransition({ ...newTransition, push: e.target.value })}
                                    className="input-small"
                                    list="pda-stack-list"
                                    style={{ width: '60px' }}
                                />
                                <button 
                                    type="button"
                                    onClick={() => setNewTransition({ ...newTransition, push: 'ε' })}
                                    title="Insert Epsilon (ε)"
                                    style={{ padding: '2px 4px', cursor: 'pointer' }}
                                >ε</button>
                                <span>)</span>
                            </div>
                        </div>
                        
                        <datalist id="pda-states-list">
                            {pda.states.map(state => (
                                <option key={state} value={state} />
                            ))}
                        </datalist>
                        <datalist id="pda-alphabet-list">
                            {pda.alphabet.map(symbol => (
                                <option key={symbol} value={symbol} />
                            ))}
                            <option value="ε" />
                        </datalist>
                        <datalist id="pda-stack-list">
                            {pda.stackAlphabet.map(symbol => (
                                <option key={symbol} value={symbol} />
                            ))}
                            <option value="ε" />
                        </datalist>

                        <div className="form-actions">
                            <button className="btn-save" onClick={handleAdd}>Save</button>
                            <button className="btn-cancel" onClick={() => {
                                setIsAdding(false);
                                setNewTransition({ from: '', input: '', pop: '', to: '', push: '' });
                            }}>Cancel</button>
                        </div>
                    </div>
                )}

                {pda.transitions.map((trans, index) => (
                    <div
                        key={`${trans.from}-${trans.input}-${trans.pop}-${index}`}
                        className="transition-item"
                        onMouseEnter={() => setHoveredIndex(index)}
                        onMouseLeave={() => setHoveredIndex(null)}
                    >
                        <span className="transition-text">
                            <span className="delta-symbol">δ(</span>
                            <span className="state-name">{trans.from}</span>
                            <span className="symbol-name">, {trans.input}</span>
                            <span className="symbol-name">, {trans.pop}</span>
                            <span>) = (</span>
                            <span className="state-name">{trans.to}</span>
                            <span className="symbol-name">, {trans.push}</span>
                            <span>)</span>
                        </span>
                        <div className="transition-actions">
                            <button 
                                className="btn-icon btn-icon-delete"
                                onClick={() => handleDelete(trans.from, trans.to, trans.input, trans.pop, trans.push)}
                                title="Delete transition"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                ))}

                {pda.transitions.length === 0 && !isAdding && (
                    <div className="empty-state">
                        <p>No transitions defined yet.</p>
                        <p className="empty-hint">Click "Add" to create a transition.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

