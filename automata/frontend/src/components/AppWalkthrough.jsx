import React, { useEffect, useMemo, useState } from 'react';
import './AppWalkthrough.css';

const steps = [
    {
        title: 'Welcome',
        content: 'This walkthrough shows where to navigate, simulate, test, and use tutorials.',
    },
    {
        title: 'Automata Tabs',
        content: 'Use these tabs to switch between DFA, NFA, PDA, CFG, TM, and Tutorial views.',
        selector: '[data-tour="automata-nav"]'
    },
    {
        title: 'Global Tools',
        content: 'Use Import/Export/Clear All for machine files and reset. Start this walkthrough any time.',
        selector: '[data-tour="header-tools"]'
    },
    {
        title: 'Load an Example',
        content: 'Pick a built-in DFA example to inspect or modify.',
        selector: '[data-tour="dfa-example-selector"]',
        automaton: 'DFA'
    },
    {
        title: 'Run a Simulation',
        content: 'Enter input, test quickly, then use Run/Step/Reset to inspect transitions.',
        selector: '[data-tour="dfa-input-controls"]',
        automaton: 'DFA'
    },
    {
        title: 'Edit the Machine',
        content: 'Use these editors for states, alphabet, transitions, and built-in example test cases.',
        selector: '[data-tour="dfa-editors"]',
        automaton: 'DFA'
    },
    {
        title: 'Concept Tutorials',
        content: 'Tutorial contains lessons and exercises; use it for concept guidance and practice.',
        selector: '[data-tour="tutorial-sidebar"]',
        automaton: 'Tutorial'
    },
    {
        title: 'Tutorial Content Area',
        content: 'Open a lesson or exercise here and track progress as you complete items.',
        selector: '[data-tour="tutorial-content"]',
        automaton: 'Tutorial'
    }
];

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const AppWalkthrough = ({ isOpen, onClose, currentAutomaton, setCurrentAutomaton }) => {
    const [stepIndex, setStepIndex] = useState(0);
    const [targetRect, setTargetRect] = useState(null);

    useEffect(() => {
        if (!isOpen) {
            setStepIndex(0);
        }
    }, [isOpen]);

    const currentStep = useMemo(() => steps[stepIndex], [stepIndex]);

    useEffect(() => {
        if (!isOpen || !currentStep) return;
        if (currentStep.automaton && currentAutomaton !== currentStep.automaton) {
            setCurrentAutomaton(currentStep.automaton);
        }
    }, [isOpen, currentStep, currentAutomaton, setCurrentAutomaton]);

    useEffect(() => {
        if (!isOpen || !currentStep?.selector) {
            setTargetRect(null);
            return;
        }

        const updateTarget = () => {
            const target = document.querySelector(currentStep.selector);
            if (!target) {
                setTargetRect(null);
                return;
            }
            target.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
            const rect = target.getBoundingClientRect();
            setTargetRect(rect);
        };

        const timer = setTimeout(updateTarget, 180);
        window.addEventListener('resize', updateTarget);
        window.addEventListener('scroll', updateTarget, true);

        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', updateTarget);
            window.removeEventListener('scroll', updateTarget, true);
        };
    }, [isOpen, currentStep]);

    if (!isOpen) return null;

    const nextStep = () => {
        if (stepIndex === steps.length - 1) {
            onClose();
            return;
        }
        setStepIndex((idx) => idx + 1);
    };

    const prevStep = () => setStepIndex((idx) => Math.max(0, idx - 1));

    let cardStyle = {};
    if (targetRect) {
        const cardWidth = 340;
        const viewportPadding = 16;
        const left = clamp(targetRect.left, viewportPadding, window.innerWidth - cardWidth - viewportPadding);
        const topCandidate = targetRect.bottom + 12;
        const top = topCandidate + 220 > window.innerHeight
            ? Math.max(viewportPadding, targetRect.top - 236)
            : topCandidate;
        cardStyle = { left: `${left}px`, top: `${top}px` };
    } else {
        cardStyle = { left: '50%', top: '50%', transform: 'translate(-50%, -50%)' };
    }

    return (
        <div className="tour-overlay" role="dialog" aria-modal="true" aria-label="App walkthrough">
            {targetRect && (
                <div
                    className="tour-highlight"
                    style={{
                        top: `${targetRect.top - 6}px`,
                        left: `${targetRect.left - 6}px`,
                        width: `${targetRect.width + 12}px`,
                        height: `${targetRect.height + 12}px`
                    }}
                />
            )}

            <div className="tour-card" style={cardStyle}>
                <div className="tour-card-top">
                    <span className="tour-step-count">Step {stepIndex + 1} / {steps.length}</span>
                    <button className="tour-skip-btn" onClick={onClose}>Skip</button>
                </div>
                <h3>{currentStep.title}</h3>
                <p>{currentStep.content}</p>
                <div className="tour-actions">
                    <button onClick={prevStep} disabled={stepIndex === 0}>Back</button>
                    <button onClick={nextStep}>{stepIndex === steps.length - 1 ? 'Finish' : 'Next'}</button>
                </div>
            </div>
        </div>
    );
};

export default AppWalkthrough;
