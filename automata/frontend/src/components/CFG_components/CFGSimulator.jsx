import React, { useState, useEffect, useCallback } from 'react';
import './stylings/CFGSimulator.css';
import { CFGControlPanel } from './CFGControlPanel';
import { CFGTestCases } from './CFGTestCases';
import { ParseTree } from './ParseTree';
import { VariablesEditor } from './VariablesEditor';
import { TerminalsEditor } from './TerminalsEditor';
import { ProductionRulesEditor } from './ProductionRulesEditor';
import { CollapsibleSection } from '../shared/CollapsibleSection';
import { useExamples } from './examples';
import { useCFG } from './useCFG';
import { validateCFGChallenge } from '../Tutorial_components/ChallengeValidator';
import { CheckCircle, XCircle, Target } from 'lucide-react';

const CFGSimulator = ({ challenge }) => {
    const { examples } = useExamples();
    const [currentExampleName, setCurrentExampleName] = useState(challenge ? null : 'balanced_parentheses');
    const [currentExampleDescription, setCurrentExampleDescription] = useState(null);
    const [validationResults, setValidationResults] = useState(null);

    // Start with a blank CFG in challenge mode
    const initialConfig = challenge ? {
        variables: ['S'],
        terminals: ['a', 'b'],
        rules: [],
        startVariable: 'S',
    } : {
        variables: examples['balanced_parentheses'].variables,
        terminals: examples['balanced_parentheses'].terminals,
        rules: examples['balanced_parentheses'].rules,
        startVariable: examples['balanced_parentheses'].startVariable,
    };

    const cfg = useCFG(initialConfig);

    const [inputString, setInputString] = useState('');
    const [derivationSteps, setDerivationSteps] = useState([]);
    const [currentStep, setCurrentStep] = useState(-1);
    const [isPlaying, setIsPlaying] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(1000);
    const [isAccepted, setIsAccepted] = useState(null);

    // Event listeners for toolbox actions
    useEffect(() => {
        const handleImport = () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';
            input.onchange = (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        try {
                            const cfgDefinition = JSON.parse(e.target.result);
                            cfg.loadCFG({
                                variables: cfgDefinition.variables || [],
                                terminals: cfgDefinition.terminals || [],
                                rules: cfgDefinition.rules || [],
                                startVariable: cfgDefinition.startVariable || 'S'
                            });
                            setCurrentExampleName(cfgDefinition.name || 'Imported CFG');
                            handleReset();
                        } catch (error) {
                            alert('Invalid JSON file or CFG definition format');
                        }
                    };
                    reader.readAsText(file);
                }
            };
            input.click();
        };

        const handleExport = () => {
            const cfgDefinition = {
                name: currentExampleName || 'Custom CFG',
                description: 'Exported CFG definition',
                variables: cfg.variables,
                terminals: cfg.terminals,
                rules: cfg.rules,
                startVariable: cfg.startVariable
            };
            const dataStr = JSON.stringify(cfgDefinition, null, 2);
            const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
            const linkElement = document.createElement('a');
            linkElement.setAttribute('href', dataUri);
            linkElement.setAttribute('download', 'cfg_definition.json');
            linkElement.click();
        };

        const handleClearAll = () => {
            if (window.confirm('Are you sure you want to clear all and start fresh?')) {
                cfg.loadCFG({ variables: ['S'], terminals: ['a', 'b'], rules: [], startVariable: 'S' });
                setCurrentExampleName(null);
                setCurrentExampleDescription(null);
                handleReset();
                setValidationResults(null);
            }
        };

        window.addEventListener('import', handleImport);
        window.addEventListener('export', handleExport);
        window.addEventListener('clearAll', handleClearAll);
        return () => {
            window.removeEventListener('import', handleImport);
            window.removeEventListener('export', handleExport);
            window.removeEventListener('clearAll', handleClearAll);
        };
    }, [cfg, currentExampleName, handleReset]);

    // Reset to blank when challenge mode is activated
    useEffect(() => {
        if (challenge) {
            cfg.loadCFG({ variables: ['S'], terminals: ['a', 'b'], rules: [], startVariable: 'S' });
            setInputString('');
            handleReset();
            setValidationResults(null);
        }
    }, [challenge]);

    // Auto-play derivation steps
    useEffect(() => {
        let timer;
        if (isPlaying && currentStep < derivationSteps.length - 1) {
            timer = setTimeout(() => { setCurrentStep(currentStep + 1); }, playbackSpeed);
        } else if (currentStep >= derivationSteps.length - 1) {
            setIsPlaying(false);
        }
        return () => clearTimeout(timer);
    }, [isPlaying, currentStep, derivationSteps.length, playbackSpeed]);

    const handleReset = useCallback(() => {
        setDerivationSteps([]);
        setCurrentStep(-1);
        setIsPlaying(false);
        setIsAccepted(null);
    }, []);

    const parseString = () => {
        // Basic parser implementation for visualization
        // In a real scenario, this would use CYK or similar
        setDerivationSteps([{ step: 0, string: cfg.startVariable, description: `Start with ${cfg.startVariable}` }]);
        setCurrentStep(0);
        setIsAccepted(null);
    };

    const loadExample = useCallback((exampleName) => {
        const example = examples[exampleName];
        if (example) {
            setCurrentExampleName(exampleName);
            setCurrentExampleDescription(example?.description || null);
            cfg.loadCFG(example);
            setInputString('');
            handleReset();
        }
    }, [examples, cfg]);

    const handleValidateChallenge = () => {
        if (!challenge || !challenge.challenge || !challenge.challenge.testCases) {
            alert('No challenge data available');
            return;
        }
        const userCFG = { variables: cfg.variables, terminals: cfg.terminals, rules: cfg.rules, startVariable: cfg.startVariable };
        const results = validateCFGChallenge(userCFG, challenge.challenge.testCases);
        setValidationResults(results);
        if (window.opener && challenge.returnTo === 'tutorial') {
            window.opener.postMessage({ type: 'CHALLENGE_RESULT', results: results }, window.location.origin);
        }
    };

    return (
        <div className="cfg-simulator-new">
            <div className="cfg-container">
                {/* Compact Challenge Header */}
                {challenge && challenge.challenge && (
                    <div className="compact-challenge-header">
                        <div className="challenge-info">
                            <Target size={20} />
                            <span><strong>Challenge:</strong> {challenge.challenge.description}</span>
                        </div>
                        <button className="validate-btn-compact" onClick={handleValidateChallenge}>
                            <CheckCircle size={16} /> Validate
                        </button>
                        {validationResults && (
                            <div className={`mini-results ${validationResults.passed === validationResults.total ? 'pass' : 'fail'}`}>
                                {validationResults.passed}/{validationResults.total} Passed
                            </div>
                        )}
                    </div>
                )}

                {!challenge && (
                    <div className="cfg-header">
                        <h1 className="cfg-title">CFG Simulator</h1>
                        <p className="cfg-subtitle">Context-Free Grammar - Derivation and parsing visualization</p>
                    </div>
                )}

                {!challenge && (
                    <div className="cfg-example-selector">
                        <label className="cfg-selector-label">Load Example:</label>
                        <div className="cfg-selector-buttons">
                            {Object.entries(examples).map(([key, example]) => (
                                <button key={key} className={`cfg-selector-btn ${currentExampleName === key ? 'active' : ''}`} onClick={() => loadExample(key)}>
                                    {example.name}
                                </button>
                            ))}
                        </div>
                        {currentExampleDescription && (
                            <div className="cfg-example-description"><strong>Description:</strong> {currentExampleDescription}</div>
                        )}
                    </div>
                )}

                <div className="cfg-grid">
                    <div className="cfg-left-col">
                        <div className="cfg-input-card">
                            <h3 className="cfg-card-title">Test Input String</h3>
                            <div className="cfg-input-group">
                                <input type="text" value={inputString} onChange={(e) => setInputString(e.target.value)} placeholder="Enter string to parse (e.g., aa)" className="cfg-input" />
                                <button onClick={parseString} className="cfg-btn cfg-btn-primary">Parse</button>
                            </div>
                            <p className="cfg-input-help">Terminals: {cfg.terminals.join(', ')}</p>
                            {isAccepted !== null && (
                                <div className={`cfg-result ${isAccepted ? 'accepted' : 'rejected'}`}>
                                    String is {isAccepted ? 'ACCEPTED' : 'REJECTED'}
                                </div>
                            )}
                        </div>

                        <CFGControlPanel
                            currentStep={currentStep}
                            totalSteps={derivationSteps.length}
                            isPlaying={isPlaying}
                            isComplete={currentStep >= 0 && currentStep === derivationSteps.length - 1}
                            isAccepted={isAccepted}
                            speed={playbackSpeed}
                            onRun={() => setIsPlaying(true)}
                            onPause={() => setIsPlaying(false)}
                            onStep={() => { if (currentStep < derivationSteps.length - 1) setCurrentStep(currentStep + 1); }}
                            onReset={handleReset}
                            onSpeedChange={setPlaybackSpeed}
                        />

                        <CollapsibleSection title="Grammar Rules" defaultOpen={true}>
                            <div className="cfg-grammar-card">
                                <div className="cfg-rules-list">
                                    {cfg.rules.map((rule, index) => (
                                        <div key={index} className="cfg-rule">
                                            <span className="cfg-rule-left">{rule.left}</span>
                                            <span className="cfg-rule-arrow">→</span>
                                            <span className="cfg-rule-right">{rule.right}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CollapsibleSection>
                    </div>

                    <div className="cfg-right-col">
                        <CollapsibleSection title="Variables Editor" defaultOpen={challenge ? true : false}>
                            <VariablesEditor cfg={cfg} onUpdate={handleReset} />
                        </CollapsibleSection>
                        <CollapsibleSection title="Terminals Editor" defaultOpen={challenge ? true : false}>
                            <TerminalsEditor cfg={cfg} onUpdate={handleReset} />
                        </CollapsibleSection>
                        <CollapsibleSection title="Production Rules Editor" defaultOpen={challenge ? true : false}>
                            <ProductionRulesEditor cfg={cfg} onUpdate={handleReset} />
                        </CollapsibleSection>
                        {!challenge && (
                            <CollapsibleSection title="Example Test Cases" defaultOpen={false}>
                                <CFGTestCases onLoadTest={(ti) => { setInputString(ti); handleReset(); }} currentExample={currentExampleName} />
                            </CollapsibleSection>
                        )}
                        <CollapsibleSection title="Parse Tree" defaultOpen={true}>
                            <div className="cfg-tree-card">
                                <ParseTree derivationSteps={derivationSteps} currentStep={currentStep} />
                            </div>
                        </CollapsibleSection>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CFGSimulator;
