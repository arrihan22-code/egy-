import { render, screen, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';
import { ReactNode } from 'react';

const mockFetch = jest.fn();
global.fetch = mockFetch;

function TestComponent() {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Not logged in</div>;
  return <div>Logged in as {user.phone}</div>;
}

describe('AuthContext', () => {
  beforeEach(() => {
    mockFetch.mockReset();
    localStorage.clear();
  });

  it('should show logged in state when token exists', async () => {
    localStorage.setItem('accessToken', 'mock-token');
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: { id: 'user-1', phone: '+201234567890' } }),
    });
    const { findByText } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );
    expect(await findByText('Logged in as +201234567890')).toBeInTheDocument();
  });

  it('should show not logged in when no token', async () => {
    mockFetch.mockRejectedValueOnce(new Error('No token'));
    const { findByText } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );
    expect(await findByText('Not logged in')).toBeInTheDocument();
  });
});