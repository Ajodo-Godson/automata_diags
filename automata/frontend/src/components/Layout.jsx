import React from 'react';
import './Layout.css';

const getToolboxButtons = (automatonType) => {
    const commonTools = [
        { label: 'Clear All', event: 'clearAll', description: 'Clear current automaton' },
        { label: 'Export', event: 'export', description: 'Export automaton definition' },
        { label: 'Import', event: 'import', description: 'Import automaton definition' }
    ];

    switch (automatonType) {
        case 'DFA':
        case 'NFA':
            return [
                { label: 'Add State', event: 'addState', description: 'Add a new state' },
                { label: 'Add Transition', event: 'addTransition', description: 'Add state transition' },
                { label: 'Set Start State', event: 'setStartState', description: 'Set initial state' },
                { label: 'Toggle Accept', event: 'toggleAccept', description: 'Toggle accept state' },
                ...commonTools
            ];
        
        case 'PDA':
            return [
                { label: 'Add State', event: 'addState', description: 'Add a new state' },
                { label: 'Add Transition', event: 'addTransition', description: 'Add PDA transition' },
                { label: 'Edit Stack', event: 'editStack', description: 'Edit stack operations' },
                { label: 'Set Start State', event: 'setStartState', description: 'Set initial state' },
                ...commonTools
            ];
        
        case 'CFG':
            return [
                { label: 'Add Rule', event: 'addRule', description: 'Add grammar rule' },
                { label: 'Edit Rule', event: 'editRule', description: 'Edit existing rule' },
                { label: 'Set Start Symbol', event: 'setStartSymbol', description: 'Set start symbol' },
                { label: 'Convert to CNF', event: 'convertCNF', description: 'Convert to Chomsky Normal Form' },
                ...commonTools
            ];
        
        case 'TM':
            return [
                { label: 'Add State', event: 'addState', description: 'Add a new state' },
                { label: 'Add Transition', event: 'addTransition', description: 'Add TM transition' },
                { label: 'Edit Tape', event: 'editTape', description: 'Edit tape input' },
                { label: 'Set Start State', event: 'setStartState', description: 'Set initial state' },
                ...commonTools
            ];
        
        default:
            return commonTools;
    }
};

const Layout = ({ children, currentAutomaton, setCurrentAutomaton }) => {
    return (
        <div className="layout">
            <header className="header">
                <div className="logo-section">
                    <h1>Interactive Automata Toolkit</h1>
                </div>
                <nav className="main-nav">
                    <a href="#home">Home</a>
                    <a href="#docs">Documentation</a>
                    <a href="#help">Help</a>
                </nav>
            </header>

            <div className="main-content">
                <aside className="sidebar">
                    <div className="automata-types">
                        <h3>Automata Types</h3>
                        <button 
                            className={`type-btn ${currentAutomaton === 'DFA' ? 'active' : ''}`}
                            onClick={() => setCurrentAutomaton('DFA')}
                        >
                            DFA
                        </button>
                        <button 
                            className={`type-btn ${currentAutomaton === 'NFA' ? 'active' : ''}`}
                            onClick={() => setCurrentAutomaton('NFA')}
                        >
                            NFA
                        </button>
                        <button 
                            className={`type-btn ${currentAutomaton === 'PDA' ? 'active' : ''}`}
                            onClick={() => setCurrentAutomaton('PDA')}
                        >
                            PDA
                        </button>
                        <button 
                            className={`type-btn ${currentAutomaton === 'CFG' ? 'active' : ''}`}
                            onClick={() => setCurrentAutomaton('CFG')}
                        >
                            CFG
                        </button>
                        <button 
                            className={`type-btn ${currentAutomaton === 'TM' ? 'active' : ''}`}
                            onClick={() => setCurrentAutomaton('TM')}
                        >
                            Turing Machine
                        </button>
                    </div>

                    <div className="toolbox">
                        <h3>Toolbox</h3>
                        <div className="tool-buttons">
                            {getToolboxButtons(currentAutomaton).map((tool, index) => (
                                <button 
                                    key={index}
                                    onClick={() => window.dispatchEvent(new CustomEvent(tool.event, { detail: tool.data }))}
                                    className="tool-btn"
                                    title={tool.description}
                                >
                                    {tool.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="history">
                        <h3>History</h3>
                        <div className="history-buttons">
                            <button
                                onClick={() => window.dispatchEvent(new CustomEvent('undo'))}
                                className="history-button"
                            >
                                Undo
                            </button>
                            <button
                                onClick={() => window.dispatchEvent(new CustomEvent('redo'))}
                                className="history-button"
                            >
                                Redo
                            </button>
                        </div>
                    </div>
                </aside>

                <main className="workspace">
                    {children}
                </main>
            </div>

            <footer className="footer">
                <div className="footer-links">
                    <a href="#docs">Documentation</a>
                    <a href="#faq">FAQ</a>
                    <a href="#contact">Contact</a>
                </div>
                <div className="version">Version 0.1.2</div>
            </footer>
        </div>
    );
};

export default Layout; 