import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { socket } from '../socket';
import { apiUrl } from '../config';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);

  const fetchUnreadCount = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch(`${apiUrl}/api/notifications/unread-count`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUnreadCount(data.data.count);
      }
    } catch { /* silently fail */ }
  }, []);

  const fetchNotifications = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch(`${apiUrl}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.data.notifications);
      }
    } catch { /* silently fail */ }
  }, []);

  const markAllRead = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      await fetch(`${apiUrl}/api/notifications/mark-all-read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch { /* silently fail */ }
  };

  useEffect(() => {
    fetchUnreadCount();
    fetchNotifications();

    // Escutar novas notificações em tempo real
    socket.on('newNotification', (notification) => {
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
    });

    return () => { socket.off('newNotification'); };
  }, [fetchUnreadCount, fetchNotifications]);

  return (
    <NotificationContext.Provider value={{ unreadCount, notifications, fetchNotifications, markAllRead }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
};
