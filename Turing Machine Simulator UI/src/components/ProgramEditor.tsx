import { useState } from 'react';
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { motion, AnimatePresence } from 'motion/react';
import type { TransitionRule } from '../App';

interface ProgramEditorProps {
  rules: TransitionRule[];
  activeRuleId: string | null;
  onRulesChange: (rules: TransitionRule[]) => void;
}

export function ProgramEditor({ rules, activeRuleId, onRulesChange }: ProgramEditorProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<Omit<TransitionRule, 'id'>>({
    currentState: '',
    readSymbol: '',
    newState: '',
    writeSymbol: '',
    moveDirection: 'R'
  });

  const handleAdd = () => {
    if (!formData.currentState || !formData.readSymbol || !formData.newState || !formData.writeSymbol) {
      return;
    }

    const newRule: TransitionRule = {
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

  const handleEdit = (rule: TransitionRule) => {
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

  const handleDelete = (id: string) => {
    onRulesChange(rules.filter(rule => rule.id !== id));
  };

  return (
    <Card className="p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3>Transition Rules</h3>
          <p className="text-sm text-muted-foreground">
            Define the machine's behavior
          </p>
        </div>
        <Button
          onClick={() => setIsAdding(true)}
          disabled={isAdding || editingId !== null}
          size="sm"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Rule
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2" style={{ maxHeight: 'calc(100vh - 300px)' }}>
        <AnimatePresence>
          {isAdding && (
            <RuleForm
              formData={formData}
              onFormChange={setFormData}
              onSave={handleAdd}
              onCancel={handleCancelEdit}
              isNew={true}
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
          <div className="text-center py-8 text-muted-foreground">
            <p>No rules defined yet.</p>
            <p className="text-sm mt-1">Click "Add Rule" to get started.</p>
          </div>
        )}
      </div>
    </Card>
  );
}

interface RuleCardProps {
  rule: TransitionRule;
  isActive: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

function RuleCard({ rule, isActive, onEdit, onDelete }: RuleCardProps) {
  return (
    <motion.div
      className={`
        border-2 rounded-lg p-4 transition-all duration-200
        ${isActive 
          ? 'border-primary bg-primary/5 shadow-lg shadow-primary/20' 
          : 'border-border bg-card hover:border-primary/30'
        }
      `}
      animate={{
        scale: isActive ? 1.02 : 1,
        borderWidth: isActive ? 3 : 2
      }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex-1 font-mono text-sm space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">State:</span>
            <span className="bg-muted px-2 py-0.5 rounded">{rule.currentState}</span>
            <span className="text-muted-foreground">Read:</span>
            <span className="bg-muted px-2 py-0.5 rounded">{rule.readSymbol}</span>
          </div>
          <div className="text-primary">↓</div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">State:</span>
            <span className="bg-primary/10 px-2 py-0.5 rounded border border-primary/20">{rule.newState}</span>
            <span className="text-muted-foreground">Write:</span>
            <span className="bg-primary/10 px-2 py-0.5 rounded border border-primary/20">{rule.writeSymbol}</span>
            <span className="text-muted-foreground">Move:</span>
            <span className="bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
              {rule.moveDirection === 'R' ? '→ Right' : '← Left'}
            </span>
          </div>
        </div>

        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onEdit}
            className="h-8 w-8 p-0"
          >
            <Edit2 className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {isActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs text-primary mt-2 flex items-center gap-1"
        >
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
          Executing this rule
        </motion.div>
      )}
    </motion.div>
  );
}

interface RuleFormProps {
  formData: Omit<TransitionRule, 'id'>;
  onFormChange: (data: Omit<TransitionRule, 'id'>) => void;
  onSave: () => void;
  onCancel: () => void;
  isNew: boolean;
}

function RuleForm({ formData, onFormChange, onSave, onCancel, isNew }: RuleFormProps) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="border-2 border-primary rounded-lg p-4 bg-primary/5"
    >
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label htmlFor="current-state" className="text-xs">Current State</Label>
            <Input
              id="current-state"
              value={formData.currentState}
              onChange={(e) => onFormChange({ ...formData, currentState: e.target.value })}
              placeholder="q0"
              className="h-8 font-mono"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="read-symbol" className="text-xs">Read Symbol</Label>
            <Input
              id="read-symbol"
              value={formData.readSymbol}
              onChange={(e) => onFormChange({ ...formData, readSymbol: e.target.value })}
              placeholder="0"
              className="h-8 font-mono"
              maxLength={3}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label htmlFor="new-state" className="text-xs">New State</Label>
            <Input
              id="new-state"
              value={formData.newState}
              onChange={(e) => onFormChange({ ...formData, newState: e.target.value })}
              placeholder="q1"
              className="h-8 font-mono"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="write-symbol" className="text-xs">Write Symbol</Label>
            <Input
              id="write-symbol"
              value={formData.writeSymbol}
              onChange={(e) => onFormChange({ ...formData, writeSymbol: e.target.value })}
              placeholder="1"
              className="h-8 font-mono"
              maxLength={3}
            />
          </div>
        </div>

        <div className="space-y-1">
          <Label htmlFor="move-direction" className="text-xs">Move Direction</Label>
          <Select
            value={formData.moveDirection}
            onValueChange={(value: 'L' | 'R') => onFormChange({ ...formData, moveDirection: value })}
          >
            <SelectTrigger id="move-direction" className="h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="R">→ Right</SelectItem>
              <SelectItem value="L">← Left</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            onClick={onSave}
            size="sm"
            className="flex-1"
          >
            <Check className="w-3 h-3 mr-1" />
            {isNew ? 'Add' : 'Save'}
          </Button>
          <Button
            onClick={onCancel}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            <X className="w-3 h-3 mr-1" />
            Cancel
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
