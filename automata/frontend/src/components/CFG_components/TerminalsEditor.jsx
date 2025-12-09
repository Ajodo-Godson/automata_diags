import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import '../DFA_components/stylings/StatesEditor.css';

export function TerminalsEditor({ cfg, onUpdate }) {
    const [isAdding, setIsAdding] = useState(false);
    const [newTerminal, setNewTerminal] = useState('');

    const handleAddTerminal = () => {
        const terminal = newTerminal.trim();
        if (!terminal) return;

        if (terminal.length !== 1) {
            alert('Terminal must be a single character');
            return;
        }

        if (/[A-Z]/.test(terminal)) {
            alert('Terminal cannot be an uppercase letter (reserved for variables)');
            return;
        }

        if (cfg.terminals.includes(terminal)) {
            alert(`Terminal "${terminal}" already exists`);
            return;
        }

        cfg.setTerminals([...cfg.terminals, terminal]);
        setNewTerminal('');
        setIsAdding(false);
        onUpdate();
    };

    const handleRemoveTerminal = (terminal) => {
        // Check if terminal is used in any production
        const usedInProductions = cfg.rules.some(rule => rule.right.includes(terminal));

        if (usedInProductions) {
            if (!window.confirm(`Terminal "${terminal}" is used in production rules. Remove anyway?`)) {
                return;
            }
        }

        cfg.setTerminals(cfg.terminals.filter(t => t !== terminal));
        onUpdate();
    };

    return (
        <div className="states-editor">
            <div className="states-list">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                    {cfg.terminals.map((terminal) => (
                        <div key={terminal} className="state-item" style={{ padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span className="state-name">{terminal}</span>
                            <button
                                className="btn-icon btn-icon-delete"
                                onClick={() => handleRemoveTerminal(terminal)}
                                style={{ padding: '2px' }}
                                title="Remove terminal"
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
                            value={newTerminal}
                            onChange={(e) => setNewTerminal(e.target.value.toLowerCase())}
                            onKeyPress={(e) => e.key === 'Enter' && handleAddTerminal()}
                            className="input-state"
                            maxLength={1}
                            autoFocus
                        />
                        <div className="form-actions">
                            <button className="btn-save" onClick={handleAddTerminal}>Save</button>
                            <button className="btn-cancel" onClick={() => {
                                setIsAdding(false);
                                setNewTerminal('');
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
                    Add Terminal
                </button>
            </div>
        </div>
    );
}


