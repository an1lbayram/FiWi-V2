import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, useTheme } from './ThemeContext';

function Probe() {
  const { theme, toggleTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <button onClick={toggleTheme}>toggle</button>
    </div>
  );
}

describe('ThemeContext', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  it('defaults to dark when there is no saved preference and the OS prefers dark', () => {
    render(<ThemeProvider><Probe /></ThemeProvider>);
    expect(screen.getByTestId('theme')).toHaveTextContent('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('restores a previously saved theme from localStorage', () => {
    localStorage.setItem('fiwi-theme', 'light');
    render(<ThemeProvider><Probe /></ThemeProvider>);
    expect(screen.getByTestId('theme')).toHaveTextContent('light');
  });

  it('toggles the theme, updates the document attribute, and persists to localStorage', async () => {
    render(<ThemeProvider><Probe /></ThemeProvider>);
    const user = userEvent.setup();

    await user.click(screen.getByText('toggle'));

    expect(screen.getByTestId('theme')).toHaveTextContent('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(localStorage.getItem('fiwi-theme')).toBe('light');
  });
});
