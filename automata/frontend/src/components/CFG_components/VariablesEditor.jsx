import React, { useState } from 'react';
import { Plus, Trash2, Star } from 'lucide-react';
import '../DFA_components/stylings/StatesEditor.css';

export function VariablesEditor({ cfg, onUpdate }) {
    const [isAdding, setIsAdding] = useState(false);
    const [newVariable, setNewVariable] = useState('');

    const handleAddVariable = () => {
        const variable = newVariable.trim();
        if (!variable) return;

        if (variable.length !== 1 || !/[A-Z]/.test(variable)) {
            alert('Variable must be a single uppercase letter (A-Z)');
            return;
        }

        if (cfg.variables.includes(variable)) {
            alert(`Variable "${variable}" already exists`);
            return;
        }

        cfg.addVariable(variable);
        setNewVariable('');
        setIsAdding(false);
        onUpdate();
    };

    const handleRemoveVariable = (variable) => {
        if (variable === cfg.startVariable) {
            alert(`Cannot remove start variable "${variable}". Set a different start variable first.`);
            return;
        }

        // Check if variable is used in any production
        const usedInProductions = cfg.rules.some(rule => 
            rule.left === variable || rule.right.includes(variable)
        );

        if (usedInProductions) {
            if (!window.confirm(`Variable "${variable}" is used in production rules. Remove anyway?`)) {
                return;
            }
        }

        cfg.setVariables(cfg.variables.filter(v => v !== variable));
        // Remove rules that use this variable
        cfg.setRules(cfg.rules.filter(rule => 
            rule.left !== variable && !rule.right.includes(variable)
        ));
        onUpdate();
    };

    const handleSetStartVariable = (variable) => {
        cfg.setStartVariable(variable);
        onUpdate();
    };

    return (
        <div className="states-editor">
            <div className="states-list">
                {cfg.variables.map((variable) => (
                    <div key={variable} className="state-item">
                        <div className="state-info">
                            <span className="state-name">{variable}</span>
                            <div className="state-badges">
                                {variable === cfg.startVariable && (
                                    <span className="badge badge-start">
                                        <Star size={12} style={{ marginRight: '4px' }} />
                                        Start
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="state-actions">
                            {variable !== cfg.startVariable && (
                                <button
                                    className="btn-toggle"
                                    onClick={() => handleSetStartVariable(variable)}
                                >
                                    Set as Start
                                </button>
                            )}
                            <button
                                className="btn-icon btn-icon-delete"
                                onClick={() => handleRemoveVariable(variable)}
                                title="Remove variable"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                ))}

                {isAdding && (
                    <div className="state-add-form">
                        <input
                            type="text"
                            placeholder="A"
                            value={newVariable}
                            onChange={(e) => setNewVariable(e.target.value.toUpperCase())}
                            onKeyPress={(e) => e.key === 'Enter' && handleAddVariable()}
                            className="input-state"
                            maxLength={1}
                            autoFocus
                        />
                        <div className="form-actions">
                            <button className="btn-save" onClick={handleAddVariable}>Save</button>
                            <button className="btn-cancel" onClick={() => {
                                setIsAdding(false);
                                setNewVariable('');
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
                    Add Variable
                </button>
            </div>
        </div>
    );
}






