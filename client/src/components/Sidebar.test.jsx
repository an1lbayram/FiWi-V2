import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Sidebar from './Sidebar';
import { LanguageProvider } from '../context/LanguageContext';

function renderSidebar(props = {}) {
  return render(
    <LanguageProvider>
      <Sidebar activeTab="passwords" setActiveTab={vi.fn()} {...props} />
    </LanguageProvider>
  );
}

describe('Sidebar', () => {
  it('renders all five navigation tabs', () => {
    renderSidebar();
    expect(screen.getAllByRole('button')).toHaveLength(5);
  });

  it('marks the active tab with the active-tab class', () => {
    renderSidebar({ activeTab: 'audit' });
    const buttons = screen.getAllByRole('button');
    const activeButtons = buttons.filter((b) => b.className.includes('active-tab'));
    expect(activeButtons).toHaveLength(1);
  });

  it('calls setActiveTab with the clicked tab id', async () => {
    const setActiveTab = vi.fn();
    renderSidebar({ setActiveTab });
    const user = userEvent.setup();

    const buttons = screen.getAllByRole('button');
    await user.click(buttons[2]); // "nearby" tab, third in navItems order

    expect(setActiveTab).toHaveBeenCalledWith('nearby');
  });
});
