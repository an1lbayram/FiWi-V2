import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LanguageProvider, useLanguage } from './LanguageContext';

function Probe() {
  const { lang, t, toggleLanguage } = useLanguage();
  return (
    <div>
      <span data-testid="lang">{lang}</span>
      <span data-testid="title">{t('appTitle')}</span>
      <span data-testid="refresh">{t('refresh')}</span>
      <span data-testid="unknown-key">{t('this_key_does_not_exist')}</span>
      <button onClick={toggleLanguage}>toggle</button>
    </div>
  );
}

describe('LanguageContext', () => {
  it('defaults to Turkish', () => {
    render(<LanguageProvider><Probe /></LanguageProvider>);
    expect(screen.getByTestId('lang')).toHaveTextContent('TR');
    expect(screen.getByTestId('refresh')).toHaveTextContent('Yenile');
  });

  it('switches every translated string when toggled to English', async () => {
    render(<LanguageProvider><Probe /></LanguageProvider>);
    const user = userEvent.setup();

    await user.click(screen.getByText('toggle'));

    expect(screen.getByTestId('lang')).toHaveTextContent('EN');
    expect(screen.getByTestId('refresh')).toHaveTextContent('Refresh');
  });

  it('falls back to the key itself for an unknown translation key', () => {
    render(<LanguageProvider><Probe /></LanguageProvider>);
    expect(screen.getByTestId('unknown-key')).toHaveTextContent('this_key_does_not_exist');
  });
});
