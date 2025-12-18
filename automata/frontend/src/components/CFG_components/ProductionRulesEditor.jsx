import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import '../DFA_components/stylings/TransitionsEditor.css';

export function ProductionRulesEditor({ cfg, onUpdate }) {
    const [hoveredIndex, setHoveredIndex] = useState(null);
    const [isAdding, setIsAdding] = useState(false);
    const [newRule, setNewRule] = useState({
        left: '',
        right: ''
    });

    const validateProduction = (left, right) => {
        if (!left || !right) {
            alert('Both left and right sides are required');
            return false;
        }

        if (!cfg.variables.includes(left)) {
            alert(`Variable "${left}" does not exist. Add it first.`);
            return false;
        }

        // Validate that right side contains only valid symbols
        const validSymbols = [...cfg.variables, ...cfg.terminals, 'ε'];
        for (const char of right) {
            if (!validSymbols.includes(char) && char !== ' ') {
                alert(`Invalid symbol "${char}" in production. Use only: ${validSymbols.join(', ')}`);
                return false;
            }
        }

        return true;
    };

    const handleAdd = () => {
        const left = newRule.left.trim();
        const right = newRule.right.trim();

        if (!validateProduction(left, right)) {
            return;
        }

        cfg.addProduction(left, right);
        setNewRule({ left: '', right: '' });
        setIsAdding(false);
        onUpdate();
    };

    const handleDelete = (index) => {
        if (window.confirm(`Delete production rule ${cfg.rules[index].left} → ${cfg.rules[index].right}?`)) {
            cfg.deleteProduction(index);
            onUpdate();
        }
    };

    return (
        <div className="transitions-editor">
            <div className="editor-header-simple">
                <p className="editor-subtitle">Production rules (e.g., S → aSb or A → ε)</p>
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
                        <div className="form-inputs">
                            <input
                                type="text"
                                placeholder="S"
                                value={newRule.left}
                                onChange={(e) => setNewRule({ ...newRule, left: e.target.value.toUpperCase() })}
                                className="input-small"
                                maxLength={1}
                                list="cfg-variables-list"
                                style={{ width: '60px' }}
                            />
                            <datalist id="cfg-variables-list">
                                {cfg.variables.map(v => (
                                    <option key={v} value={v} />
                                ))}
                            </datalist>
                            <span className="equals" style={{ margin: '0 8px' }}>→</span>
                            <input
                                type="text"
                                placeholder="aSb or ε"
                                value={newRule.right}
                                onChange={(e) => setNewRule({ ...newRule, right: e.target.value })}
                                className="input-small"
                                style={{ width: '120px' }}
                            />
                            <button 
                                type="button"
                                className="btn-epsilon"
                                onClick={() => setNewRule({ ...newRule, right: 'ε' })}
                                title="Insert Epsilon (ε)"
                                style={{ padding: '2px 8px', fontSize: '18px', cursor: 'pointer' }}
                            >
                                ε
                            </button>
                        </div>
                        <div className="form-actions">
                            <button className="btn-save" onClick={handleAdd}>Save</button>
                            <button className="btn-cancel" onClick={() => {
                                setIsAdding(false);
                                setNewRule({ left: '', right: '' });
                            }}>Cancel</button>
                        </div>
                    </div>
                )}

                {cfg.rules.map((rule, index) => (
                    <div
                        key={`${rule.left}-${rule.right}-${index}`}
                        className="transition-item"
                        onMouseEnter={() => setHoveredIndex(index)}
                        onMouseLeave={() => setHoveredIndex(null)}
                    >
                        <span className="transition-text">
                            <span className="state-name">{rule.left}</span>
                            <span className="equals" style={{ margin: '0 8px' }}>→</span>
                            <span className="symbol-name">{rule.right}</span>
                        </span>
                        <div className="transition-actions">
                            <button 
                                className="btn-icon btn-icon-delete"
                                onClick={() => handleDelete(index)}
                                title="Delete production"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                ))}

                {cfg.rules.length === 0 && !isAdding && (
                    <div className="empty-state">
                        <p>No production rules defined yet.</p>
                        <p className="empty-hint">Click "Add" to create a production rule.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

