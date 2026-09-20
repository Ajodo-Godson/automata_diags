import React, { useCallback, useEffect, useState } from 'react';
import { Monitor, Moon, Sun } from 'lucide-react';

const STORAGE_KEY = 'automata-theme';

/**
 * Theme control.
 *
 * Three states rather than two, because "follow the system" is a real choice
 * and a plain light/dark switch silently takes it away. `system` sets no
 * attribute at all, leaving the tokens' `prefers-color-scheme` block in
 * charge; the explicit choices stamp `data-theme`, which the tokens define
 * with higher precedence so the toggle always wins.
 */
const MODES = [
    { id: 'system', label: 'System theme', Icon: Monitor },
    { id: 'light', label: 'Light theme', Icon: Sun },
    { id: 'dark', label: 'Dark theme', Icon: Moon },
];

/** localStorage throws in private windows and when site data is blocked. */
function readStoredMode() {
    try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        return MODES.some((m) => m.id === stored) ? stored : 'system';
    } catch {
        return 'system';
    }
}

function applyMode(mode) {
    const root = document.documentElement;
    if (mode === 'system') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', mode);
}

export default function ThemeToggle() {
    const [mode, setMode] = useState(readStoredMode);

    useEffect(() => {
        applyMode(mode);
        try {
            window.localStorage.setItem(STORAGE_KEY, mode);
        } catch {
            /* The choice still applies for this session. */
        }
    }, [mode]);

    const cycle = useCallback(() => {
        setMode((current) => {
            const i = MODES.findIndex((m) => m.id === current);
            return MODES[(i + 1) % MODES.length].id;
        });
    }, []);

    const active = MODES.find((m) => m.id === mode) || MODES[0];
    const next = MODES[(MODES.indexOf(active) + 1) % MODES.length];
    const { Icon } = active;

    return (
        <button
            type="button"
            className="app-tool-btn app-theme-btn"
            onClick={cycle}
            title={`${active.label} — switch to ${next.label.toLowerCase()}`}
            aria-label={`${active.label}. Switch to ${next.label.toLowerCase()}.`}
        >
            <Icon size={14} aria-hidden="true" />
        </button>
    );
}
