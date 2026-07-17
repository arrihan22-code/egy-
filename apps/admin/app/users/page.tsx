'use client';

import { useState, useEffect } from 'react';

const API = process.env.NEXT_PUBLIC_AUTH_API || 'http://localhost:3110/api/v1/auth';

const thStyle: React.CSSProperties = { padding: '0.5rem 0.75rem', textAlign: 'left', borderBottom: '2px solid #e5e7eb', fontSize: '0.8rem', textTransform: 'uppercase', color: '#6b7280' };
const tdStyle: React.CSSProperties = { padding: '0.5rem 0.75rem', fontSize: '0.875rem' };

interface User {
  id: string;
  phone: string;
  email?: string;
  fullName?: string;
  isVerified: boolean;
  roles: string[];
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async (p: number) => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/admin/users?page=${p}&limit=50`);
      const d = await res.json();
      setUsers(d.data || []);
      setTotal(d.meta?.total || 0);
    } catch { setUsers([]); }
    setLoading(false);
  };

  useEffect(() => { fetchUsers(page); }, [page]);

  const toggleVerify = async (id: string, current: boolean) => {
    await fetch(`${API}/admin/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isVerified: !current }),
    });
    fetchUsers(page);
  };

  const updateRoles = async (id: string, roles: string[]) => {
    await fetch(`${API}/admin/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roles }),
    });
    fetchUsers(page);
  };

  const totalPages = Math.ceil(total / 50);

  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>User Management</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={thStyle}>Phone</th>
                <th style={thStyle}>Email</th>
                <th style={thStyle}>Name</th>
                <th style={thStyle}>Verified</th>
                <th style={thStyle}>Roles</th>
                <th style={thStyle}>Created</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={tdStyle}>{u.phone}</td>
                  <td style={tdStyle}>{u.email || '-'}</td>
                  <td style={tdStyle}>{u.fullName || '-'}</td>
                  <td style={tdStyle}>
                    <span style={{ color: u.isVerified ? '#16a34a' : '#dc2626', fontWeight: 600 }}>
                      {u.isVerified ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td style={tdStyle}>{(u.roles || []).join(', ')}</td>
                  <td style={tdStyle}>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td style={tdStyle}>
                    <button onClick={() => toggleVerify(u.id, u.isVerified)} style={{ marginRight: '0.5rem', padding: '0.25rem 0.5rem', fontSize: '0.75rem', cursor: 'pointer' }}>
                      {u.isVerified ? 'Unverify' : 'Verify'}
                    </button>
                    <select
                      value={(u.roles || [])[0] || 'user'}
                      onChange={e => updateRoles(u.id, [e.target.value])}
                      style={{ padding: '0.25rem', fontSize: '0.75rem' }}
                    >
                      <option value="user">User</option>
                      <option value="moderator">Moderator</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} style={{ padding: '0.25rem 0.75rem', cursor: page <= 1 ? 'not-allowed' : 'pointer' }}>Previous</button>
            <span style={{ fontSize: '0.875rem' }}>Page {page} of {totalPages}</span>
            <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} style={{ padding: '0.25rem 0.75rem', cursor: page >= totalPages ? 'not-allowed' : 'pointer' }}>Next</button>
          </div>
        </>
      )}
    </div>
  );
}