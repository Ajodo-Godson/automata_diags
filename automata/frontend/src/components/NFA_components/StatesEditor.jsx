import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import '../DFA_components/stylings/StatesEditor.css';

export function NFAStatesEditor({ nfa, onUpdate }) {
    const [isAdding, setIsAdding] = useState(false);
    const [newStateName, setNewStateName] = useState('');

    const handleAddState = () => {
        if (newStateName.trim()) {
            if (nfa.states.includes(newStateName.trim())) {
                alert(`State "${newStateName}" already exists`);
                return;
            }
            nfa.addState(newStateName.trim());
            setNewStateName('');
            setIsAdding(false);
            onUpdate();
        }
    };

    const handleToggleFinal = (stateName) => {
        nfa.toggleAcceptState(stateName);
        onUpdate();
    };

    const handleSetStart = (stateName) => {
        nfa.setStart(stateName);
        onUpdate();
    };

    return (
        <div className="states-editor">
            <div className="states-list">
                {nfa.states.map((state) => (
                    <div key={state} className="state-item">
                        <div className="state-info">
                            <span className="state-name">{state}</span>
                            <div className="state-badges">
                                {state === nfa.startState && (
                                    <span className="badge badge-start">Start</span>
                                )}
                                {nfa.acceptStates.includes(state) && (
                                    <span className="badge badge-final">Final</span>
                                )}
                            </div>
                        </div>
                        <div className="state-actions">
                            {state !== nfa.startState && (
                                <button
                                    className="btn-toggle"
                                    onClick={() => handleSetStart(state)}
                                >
                                    Set as Start
                                </button>
                            )}
                            <button
                                className="btn-toggle"
                                onClick={() => handleToggleFinal(state)}
                            >
                                Toggle Final
                            </button>
                        </div>
                    </div>
                ))}

                {isAdding && (
                    <div className="state-add-form">
                        <input
                            type="text"
                            placeholder="q3"
                            value={newStateName}
                            onChange={(e) => setNewStateName(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleAddState()}
                            className="input-state"
                            autoFocus
                        />
                        <div className="form-actions">
                            <button className="btn-save" onClick={handleAddState}>Save</button>
                            <button className="btn-cancel" onClick={() => {
                                setIsAdding(false);
                                setNewStateName('');
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
                    Add State
                </button>
            </div>
        </div>
    );
}

