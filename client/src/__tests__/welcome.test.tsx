import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import WelcomePage from '../app/(public)/welcome/page';

describe('Welcome Page', () => {
  it('renders the welcome page', () => {
    render(<WelcomePage />);
    expect(screen.getByText('Iglesia')).toBeTruthy();
    expect(screen.getByText('CBI')).toBeTruthy();
  });
});
