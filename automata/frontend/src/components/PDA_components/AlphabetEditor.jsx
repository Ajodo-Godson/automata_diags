import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import '../DFA_components/stylings/StatesEditor.css';

export function PDAAlphabetEditor({ pda, onUpdate }) {
    const [isAddingInput, setIsAddingInput] = useState(false);
    const [isAddingStack, setIsAddingStack] = useState(false);
    const [newInputSymbol, setNewInputSymbol] = useState('');
    const [newStackSymbol, setNewStackSymbol] = useState('');

    const handleAddInputSymbol = () => {
        if (newInputSymbol.trim() && newInputSymbol.trim().length === 1) {
            if (pda.alphabet.includes(newInputSymbol.trim())) {
                alert(`Symbol "${newInputSymbol}" already exists in alphabet`);
                return;
            }
            pda.setAlphabet([...pda.alphabet, newInputSymbol.trim()]);
            setNewInputSymbol('');
            setIsAddingInput(false);
            onUpdate();
        } else {
            alert('Symbol must be a single character');
        }
    };

    const handleAddStackSymbol = () => {
        if (newStackSymbol.trim() && newStackSymbol.trim().length === 1) {
            if (pda.stackAlphabet.includes(newStackSymbol.trim())) {
                alert(`Symbol "${newStackSymbol}" already exists in stack alphabet`);
                return;
            }
            pda.setStackAlphabet([...pda.stackAlphabet, newStackSymbol.trim()]);
            setNewStackSymbol('');
            setIsAddingStack(false);
            onUpdate();
        } else {
            alert('Symbol must be a single character');
        }
    };

    const handleRemoveInputSymbol = (symbol) => {
        if (window.confirm(`Remove symbol "${symbol}" from input alphabet?`)) {
            pda.setAlphabet(pda.alphabet.filter(s => s !== symbol));
            onUpdate();
        }
    };

    const handleRemoveStackSymbol = (symbol) => {
        if (window.confirm(`Remove symbol "${symbol}" from stack alphabet?`)) {
            pda.setStackAlphabet(pda.stackAlphabet.filter(s => s !== symbol));
            onUpdate();
        }
    };

    return (
        <div className="states-editor">
            <h4 style={{ marginBottom: '12px', fontSize: '14px', fontWeight: '600' }}>Input Alphabet</h4>
            <div className="states-list" style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                    {pda.alphabet.map((symbol) => (
                        <div key={symbol} className="state-item" style={{ padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span className="state-name">{symbol}</span>
                            <button
                                className="btn-icon btn-icon-delete"
                                onClick={() => handleRemoveInputSymbol(symbol)}
                                style={{ padding: '2px' }}
                                title="Remove symbol"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    ))}
                </div>

                {isAddingInput && (
                    <div className="state-add-form">
                        <input
                            type="text"
                            placeholder="a"
                            value={newInputSymbol}
                            onChange={(e) => setNewInputSymbol(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleAddInputSymbol()}
                            className="input-state"
                            maxLength={1}
                            autoFocus
                        />
                        <div className="form-actions">
                            <button className="btn-save" onClick={handleAddInputSymbol}>Save</button>
                            <button className="btn-cancel" onClick={() => {
                                setIsAddingInput(false);
                                setNewInputSymbol('');
                            }}>Cancel</button>
                        </div>
                    </div>
                )}

                <button 
                    className="btn-add-state"
                    onClick={() => setIsAddingInput(true)}
                    disabled={isAddingInput}
                >
                    <Plus size={16} />
                    Add Input Symbol
                </button>
            </div>

            <h4 style={{ marginBottom: '12px', fontSize: '14px', fontWeight: '600' }}>Stack Alphabet</h4>
            <div className="states-list">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                    {pda.stackAlphabet.map((symbol) => (
                        <div key={symbol} className="state-item" style={{ padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span className="state-name">{symbol}</span>
                            <button
                                className="btn-icon btn-icon-delete"
                                onClick={() => handleRemoveStackSymbol(symbol)}
                                style={{ padding: '2px' }}
                                title="Remove symbol"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    ))}
                </div>

                {isAddingStack && (
                    <div className="state-add-form">
                        <input
                            type="text"
                            placeholder="Z"
                            value={newStackSymbol}
                            onChange={(e) => setNewStackSymbol(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleAddStackSymbol()}
                            className="input-state"
                            maxLength={1}
                            autoFocus
                        />
                        <div className="form-actions">
                            <button className="btn-save" onClick={handleAddStackSymbol}>Save</button>
                            <button className="btn-cancel" onClick={() => {
                                setIsAddingStack(false);
                                setNewStackSymbol('');
                            }}>Cancel</button>
                        </div>
                    </div>
                )}

                <button 
                    className="btn-add-state"
                    onClick={() => setIsAddingStack(true)}
                    disabled={isAddingStack}
                >
                    <Plus size={16} />
                    Add Stack Symbol
                </button>
            </div>
        </div>
    );
}




