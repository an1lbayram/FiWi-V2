import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Navbar from './Navbar';
import { LanguageProvider } from '../context/LanguageContext';
import { ThemeProvider } from '../context/ThemeContext';

function renderNavbar(props = {}) {
  return render(
    <ThemeProvider>
      <LanguageProvider>
        <Navbar
          activeConn={null}
          onRefresh={vi.fn()}
          onFullScan={vi.fn()}
          onExport={vi.fn()}
          onToggleTerminal={vi.fn()}
          {...props}
        />
      </LanguageProvider>
    </ThemeProvider>
  );
}

describe('Navbar', () => {
  it('shows "not connected" state when there is no active connection', () => {
    renderNavbar({ activeConn: null });
    expect(screen.getByText('Bağlantı Yok')).toBeInTheDocument();
  });

  it('shows the connected SSID when activeConn.connected is true', () => {
    renderNavbar({ activeConn: { connected: true, ssid: 'HomeNetwork' } });
    expect(screen.getByText('HomeNetwork')).toBeInTheDocument();
  });

  it('calls onRefresh when the refresh button is clicked', async () => {
    const onRefresh = vi.fn();
    renderNavbar({ onRefresh });
    const user = userEvent.setup();
    await user.click(screen.getByTitle('Yenile'));
    expect(onRefresh).toHaveBeenCalledTimes(1);
  });

  it('calls onExport with "json" and "csv" respectively', async () => {
    const onExport = vi.fn();
    renderNavbar({ onExport });
    const user = userEvent.setup();

    await user.click(screen.getByText('JSON'));
    await user.click(screen.getByText('CSV'));

    expect(onExport).toHaveBeenNthCalledWith(1, 'json');
    expect(onExport).toHaveBeenNthCalledWith(2, 'csv');
  });

  it('toggles the UI language when the language switcher is clicked', async () => {
    renderNavbar();
    const user = userEvent.setup();

    expect(screen.getByText('Bağlantı Yok')).toBeInTheDocument();
    await user.click(screen.getByTitle('Switch Language'));
    expect(screen.getByText('Not Connected')).toBeInTheDocument();
  });
});
