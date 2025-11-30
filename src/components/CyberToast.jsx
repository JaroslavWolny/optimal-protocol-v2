import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';
import './CyberToast.css';

const CyberToast = ({ toasts, removeToast }) => {
    return (
        <div className="toast-container">
            <AnimatePresence>
                {toasts.map((toast) => (
                    <motion.div
                        key={toast.id}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 50, scale: 0.9 }}
                        className={`cyber-toast ${toast.type}`}
                    >
                        <div className="toast-icon">
                            {toast.type === 'error' && <AlertTriangle size={20} />}
                            {toast.type === 'success' && <CheckCircle size={20} />}
                            {toast.type === 'info' && <Info size={20} />}
                        </div>
                        <div className="toast-content">
                            <div className="toast-title">{toast.title}</div>
                            <div className="toast-message">{toast.message}</div>
                        </div>
                        <div className="toast-scanline"></div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};

export default CyberToast;
