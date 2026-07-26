import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Counter } from '../components/counter';

describe('Counter', () => {
  it('renders with initial count of 0', () => {
    render(<Counter />);
    expect(screen.getByText('Count: 0')).toBeInTheDocument();
  });

  it('uses the shared primary variants', () => {
    render(<Counter />);

    expect(screen.getByText('Count: 0')).toHaveAttribute('data-variant', 'default');
    expect(screen.getByRole('button', { name: '-' })).toHaveAttribute('data-variant', 'outline');
    expect(screen.getByRole('button', { name: '+' })).toHaveAttribute('data-variant', 'default');
  });

  it('increments count when + button is clicked', async () => {
    const user = userEvent.setup();
    render(<Counter />);

    await user.click(screen.getByRole('button', { name: '+' }));

    expect(screen.getByText('Count: 1')).toBeInTheDocument();
  });

  it('decrements count when - button is clicked', async () => {
    const user = userEvent.setup();
    render(<Counter />);

    await user.click(screen.getByRole('button', { name: '-' }));

    expect(screen.getByText('Count: -1')).toBeInTheDocument();
  });
});
