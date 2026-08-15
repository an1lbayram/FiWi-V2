import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PasswordsTab from './PasswordsTab';
import { LanguageProvider } from '../context/LanguageContext';

const profiles = [
  { name: 'Home', ssid: 'Home', password: 'SuperSecret123', authentication: 'WPA2-Personal', connectionType: 'Infrastructure' },
  { name: 'CafeOpen', ssid: 'CafeOpen', password: null, authentication: 'Open', connectionType: 'Infrastructure' }
];

function renderTab(props = {}) {
  return render(
    <LanguageProvider>
      <PasswordsTab profiles={profiles} onDeleteProfile={vi.fn()} onOpenQR={vi.fn()} {...props} />
    </LanguageProvider>
  );
}

describe('PasswordsTab', () => {
  it('renders a card for every saved profile', () => {
    renderTab();
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('CafeOpen')).toBeInTheDocument();
  });

  it('filters the profile list by SSID search term', async () => {
    renderTab();
    const user = userEvent.setup();

    await user.type(screen.getByPlaceholderText('Ağ adı (SSID) ile ara...'), 'Home');

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.queryByText('CafeOpen')).not.toBeInTheDocument();
  });

  it('hides the password behind dots until "show" is clicked', async () => {
    renderTab();
    const user = userEvent.setup();

    expect(screen.queryByText('SuperSecret123')).not.toBeInTheDocument();
    await user.click(screen.getByTitle('Şifreyi Göster'));
    expect(screen.getByText('SuperSecret123')).toBeInTheDocument();
  });

  it('copies the password to the clipboard when "copy" is clicked', async () => {
    renderTab();
    const user = userEvent.setup();
    // userEvent.setup() installs its own navigator.clipboard stub, replacing
    // whatever was there before — so the spy has to attach after that, not
    // in test/setup.js.
    const writeText = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined);

    await user.click(screen.getByText('Kopyala'));

    expect(writeText).toHaveBeenCalledWith('SuperSecret123');
  });

  it('shows an open-network label instead of a copy button when there is no password', () => {
    renderTab();
    expect(screen.getByText('Şifresiz / Açık Ağ')).toBeInTheDocument();
  });

  it('asks for confirmation before deleting, and only deletes on confirm', async () => {
    const onDeleteProfile = vi.fn();
    renderTab({ onDeleteProfile });
    const user = userEvent.setup();

    const [homeDeleteBtn] = screen.getAllByTitle('Ağı Sil');
    await user.click(homeDeleteBtn);
    expect(screen.getByText('Ağı Silmek İstediğinize Emin Misiniz?')).toBeInTheDocument();

    await user.click(screen.getByText('İptal'));
    expect(onDeleteProfile).not.toHaveBeenCalled();
    expect(screen.queryByText('Ağı Silmek İstediğinize Emin Misiniz?')).not.toBeInTheDocument();

    await user.click(screen.getAllByTitle('Ağı Sil')[0]);
    await user.click(screen.getByText('Evet, Sil'));
    expect(onDeleteProfile).toHaveBeenCalledWith('Home');
  });
});
