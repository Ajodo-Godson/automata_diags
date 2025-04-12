import React from 'react';
import './Layout.css';

const Layout = ({ children }) => {
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
                        <button className="type-btn active">DFA</button>
                        <button className="type-btn disabled">NFA (Coming Soon)</button>
                        <button className="type-btn disabled">PDA (Coming Soon)</button>
                    </div>

                    <div className="toolbox">
                        <h3>Toolbox</h3>
                        <div className="tool-buttons">
                            <button onClick={() => window.dispatchEvent(new CustomEvent('addState'))}>
                                Add State
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
                            <button onClick={() => window.dispatchEvent(new CustomEvent('undo'))}>
                                Undo
                            </button>
                            <button onClick={() => window.dispatchEvent(new CustomEvent('redo'))}>
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