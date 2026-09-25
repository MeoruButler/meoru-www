import { fireEvent, render, screen } from '@testing-library/react';

import { Sticker } from '@/components/sticker';
import type { Photo } from '@/lib/photos';

const photo: Photo = {
  id: 'spring/one',
  src: '/photos/spring/one.jpg',
  width: 1600,
  height: 1067,
  blurDataURL: 'data:image/webp;base64,AA==',
  dominantColor: '#989888',
  alt: 'Wet road at dawn',
  chapter: 'Spring',
  caption: 'Somewhere near Seoul',
};

describe('Sticker', () => {
  it('reserves the aspect ratio and dominant color before the image loads', () => {
    render(<Sticker photo={photo} index={3} />);
    const image = screen.getByRole('img', { name: 'Wet road at dawn' });
    const frame = image.parentElement!;
    expect(frame).toHaveStyle({ aspectRatio: '1600 / 1067', backgroundColor: '#989888' });
    expect(frame).toHaveAttribute('data-loaded', 'false');
    expect(image).toHaveAttribute('width', '1600');
    expect(image).toHaveAttribute('height', '1067');
    expect(image).toHaveAttribute('loading', 'eager');
    expect(image).toHaveAttribute('fetchpriority', 'auto');
    expect(image).toHaveClass('opacity-0');
    expect(screen.getByText('Somewhere near Seoul')).toBeInTheDocument();
  });

  it('applies a deterministic tilt from the index', () => {
    const { container, rerender } = render(<Sticker photo={photo} index={5} />);
    const figure = container.querySelector('figure')!;
    const tilt = figure.style.getPropertyValue('--tilt');
    expect(tilt).toMatch(/deg$/);
    rerender(<Sticker photo={photo} index={5} />);
    expect(figure.style.getPropertyValue('--tilt')).toBe(tilt);
  });

  it('fades the image in once it has loaded', () => {
    render(<Sticker photo={photo} index={0} priority />);
    const image = screen.getByRole('img', { name: 'Wet road at dawn' });
    expect(image).toHaveAttribute('fetchpriority', 'high');
    fireEvent.load(image);
    expect(image).toHaveClass('opacity-100');
    expect(image.parentElement).toHaveAttribute('data-loaded', 'true');
  });

  it('tags the alt text and caption with the content language when given', () => {
    const { container } = render(<Sticker photo={photo} index={2} lang="en" />);
    expect(container.querySelector('figure')).toHaveAttribute('lang', 'en');
    const { container: untagged } = render(<Sticker photo={photo} index={2} />);
    expect(untagged.querySelector('figure')).not.toHaveAttribute('lang');
  });

  it('treats an already-complete cached image as loaded on mount', () => {
    const complete = jest.spyOn(HTMLImageElement.prototype, 'complete', 'get').mockReturnValue(true);
    const naturalWidth = jest.spyOn(HTMLImageElement.prototype, 'naturalWidth', 'get').mockReturnValue(1600);
    try {
      render(<Sticker photo={{ ...photo, caption: undefined }} index={1} />);
      expect(screen.getByRole('img', { name: 'Wet road at dawn' })).toHaveClass('opacity-100');
      expect(screen.queryByRole('figure')?.querySelector('figcaption')).toBeNull();
    } finally {
      complete.mockRestore();
      naturalWidth.mockRestore();
    }
  });
});
