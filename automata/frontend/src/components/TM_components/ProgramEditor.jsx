import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './stylings/ProgramEditor.css';

export function ProgramEditor({ 
  rules, 
  activeRuleId, 
  onRulesChange,
  availableStates = [], 
  availableSymbols = [] 
}) {
  const [editingId, setEditingId] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    currentState: '',
    readSymbol: '',
    newState: '',
    writeSymbol: '',
    moveDirection: 'R'
  });

  const handleAdd = () => {
    if (!formData.currentState || !formData.readSymbol || !formData.newState || !formData.writeSymbol) {
      alert('All fields are required');
      return;
    }

    const newRule = {
      id: Date.now().toString(),
      ...formData
    };

    onRulesChange([...rules, newRule]);
    setIsAdding(false);
    setFormData({
      currentState: '',
      readSymbol: '',
      newState: '',
      writeSymbol: '',
      moveDirection: 'R'
    });
  };

  const handleEdit = (rule) => {
    setEditingId(rule.id);
    setFormData({
      currentState: rule.currentState,
      readSymbol: rule.readSymbol,
      newState: rule.newState,
      writeSymbol: rule.writeSymbol,
      moveDirection: rule.moveDirection
    });
  };

  const handleSaveEdit = () => {
    if (!editingId) return;

    const updatedRules = rules.map(rule =>
      rule.id === editingId ? { ...rule, ...formData } : rule
    );

    onRulesChange(updatedRules);
    setEditingId(null);
    setFormData({
      currentState: '',
      readSymbol: '',
      newState: '',
      writeSymbol: '',
      moveDirection: 'R'
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setIsAdding(false);
    setFormData({
      currentState: '',
      readSymbol: '',
      newState: '',
      writeSymbol: '',
      moveDirection: 'R'
    });
  };

  const handleDelete = (id) => {
    onRulesChange(rules.filter(rule => rule.id !== id));
  };

  return (
    <div className="program-editor">
      <div className="editor-header-actions">
        <button
          onClick={() => setIsAdding(true)}
          disabled={isAdding || editingId !== null}
          className="btn btn-primary btn-small"
        >
          <Plus className="btn-icon-sm" />
          Add Rule
        </button>
      </div>

      <div className="rules-container">
        <AnimatePresence>
          {isAdding && (
            <RuleForm
              formData={formData}
              onFormChange={setFormData}
              onSave={handleAdd}
              onCancel={handleCancelEdit}
              isNew={true}
              availableStates={availableStates}
              availableSymbols={availableSymbols}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {rules.map((rule) => (
            <motion.div
              key={rule.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {editingId === rule.id ? (
                <RuleForm
                  formData={formData}
                  onFormChange={setFormData}
                  onSave={handleSaveEdit}
                  onCancel={handleCancelEdit}
                  isNew={false}
                  availableStates={availableStates}
                  availableSymbols={availableSymbols}
                />
              ) : (
                <RuleCard
                  rule={rule}
                  isActive={activeRuleId === rule.id}
                  onEdit={() => handleEdit(rule)}
                  onDelete={() => handleDelete(rule.id)}
                />
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {rules.length === 0 && !isAdding && (
          <div className="empty-state">
            <p>No rules defined yet.</p>
            <p className="empty-state-hint">Click "Add Rule" to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function RuleCard({ rule, isActive, onEdit, onDelete }) {
  return (
    <motion.div
      className={`rule-card ${isActive ? 'active' : ''}`}
      animate={{
        scale: isActive ? 1.02 : 1,
      }}
      transition={{ duration: 0.2 }}
    >
      <div className="rule-content">
        <div className="rule-info">
          <div className="rule-row">
            <span className="rule-label">State:</span>
            <span className="rule-badge">{rule.currentState}</span>
            <span className="rule-label">Read:</span>
            <span className="rule-badge">{rule.readSymbol}</span>
          </div>
          <div className="rule-arrow">↓</div>
          <div className="rule-row">
            <span className="rule-label">State:</span>
            <span className="rule-badge-highlight">{rule.newState}</span>
            <span className="rule-label">Write:</span>
            <span className="rule-badge-highlight">{rule.writeSymbol}</span>
            <span className="rule-label">Move:</span>
            <span className="rule-badge-highlight">
              {rule.moveDirection === 'R' ? '→ Right (R)' : '← Left (L)'}
            </span>
          </div>
        </div>

        <div className="rule-actions">
          <button
            onClick={onEdit}
            className="icon-btn"
            title="Edit"
          >
            <Edit2 className="icon-sm" />
          </button>
          <button
            onClick={onDelete}
            className="icon-btn icon-btn-danger"
            title="Delete"
          >
            <Trash2 className="icon-sm" />
          </button>
        </div>
      </div>

      {isActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="executing-indicator"
        >
          <div className="pulse-dot" />
          Executing this rule
        </motion.div>
      )}
    </motion.div>
  );
}

function RuleForm({ formData, onFormChange, onSave, onCancel, isNew, availableStates, availableSymbols }) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="rule-form"
    >
      <div className="form-grid">
        <div className="form-row">
          <div className="form-field">
            <label htmlFor="current-state" className="form-label">Current State</label>
            <input
              id="current-state"
              value={formData.currentState}
              onChange={(e) => onFormChange({ ...formData, currentState: e.target.value })}
              placeholder="q0"
              className="form-input"
              list="tm-states-list"
            />
          </div>
          <div className="form-field">
            <label htmlFor="read-symbol" className="form-label">Read Symbol</label>
            <input
              id="read-symbol"
              value={formData.readSymbol}
              onChange={(e) => onFormChange({ ...formData, readSymbol: e.target.value })}
              placeholder="0"
              className="form-input"
              maxLength={3}
              list="tm-symbols-list"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-field">
            <label htmlFor="new-state" className="form-label">New State</label>
            <input
              id="new-state"
              value={formData.newState}
              onChange={(e) => onFormChange({ ...formData, newState: e.target.value })}
              placeholder="q1"
              className="form-input"
              list="tm-states-list"
            />
          </div>
          <div className="form-field">
            <label htmlFor="write-symbol" className="form-label">Write Symbol</label>
            <input
              id="write-symbol"
              value={formData.writeSymbol}
              onChange={(e) => onFormChange({ ...formData, writeSymbol: e.target.value })}
              placeholder="1"
              className="form-input"
              maxLength={3}
              list="tm-symbols-list"
            />
          </div>
        </div>

        <div className="form-field">
          <label htmlFor="move-direction" className="form-label">Move Direction</label>
          <select
            id="move-direction"
            value={formData.moveDirection}
            onChange={(e) => onFormChange({ ...formData, moveDirection: e.target.value })}
            className="form-select"
          >
            <option value="R">→ Right (R)</option>
            <option value="L">← Left (L)</option>
          </select>
        </div>

        <datalist id="tm-states-list">
          {availableStates.map(state => (
            <option key={state} value={state} />
          ))}
        </datalist>
        <datalist id="tm-symbols-list">
          {availableSymbols.map(symbol => (
            <option key={symbol} value={symbol} />
          ))}
        </datalist>

        <div className="form-actions">
          <button
            onClick={onSave}
            className="btn btn-primary"
          >
            <Check className="btn-icon-sm" />
            {isNew ? 'Add' : 'Save'}
          </button>
          <button
            onClick={onCancel}
            className="btn btn-outline"
          >
            <X className="btn-icon-sm" />
            Cancel
          </button>
        </div>
      </div>
    </motion.div>
  );
}
