'use client';

import { useState, useEffect, useRef } from 'react';

const NOTIF_API = process.env.NEXT_PUBLIC_NOTIFICATIONS_API || 'http://localhost:3090/api/v1/notifications';
const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001';

interface Notification {
  id: string;
  type: string;
  title: string;
  body?: string;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`${NOTIF_API}/${DEMO_USER_ID}?unreadOnly=true&limit=5`)
      .then(r => r.json())
      .then(d => { setNotifications(d.data || []); setUnread(d.meta?.unread || 0); })
      .catch(() => {});

    const interval = setInterval(() => {
      fetch(`${NOTIF_API}/${DEMO_USER_ID}?unreadOnly=true&limit=5`)
        .then(r => r.json())
        .then(d => { setNotifications(d.data || []); setUnread(d.meta?.unread || 0); })
        .catch(() => {});
    }, 30000);

    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => { clearInterval(interval); document.removeEventListener('mousedown', handleClickOutside); };
  }, []);

  const handleMarkRead = async (id: string) => {
    await fetch(`${NOTIF_API}/${id}/read`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: DEMO_USER_ID }),
    });
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    setUnread(prev => Math.max(0, prev - 1));
  };

  const handleMarkAllRead = async () => {
    await fetch(`${NOTIF_API}/${DEMO_USER_ID}/read-all`, { method: 'PUT' });
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnread(0);
  };

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: '1.25rem',
          position: 'relative',
          padding: '0.25rem',
        }}
      >
        {'\u{1F514}'}
        {unread > 0 && (
          <span style={{
            position: 'absolute',
            top: '-2px',
            right: '-4px',
            background: '#dc2626',
            color: 'white',
            fontSize: '0.65rem',
            fontWeight: 700,
            minWidth: '16px',
            height: '16px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 3px',
          }}>
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '320px',
          background: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '0.5rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 100,
          maxHeight: '400px',
          overflow: 'auto',
        }}>
          <div style={{ padding: '0.75rem', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <strong>Notifications</strong>
            {unread > 0 && (
              <button onClick={handleMarkAllRead} style={{ fontSize: '0.75rem', color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer' }}>
                Mark all read
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280', fontSize: '0.875rem' }}>
              No notifications
            </div>
          ) : (
            notifications.map(n => (
              <div
                key={n.id}
                onClick={() => !n.isRead && handleMarkRead(n.id)}
                style={{
                  padding: '0.75rem',
                  borderBottom: '1px solid #f3f4f6',
                  cursor: 'pointer',
                  background: n.isRead ? 'white' : '#eff6ff',
                  transition: 'background 0.2s',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ fontWeight: n.isRead ? 400 : 600, fontSize: '0.875rem' }}>{n.title}</div>
                  <div style={{ fontSize: '1rem' }}>
                    {n.type === 'alert' ? '\u26A0\uFE0F' : n.type === 'promo' ? '\u{1F389}' : '\u2139\uFE0F'}
                  </div>
                </div>
                {n.body && <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.25rem' }}>{n.body}</div>}
                <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: '0.25rem' }}>
                  {new Date(n.createdAt).toLocaleDateString('ar-EG')}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
