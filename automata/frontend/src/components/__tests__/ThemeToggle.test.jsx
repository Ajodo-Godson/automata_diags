import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ThemeToggle from '../shared/ThemeToggle';

const STORAGE_KEY = 'automata-theme';

beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
});

describe('ThemeToggle', () => {
    test('starts on system, which sets no attribute', () => {
        render(<ThemeToggle />);
        expect(document.documentElement.getAttribute('data-theme')).toBeNull();
    });

    test('cycles system -> light -> dark -> system', async () => {
        render(<ThemeToggle />);
        const button = screen.getByRole('button');

        await userEvent.click(button);
        expect(document.documentElement.getAttribute('data-theme')).toBe('light');

        await userEvent.click(button);
        expect(document.documentElement.getAttribute('data-theme')).toBe('dark');

        await userEvent.click(button);
        expect(document.documentElement.getAttribute('data-theme')).toBeNull();
    });

    test('remembers the choice', async () => {
        const { unmount } = render(<ThemeToggle />);
        await userEvent.click(screen.getByRole('button')); // -> light
        expect(window.localStorage.getItem(STORAGE_KEY)).toBe('light');

        unmount();
        document.documentElement.removeAttribute('data-theme');
        render(<ThemeToggle />);
        expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });

    test('ignores a stored value that is not a real mode', () => {
        window.localStorage.setItem(STORAGE_KEY, 'chartreuse');
        render(<ThemeToggle />);
        expect(document.documentElement.getAttribute('data-theme')).toBeNull();
    });

    /*
     * localStorage throws in private windows and when site data is blocked;
     * the toggle must still work for the session.
     */
    test('still works when storage is unavailable', async () => {
        const getItem = jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
            throw new Error('blocked');
        });
        const setItem = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
            throw new Error('blocked');
        });

        expect(() => render(<ThemeToggle />)).not.toThrow();
        await userEvent.click(screen.getByRole('button'));
        expect(document.documentElement.getAttribute('data-theme')).toBe('light');

        getItem.mockRestore();
        setItem.mockRestore();
    });

    test('names the current mode and the next one', () => {
        render(<ThemeToggle />);
        expect(screen.getByRole('button')).toHaveAccessibleName(
            /System theme\. Switch to light theme\./i
        );
    });
});
