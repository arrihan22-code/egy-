'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useDirection } from '../contexts/DirectionContext';

const NOTIF_API = process.env.NEXT_PUBLIC_NOTIFICATIONS_API || 'http://localhost:3090/api/v1/notifications';

interface Notification {
  id: string;
  type: string;
  title: string;
  body?: string;
  isRead: boolean;
  createdAt: string;
}

const typeIcons: Record<string, string> = {
  alert: '\u26A0\uFE0F',
  promo: '\u{1F389}',
  info: '\u2139\uFE0F',
};

export default function NotificationBell() {
  const { user } = useAuth();
  const { direction, t } = useDirection();
  const userId = user?.id;
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!userId) return;
    const fetchNotifs = () => {
      fetch(`${NOTIF_API}/${userId}?unreadOnly=true&limit=5`)
        .then(r => r.json())
        .then(d => { setNotifications(d.data || []); setUnread(d.meta?.unread || 0); })
        .catch(() => {});
    };
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 30000);
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => { clearInterval(interval); document.removeEventListener('mousedown', handleClickOutside); };
  }, [userId]);

  const handleMarkRead = async (id: string) => {
    await fetch(`${NOTIF_API}/${id}/read`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    setUnread(prev => Math.max(0, prev - 1));
  };

  const handleMarkAllRead = async () => {
    await fetch(`${NOTIF_API}/${userId}/read-all`, { method: 'PUT' });
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnread(0);
  };

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        className="btn btn-icon btn-ghost"
        aria-label={t('Notifications', 'الإشعارات')}
        style={{ position: 'relative' }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unread > 0 && (
          <span style={{
            position: 'absolute',
            top: 2,
            insetInlineEnd: 2,
            minWidth: 16,
            height: 16,
            borderRadius: '8px',
            background: 'var(--error)',
            color: 'white',
            fontSize: '10px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 4px',
            boxShadow: '0 0 0 2px var(--surface)',
          }}>
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          className="scale-in"
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            insetInlineEnd: 0,
            width: '340px',
            background: 'var(--surface-elevated)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-xl)',
            boxShadow: 'var(--shadow-xl)',
            zIndex: 100,
            maxHeight: '420px',
            overflow: 'auto',
          }}
        >
          <div style={{
            padding: 'var(--space-4) var(--space-5)',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'sticky',
            top: 0,
            background: 'var(--surface-elevated)',
          }}>
            <strong style={{ fontSize: 'var(--text-sm)' }}>{t('Notifications', 'الإشعارات')}</strong>
            {unread > 0 && (
              <button onClick={handleMarkAllRead} className="btn btn-sm btn-ghost" style={{ fontSize: 'var(--text-xs)', color: 'var(--primary)' }}>
                {t('Mark all read', 'تحديد الكل كمقروء')}
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto var(--space-3)', opacity: 0.4 }}>
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              {t('No notifications', 'لا توجد إشعارات')}
            </div>
          ) : (
            notifications.map(n => (
              <div
                key={n.id}
                onClick={() => !n.isRead && handleMarkRead(n.id)}
                role="button"
                tabIndex={0}
                onKeyDown={e => { if (e.key === 'Enter' && !n.isRead) handleMarkRead(n.id); }}
                style={{
                  padding: 'var(--space-4) var(--space-5)',
                  cursor: 'pointer',
                  background: n.isRead ? 'transparent' : 'var(--primary-light)',
                  borderBottom: '1px solid var(--border-light)',
                  transition: 'background var(--transition-fast)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-2)' }}>
                  <div style={{ fontWeight: n.isRead ? 400 : 600, fontSize: 'var(--text-sm)' }}>{n.title}</div>
                  <span style={{ fontSize: '1rem', flexShrink: 0 }}>{typeIcons[n.type] || '\u2139\uFE0F'}</span>
                </div>
                {n.body && <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: 'var(--space-1)', lineHeight: 'var(--leading-relaxed)' }}>{n.body}</div>}
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginTop: 'var(--space-2)' }}>
                  {new Date(n.createdAt).toLocaleDateString(direction === 'rtl' ? 'ar-EG' : 'en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
