import React from 'react';
import { Download, HelpCircle, Upload, Trash2 } from 'lucide-react';
import ThemeToggle from './shared/ThemeToggle';
import './Layout.css';

const MACHINES = [
    { id: 'DFA', label: 'DFA', title: 'Deterministic Finite Automaton' },
    { id: 'NFA', label: 'NFA', title: 'Nondeterministic Finite Automaton' },
    { id: 'PDA', label: 'PDA', title: 'Pushdown Automaton' },
    { id: 'CFG', label: 'CFG', title: 'Context-Free Grammar' },
    { id: 'TM', label: 'TM', title: 'Turing Machine' },
];

const FILE_TOOLS = [
    { event: 'import', label: 'Import', Icon: Upload, title: 'Import a machine definition from JSON' },
    { event: 'export', label: 'Export', Icon: Download, title: 'Export this machine as JSON' },
    { event: 'clearAll', label: 'Clear', Icon: Trash2, title: 'Clear the machine and start fresh' },
];

const Layout = ({ children, currentAutomaton, setCurrentAutomaton, onOpenGuide }) => {
    const isTutorial = currentAutomaton === 'Tutorial';

    return (
        <div className="app">
            <header className="app-header">
                {/*
                 * Three fixed grid zones. The tool buttons used to unmount on
                 * the Tutorial tab, which let `space-between` re-centre the nav
                 * and shifted every button ~123px sideways — clicking "TM"
                 * would land on "CFG". The zones now hold their width and the
                 * tools are only made inert, never removed.
                 */}
                <div className="app-header-start">
                    <span className="app-mark" aria-hidden="true">
                        q<sub>0</sub>
                    </span>
                    <span className="app-name">Automata Toolkit</span>
                </div>

                <nav className="app-nav" aria-label="Machine type" data-tour="automata-nav">
                    {MACHINES.map(({ id, label, title }) => (
                        <button
                            key={id}
                            type="button"
                            className={`app-nav-btn ${currentAutomaton === id ? 'is-active' : ''}`}
                            title={title}
                            aria-current={currentAutomaton === id ? 'page' : undefined}
                            onClick={() => setCurrentAutomaton(id)}
                            data-tour={id === 'DFA' ? 'nav-dfa' : undefined}
                        >
                            {label}
                        </button>
                    ))}
                    <span className="app-nav-sep" aria-hidden="true" />
                    <button
                        type="button"
                        className={`app-nav-btn ${isTutorial ? 'is-active' : ''}`}
                        onClick={() => setCurrentAutomaton('Tutorial')}
                        aria-current={isTutorial ? 'page' : undefined}
                        data-tour="nav-tutorial"
                    >
                        Learn
                    </button>
                </nav>

                <div className="app-header-end" data-tour="header-tools">
                    <div className={`app-tools ${isTutorial ? 'is-hidden' : ''}`} aria-hidden={isTutorial}>
                        {FILE_TOOLS.map(({ event, label, Icon, title }) => (
                            <button
                                key={event}
                                type="button"
                                className="app-tool-btn"
                                title={title}
                                tabIndex={isTutorial ? -1 : 0}
                                onClick={() => window.dispatchEvent(new CustomEvent(event))}
                            >
                                <Icon size={14} aria-hidden="true" />
                                <span className="app-tool-label">{label}</span>
                            </button>
                        ))}
                    </div>
                    <ThemeToggle />
                    <button
                        type="button"
                        className="app-tool-btn app-tool-btn-accent"
                        onClick={onOpenGuide}
                        title="Start the interactive walkthrough"
                    >
                        <HelpCircle size={14} aria-hidden="true" />
                        <span className="app-tool-label">Guide</span>
                    </button>
                </div>
            </header>

            <main className="app-main">{children}</main>
        </div>
    );
};

export default Layout;
