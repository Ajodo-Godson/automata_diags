import React from 'react';
import './Layout.css';

const Layout = ({ children, automata, setAutomata }) => {
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
                            className={`type-btn ${automata === 'DFA' ? 'active' : ''}`}
                            onClick={() => setAutomata('DFA')}
                        >
                            DFA
                        </button>
                        <button
                            className={`type-btn ${automata === 'PDA' ? 'active' : ''}`}
                            onClick={() => setAutomata('PDA')}
                        >
                            PDA
                        </button>
                        <button
                            className={`type-btn ${automata === 'TM' ? 'active' : ''}`}
                            onClick={() => setAutomata('TM')}
                        >
                            TM
                        </button>
                        <button
                            className={`type-btn ${automata === 'CFG' ? 'active' : ''}`}
                            onClick={() => setAutomata('CFG')}
                        >
                            CFG
                        </button>
                    </div>

                    <div className="toolbox">
                        <h3>Toolbox</h3>
                        <div className="tool-buttons">
                            <button onClick={() => window.dispatchEvent(new CustomEvent('addState'))}>
                                Add State
                            </button>
                            <button onClick={() => window.dispatchEvent(new CustomEvent('addSymbol'))}>
                                Add Symbol
                            </button>
                            <button onClick={() => window.dispatchEvent(new CustomEvent('addCustomState'))}>
                                Custom State
                            </button>
                            <button onClick={() => window.dispatchEvent(new CustomEvent('addTransition'))}>
                                Add Transition
                            </button>
                            <button onClick={() => window.dispatchEvent(new CustomEvent('clearAll'))}>
                                Clear All
                            </button>
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