import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ErrorPage from '../app/error';

describe('ErrorPage', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders the fallback heading and logs the error', () => {
    const error = new Error('boom');

    render(<ErrorPage error={error} reset={jest.fn()} />);

    expect(screen.getByRole('heading', { name: 'Something went wrong' })).toBeInTheDocument();
    expect(console.error).toHaveBeenCalledWith(error);
  });

  it('calls reset when "Try again" is clicked', async () => {
    const user = userEvent.setup();
    const reset = jest.fn();

    render(<ErrorPage error={new Error('boom')} reset={reset} />);

    await user.click(screen.getByRole('button', { name: 'Try again' }));

    expect(reset).toHaveBeenCalledTimes(1);
  });
});
