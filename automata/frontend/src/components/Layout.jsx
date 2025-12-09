import React from 'react';
import './Layout.css';

const getToolboxButtons = (automatonType) => {
    // Keep only essential buttons - editors handle state/transition management
    const commonTools = [
        { label: 'Import', event: 'import', description: 'Import machine definition from JSON' },
        { label: 'Export', event: 'export', description: 'Export machine definition as JSON' },
        { label: 'Clear All', event: 'clearAll', description: 'Clear and create new machine' }
    ];

    // All automaton types use the same essential tools now
    return commonTools;
};

const Layout = ({ children, currentAutomaton, setCurrentAutomaton }) => {
    return (
        <div className="layout">
            <header className="header">
                <div className="logo-section">
                    <h1>Interactive Automata Toolkit</h1>
                </div>
                
                {/* Horizontal Automata Type Selector */}
                <nav className="automata-types-horizontal">
                    <button 
                        className={`type-btn-horizontal ${currentAutomaton === 'DFA' ? 'active' : ''}`}
                        onClick={() => setCurrentAutomaton('DFA')}
                    >
                        DFA
                    </button>
                    <button 
                        className={`type-btn-horizontal ${currentAutomaton === 'NFA' ? 'active' : ''}`}
                        onClick={() => setCurrentAutomaton('NFA')}
                    >
                        NFA
                    </button>
                    <button 
                        className={`type-btn-horizontal ${currentAutomaton === 'PDA' ? 'active' : ''}`}
                        onClick={() => setCurrentAutomaton('PDA')}
                    >
                        PDA
                    </button>
                    <button 
                        className={`type-btn-horizontal ${currentAutomaton === 'CFG' ? 'active' : ''}`}
                        onClick={() => setCurrentAutomaton('CFG')}
                    >
                        CFG
                    </button>
                    <button 
                        className={`type-btn-horizontal ${currentAutomaton === 'TM' ? 'active' : ''}`}
                        onClick={() => setCurrentAutomaton('TM')}
                    >
                        TM
                    </button>
                    <button 
                        className={`type-btn-horizontal tutorial-btn ${currentAutomaton === 'Tutorial' ? 'active' : ''}`}
                        onClick={() => setCurrentAutomaton('Tutorial')}
                    >
                        Tutorial
                    </button>
                </nav>

                {/* Tool buttons in header */}
                {currentAutomaton !== 'Tutorial' && (
                <div className="header-tools">
                    {getToolboxButtons(currentAutomaton).map((tool, index) => (
                        <button 
                            key={index}
                            onClick={() => window.dispatchEvent(new CustomEvent(tool.event, { detail: tool.data }))}
                            className="header-tool-btn"
                            title={tool.description}
                        >
                            {tool.label}
                        </button>
                    ))}
                </div>
                )}
            </header>

            <div className="main-content">
                <main className="workspace-full">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout; 