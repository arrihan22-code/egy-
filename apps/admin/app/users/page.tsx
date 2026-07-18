'use client';

import { useState } from 'react';

export default function UsersAdminPage() {
  const [search, setSearch] = useState('');

  const users = [
    { id: '1', name: 'Ahmed Mohamed', phone: '+20 100 123 4567', email: 'ahmed@example.com', role: 'User', verified: true, joined: '2024-01-10' },
    { id: '2', name: 'Sara Ali', phone: '+20 100 234 5678', email: 'sara@example.com', role: 'Admin', verified: true, joined: '2024-01-05' },
    { id: '3', name: 'Mohamed Hassan', phone: '+20 100 345 6789', email: 'mohamed@example.com', role: 'User', verified: false, joined: '2024-01-01' },
    { id: '4', name: 'Nour Ibrahim', phone: '+20 100 456 7890', email: 'nour@example.com', role: 'Moderator', verified: true, joined: '2023-12-20' },
  ];

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, margin: 0 }}>User Management</h1>
        <button className="btn btn-primary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          Add User
        </button>
      </div>

      <div style={{ marginBottom: 'var(--space-6)' }}>
        <input
          className="input"
          style={{ maxWidth: 320 }}
          placeholder="Search users by name, phone, or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="card" style={{ padding: 0, overflow: 'auto' }}>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Role</th>
              <th>Verified</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.filter(u => !search || u.name.includes(search) || u.phone.includes(search) || u.email.includes(search)).map(u => (
              <tr key={u.id}>
                <td style={{ fontWeight: 500 }}>{u.name}</td>
                <td dir="ltr">{u.phone}</td>
                <td style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-xs)' }}>{u.email}</td>
                <td><span className={`badge ${u.role === 'Admin' ? 'badge-info' : u.role === 'Moderator' ? 'badge-warning' : 'badge-neutral'}`}>{u.role}</span></td>
                <td>
                  {u.verified
                    ? <span className="badge badge-success">Verified</span>
                    : <span className="badge badge-failed">Unverified</span>
                  }
                </td>
                <td style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-xs)' }}>{u.joined}</td>
                <td>
                  <div style={{ display: 'flex', gap: 'var(--space-1)' }}>
                    <button className="btn btn-sm btn-ghost" title="Edit">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                    </button>
                    <button className="btn btn-sm btn-ghost" title="Delete" style={{ color: 'var(--error)' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
