import React, { createContext, useContext, useEffect } from 'react';
import { notificationManager } from '../utils/NotificationManager';
import { useHabits } from '../hooks/useHabits';

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
    const { habits, history } = useHabits();

    useEffect(() => {
        const initNotifications = () => {
            notificationManager.requestPermission();
        };
        window.addEventListener('click', initNotifications, { once: true });

        // Check routine every minute
        const interval = setInterval(() => {
            if (habits.length > 0) {
                notificationManager.checkRoutine(habits, history);
            }
        }, 60000);

        return () => {
            window.removeEventListener('click', initNotifications);
            clearInterval(interval);
        };
    }, [habits, history]);

    return (
        <NotificationContext.Provider value={{ notificationManager }}>
            {children}
        </NotificationContext.Provider>
    );
};
