import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';

/**
 * BackToHome button component - Reusable button to navigate back to landing page
 */
const BackToHome = ({ style = {}, className = '' }) => {
    const navigate = useNavigate();

    const handleGoHome = () => {
        navigate('/');
    };

    return (
        <button
            onClick={handleGoHome}
            className={`back-to-home-button ${className}`}
            style={{
                position: 'fixed',
                top: '1.5rem',
                left: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.25rem',
                background: 'rgba(30, 30, 30, 0.8)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '50px',
                color: 'white',
                fontSize: '0.9rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                zIndex: 1000,
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
                ...style
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(231, 76, 60, 0.9)';
                e.currentTarget.style.transform = 'translateX(-4px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(231, 76, 60, 0.4)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(30, 30, 30, 0.8)';
                e.currentTarget.style.transform = 'translateX(0)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
            }}
        >
            <Home size={18} />
            <span>Volver al Inicio</span>
        </button>
    );
};

export default BackToHome;
