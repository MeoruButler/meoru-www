import { render, screen } from '@testing-library/react';

import { LanguageSwitcher } from '@/components/language-switcher';

describe('LanguageSwitcher', () => {
  it('links every locale in its own language and marks the current one', () => {
    render(<LanguageSwitcher current="ja" label="言語" />);
    const nav = screen.getByRole('navigation', { name: '言語' });
    expect(nav).toBeInTheDocument();
    const links = screen.getAllByRole('link');
    expect(links.map(link => link.getAttribute('href'))).toEqual(['/en', '/ko', '/ja', '/zh']);
    expect(links.map(link => link.textContent)).toEqual(['English', '한국어', '日本語', '中文']);
    expect(screen.getByRole('link', { name: '日本語' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: '한국어' })).toHaveAttribute('lang', 'ko');
    expect(screen.getByRole('link', { name: '中文' })).toHaveAttribute('hreflang', 'zh-Hans');
    expect(screen.getByRole('link', { name: 'English' })).not.toHaveAttribute('aria-current');
  });
});
