import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

const ToastContext = createContext(null);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

const ToastItem = ({ id, type, message, onClose }) => {
    const [existing, setExisting] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setExisting(true); // Trigger exit animation
            setTimeout(() => onClose(id), 300); // Remove after animation
        }, 4000); // 4 seconds duration

        return () => clearTimeout(timer);
    }, [id, onClose]);

    const icons = {
        success: <CheckCircle size={20} className="text-green-500" />,
        error: <AlertCircle size={20} className="text-red-500" />,
        info: <Info size={20} className="text-blue-500" />
    };

    const styles = {
        success: 'border-green-500/20 bg-green-500/10 text-green-100',
        error: 'border-red-500/20 bg-red-500/10 text-red-100',
        info: 'border-blue-500/20 bg-blue-500/10 text-blue-100'
    };

    return (
        <div
            className={`
                flex items-center gap-3 p-4 rounded-xl border backdrop-blur-md shadow-lg transition-all duration-300 transform
                ${styles[type] || styles.info}
                ${existing ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'}
            `}
            role="alert"
        >
            {icons[type]}
            <p className="text-sm font-medium">{message}</p>
            <button onClick={() => onClose(id)} className="ml-auto p-1 hover:bg-white/10 rounded-full transition-colors">
                <X size={16} className="opacity-70" />
            </button>
        </div>
    );
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback(({ type = 'info', message }) => {
        const id = Date.now().toString();
        setToasts(prev => [...prev, { id, type, message }]);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    // Helper functions
    const toast = {
        success: (message) => addToast({ type: 'success', message }),
        error: (message) => addToast({ type: 'error', message }),
        info: (message) => addToast({ type: 'info', message })
    };

    return (
        <ToastContext.Provider value={toast}>
            {children}
            <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
                <div className="flex flex-col gap-3 pointer-events-auto">
                    {toasts.map(t => (
                        <ToastItem
                            key={t.id}
                            {...t}
                            onClose={removeToast}
                        />
                    ))}
                </div>
            </div>
        </ToastContext.Provider>
    );
};
