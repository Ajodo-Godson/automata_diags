import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import '../DFA_components/stylings/StatesEditor.css';

export function NFAAlphabetEditor({ nfa, onUpdate }) {
    const [isAdding, setIsAdding] = useState(false);
    const [newSymbol, setNewSymbol] = useState('');

    const handleAddSymbol = () => {
        if (newSymbol.trim() && newSymbol.trim().length === 1) {
            if (nfa.alphabet.includes(newSymbol.trim())) {
                alert(`Symbol "${newSymbol}" already exists in alphabet`);
                return;
            }
            nfa.setAlphabet([...nfa.alphabet, newSymbol.trim()]);
            setNewSymbol('');
            setIsAdding(false);
            onUpdate();
        } else {
            alert('Symbol must be a single character');
        }
    };

    const handleRemoveSymbol = (symbol) => {
        if (window.confirm(`Remove symbol "${symbol}" from alphabet?`)) {
            nfa.setAlphabet(nfa.alphabet.filter(s => s !== symbol));
            onUpdate();
        }
    };

    return (
        <div className="states-editor">
            <div className="states-list">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                    {nfa.alphabet.map((symbol) => (
                        <div key={symbol} className="state-item" style={{ padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span className="state-name">{symbol}</span>
                            <button
                                className="btn-icon btn-icon-delete"
                                onClick={() => handleRemoveSymbol(symbol)}
                                style={{ padding: '2px' }}
                                title="Remove symbol"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    ))}
                </div>

                {isAdding && (
                    <div className="state-add-form">
                        <input
                            type="text"
                            placeholder="a"
                            value={newSymbol}
                            onChange={(e) => setNewSymbol(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleAddSymbol()}
                            className="input-state"
                            maxLength={1}
                            autoFocus
                        />
                        <div className="form-actions">
                            <button className="btn-save" onClick={handleAddSymbol}>Save</button>
                            <button className="btn-cancel" onClick={() => {
                                setIsAdding(false);
                                setNewSymbol('');
                            }}>Cancel</button>
                        </div>
                    </div>
                )}

                <button 
                    className="btn-add-state"
                    onClick={() => setIsAdding(true)}
                    disabled={isAdding}
                >
                    <Plus size={16} />
                    Add Symbol
                </button>
            </div>
        </div>
    );
}


