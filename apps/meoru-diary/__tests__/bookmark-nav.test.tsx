import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { BookmarkNav } from '@/components/bookmark-nav';

const bookmarks = [
  { slug: 'spring', title: 'Spring' },
  { slug: 'summer', title: 'Summer' },
  { slug: 'about', title: 'About' },
];

describe('BookmarkNav', () => {
  it('renders one anchor per bookmark and marks the active chapter', () => {
    render(<BookmarkNav bookmarks={bookmarks} activeSlug="summer" label="Chapters" />);
    const nav = screen.getByRole('navigation', { name: 'Chapters' });
    const links = screen.getAllByRole('link');
    expect(nav).toBeInTheDocument();
    expect(links.map(link => link.getAttribute('href'))).toEqual(['#spring', '#summer', '#about']);
    expect(screen.getByRole('link', { name: 'Summer' })).toHaveAttribute('aria-current', 'location');
    expect(screen.getByRole('link', { name: 'Spring' })).not.toHaveAttribute('aria-current');
  });

  it('notifies the parent before following the anchor', async () => {
    const user = userEvent.setup();
    const onNavigate = jest.fn();
    render(<BookmarkNav bookmarks={bookmarks} activeSlug={null} label="Chapters" onNavigate={onNavigate} />);
    await user.click(screen.getByRole('link', { name: 'About' }));
    expect(onNavigate).toHaveBeenCalledWith('about');
  });
});
