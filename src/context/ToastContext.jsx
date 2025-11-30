import React, { createContext, useContext, useState, useCallback } from 'react';
import CyberToast from '../components/CyberToast';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((type, title, message) => {
        const id = crypto.randomUUID();
        setToasts(prev => [...prev, { id, type, title, message }]);

        // Auto remove
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 5000);
    }, []);

    const removeToast = (id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    const toast = {
        success: (title, message) => addToast('success', title, message),
        error: (title, message) => addToast('error', title, message),
        info: (title, message) => addToast('info', title, message),
    };

    return (
        <ToastContext.Provider value={toast}>
            {children}
            <CyberToast toasts={toasts} removeToast={removeToast} />
        </ToastContext.Provider>
    );
};
