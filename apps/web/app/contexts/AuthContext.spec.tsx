import { render, screen } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';

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
  });

  it('should show logged in state when refresh succeeds', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: { accessToken: 'new-token', user: { id: 'user-1', phone: '+201234567890' } } }),
    });
    const { findByText } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );
    expect(await findByText('Logged in as +201234567890')).toBeInTheDocument();
  });

  it('should show not logged in when refresh fails', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ success: false, message: 'No refresh token' }),
    });
    const { findByText } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );
    expect(await findByText('Not logged in')).toBeInTheDocument();
  });
});
