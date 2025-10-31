import React from 'react';
import './Layout.css';

const getToolboxButtons = (automatonType) => {
    // Keep only essential buttons - editors handle state/transition management
    const commonTools = [
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
                </nav>
            </header>

            <div className="main-content">
                <aside className="sidebar-compact">
                    <div className="toolbox-compact">
                        <h3>Tools</h3>
                        <div className="tool-buttons">
                            {getToolboxButtons(currentAutomaton).map((tool, index) => (
                                <button 
                                    key={index}
                                    onClick={() => window.dispatchEvent(new CustomEvent(tool.event, { detail: tool.data }))}
                                    className="tool-btn-compact"
                                    title={tool.description}
                                >
                                    {tool.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </aside>

                <main className="workspace">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout; 