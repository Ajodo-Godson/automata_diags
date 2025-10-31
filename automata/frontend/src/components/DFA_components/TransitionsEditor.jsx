import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import './stylings/TransitionsEditor.css';

export function TransitionsEditor({ dfa, onUpdate }) {
    const [hoveredIndex, setHoveredIndex] = useState(null);
    const [isAdding, setIsAdding] = useState(false);
    const [newTransition, setNewTransition] = useState({
        from: '',
        symbol: '',
        to: ''
    });

    // Convert transitions object to array for display
    const getTransitionsArray = () => {
        const transArray = [];
        Object.entries(dfa.transitions).forEach(([fromState, symbolMap]) => {
            Object.entries(symbolMap).forEach(([symbol, toState]) => {
                transArray.push({ from: fromState, symbol, to: toState });
            });
        });
        return transArray;
    };

    const transitions = getTransitionsArray();

    const handleAdd = () => {
        if (newTransition.from && newTransition.symbol && newTransition.to) {
            if (!dfa.states.includes(newTransition.from)) {
                alert(`State "${newTransition.from}" does not exist`);
                return;
            }
            if (!dfa.states.includes(newTransition.to)) {
                alert(`State "${newTransition.to}" does not exist`);
                return;
            }
            if (!dfa.alphabet.includes(newTransition.symbol)) {
                alert(`Symbol "${newTransition.symbol}" not in alphabet`);
                return;
            }

            const updatedTransitions = { ...dfa.transitions };
            if (!updatedTransitions[newTransition.from]) {
                updatedTransitions[newTransition.from] = {};
            }
            updatedTransitions[newTransition.from][newTransition.symbol] = newTransition.to;

            dfa.loadDFA({
                ...dfa,
                transitions: updatedTransitions
            });

            setNewTransition({ from: '', symbol: '', to: '' });
            setIsAdding(false);
            onUpdate();
        }
    };

    const handleDelete = (from, symbol) => {
        if (window.confirm(`Delete transition δ(${from}, ${symbol})?`)) {
            const updatedTransitions = { ...dfa.transitions };
            if (updatedTransitions[from]) {
                delete updatedTransitions[from][symbol];
                if (Object.keys(updatedTransitions[from]).length === 0) {
                    delete updatedTransitions[from];
                }
            }

            dfa.loadDFA({
                ...dfa,
                transitions: updatedTransitions
            });
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
                    <Plus size={11} />
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
                                list="states-list"
                            />
                            <datalist id="states-list">
                                {dfa.states.map(state => (
                                    <option key={state} value={state} />
                                ))}
                            </datalist>
                            <span className="separator">,</span>
                            <input
                                type="text"
                                placeholder="a"
                                value={newTransition.symbol}
                                onChange={(e) => setNewTransition({ ...newTransition, symbol: e.target.value })}
                                className="input-small"
                                maxLength={1}
                                list="alphabet-list"
                            />
                            <datalist id="alphabet-list">
                                {dfa.alphabet.map(symbol => (
                                    <option key={symbol} value={symbol} />
                                ))}
                            </datalist>
                            <span className="separator">)</span>
                            <span className="equals">=</span>
                            <input
                                type="text"
                                placeholder="q1"
                                value={newTransition.to}
                                onChange={(e) => setNewTransition({ ...newTransition, to: e.target.value })}
                                className="input-small"
                                list="states-list"
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

                {transitions.map((trans, index) => (
                    <div
                        key={`${trans.from}-${trans.symbol}-${index}`}
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
                                    onClick={() => handleDelete(trans.from, trans.symbol)}
                                    title="Delete transition"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        )}
                    </div>
                ))}

                {transitions.length === 0 && !isAdding && (
                    <div className="empty-state">
                        <p>No transitions defined yet.</p>
                        <p className="empty-hint">Click "Add" to create a transition.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

