import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import '../DFA_components/stylings/TransitionsEditor.css';

export function NFATransitionsEditor({ nfa, onUpdate }) {
    const [hoveredIndex, setHoveredIndex] = useState(null);
    const [isAdding, setIsAdding] = useState(false);
    const [newTransition, setNewTransition] = useState({
        from: '',
        symbol: '',
        to: ''
    });

    const handleAdd = () => {
        if (newTransition.from && newTransition.symbol && newTransition.to) {
            if (!nfa.states.includes(newTransition.from)) {
                alert(`State "${newTransition.from}" does not exist`);
                return;
            }
            if (!nfa.states.includes(newTransition.to)) {
                alert(`State "${newTransition.to}" does not exist`);
                return;
            }
            // Allow epsilon transitions
            if (newTransition.symbol !== 'ε' && newTransition.symbol !== 'epsilon' && !nfa.alphabet.includes(newTransition.symbol)) {
                alert(`Symbol "${newTransition.symbol}" not in alphabet (use ε for epsilon)`);
                return;
            }

            nfa.addTransition(newTransition.from, newTransition.to, newTransition.symbol);
            setNewTransition({ from: '', symbol: '', to: '' });
            setIsAdding(false);
            onUpdate();
        }
    };

    const handleDelete = (index) => {
        if (window.confirm(`Delete this transition?`)) {
            nfa.removeTransition(index);
            onUpdate();
        }
    };

    return (
        <div className="transitions-editor">
            <div className="editor-header-simple">
                <p className="editor-subtitle">State transition rules</p>
                <button 
                    className="btn-add"
                    onClick={() => setIsAdding(true)}
                >
                    <Plus size={16} />
                    Add
                </button>
            </div>

            <div className="transitions-list">
                {isAdding && (
                    <div className="transition-add-form">
                        <div className="form-inputs">
                            <span className="delta-symbol">δ(</span>
                            <input
                                type="text"
                                placeholder="q0"
                                value={newTransition.from}
                                onChange={(e) => setNewTransition({ ...newTransition, from: e.target.value })}
                                className="input-small"
                                list="nfa-states-list"
                            />
                            <datalist id="nfa-states-list">
                                {nfa.states.map(state => (
                                    <option key={state} value={state} />
                                ))}
                            </datalist>
                            <span className="separator">,</span>
                            <input
                                type="text"
                                placeholder="a or ε"
                                value={newTransition.symbol}
                                onChange={(e) => setNewTransition({ ...newTransition, symbol: e.target.value })}
                                className="input-small"
                                list="nfa-alphabet-list"
                            />
                            <datalist id="nfa-alphabet-list">
                                {nfa.alphabet.map(symbol => (
                                    <option key={symbol} value={symbol} />
                                ))}
                                <option value="ε" />
                                <option value="epsilon" />
                            </datalist>
                            <span className="separator">)</span>
                            <span className="equals">=</span>
                            <input
                                type="text"
                                placeholder="q1"
                                value={newTransition.to}
                                onChange={(e) => setNewTransition({ ...newTransition, to: e.target.value })}
                                className="input-small"
                                list="nfa-states-list"
                            />
                        </div>
                        <div className="form-actions">
                            <button className="btn-save" onClick={handleAdd}>Save</button>
                            <button className="btn-cancel" onClick={() => {
                                setIsAdding(false);
                                setNewTransition({ from: '', symbol: '', to: '' });
                            }}>Cancel</button>
                        </div>
                    </div>
                )}

                {nfa.transitions.map((trans, index) => (
                    <div
                        key={`${trans.from}-${trans.symbol}-${trans.to}-${index}`}
                        className="transition-item"
                        onMouseEnter={() => setHoveredIndex(index)}
                        onMouseLeave={() => setHoveredIndex(null)}
                    >
                        <span className="transition-text">
                            <span className="delta-symbol">δ(</span>
                            <span className="state-name">{trans.from}</span>
                            <span className="symbol-name">, {trans.symbol}</span>
                            <span>)</span>
                            <span className="equals"> = </span>
                            <span className="state-name">{trans.to}</span>
                        </span>
                        {hoveredIndex === index && (
                            <div className="transition-actions">
                                <button 
                                    className="btn-icon btn-icon-delete"
                                    onClick={() => handleDelete(index)}
                                    title="Delete transition"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        )}
                    </div>
                ))}

                {nfa.transitions.length === 0 && !isAdding && (
                    <div className="empty-state">
                        <p>No transitions defined yet.</p>
                        <p className="empty-hint">Click "Add" to create a transition.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

