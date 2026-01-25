import React, { useEffect, createContext, useContext } from 'react';
import { supabase } from '../../services/supabase';
import { useNavigate } from 'react-router-dom';
import { Loader } from 'lucide-react';
import { useStaffCheck } from '../../hooks/useStaffCheck';

// Context to share member data with children (MainLayout)
const DiscordContext = createContext(null);

export const useDiscordMember = () => useContext(DiscordContext);

const RoleGuard = ({ children }) => {
    const navigate = useNavigate();
    const { loading: checkingRole, isStaff, error: roleError, memberData, checkStaffStatus } = useStaffCheck();
    const [sessionLoading, setSessionLoading] = React.useState(true);

    useEffect(() => {
        let mounted = true;

        const initAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                // If no session, wait for potential Auth Callback or redirect
                // But for RoleGuard, we usually expect a session or we redirect to login
                // However, user asked for "if restricted, go back to main screen without logout"
                // If they are NOT logged in at all, they should probably go to login. 
                // BUT if they are logged in but NOT staff, they go to home.

                // Let's implement a quick check if this is a callback
                if (window.location.hash.includes('access_token')) {
                    // It's a callback, let Supabase handle it locally
                    return;
                }

                if (mounted) {
                    navigate('/login');
                }
                return;
            }

            // Valid session found, check roles
            if (mounted) {
                await checkStaffStatus(session);
                setSessionLoading(false);
            }
        };

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session) {
                await checkStaffStatus(session);
                if (mounted) setSessionLoading(false);
            } else if (event === 'SIGNED_OUT') {
                if (mounted) navigate('/login');
            }
        });

        initAuth();

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

    // If we are here, isStaff must be true (or useEffect would have redirected)
    // We render children only if authorized

    // DEBUG UI FOR UNAUTHORIZED USERS
    if (!sessionLoading && !checkingRole && !isStaff) {
        return (
            <div style={styles.center}>
                <div style={styles.card}>
                    <h1 style={{ color: '#e74c3c', fontSize: '1.5rem', marginBottom: '1rem' }}>⛔ Acceso Restringido</h1>
                    <p style={{ color: '#aaa', marginBottom: '1.5rem' }}>
                        No tienes los permisos de Staff necesarios para ver esta sección.
                    </p>

                    <div style={{ background: '#000', padding: '1rem', borderRadius: '8px', textAlign: 'left', marginBottom: '1.5rem' }}>
                        <p style={{ color: '#555', fontSize: '0.8rem', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Tus Roles Detectados (Debug):</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                            {memberData?.roles?.map(roleId => (
                                <span key={roleId} style={{ background: '#333', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem', fontFamily: 'monospace' }}>
                                    {roleId}
                                </span>
                            )) || <span style={{ color: '#888' }}>Ningún rol detectado</span>}
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button
                            onClick={() => { supabase.auth.signOut(); navigate('/login'); }}
                            style={{ ...styles.button, background: '#e74c3c' }}
                        >
                            Cerrar Sesión
                        </button>
                        <button
                            onClick={() => navigate('/')}
                            style={styles.button}
                        >
                            Volver al Inicio
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <DiscordContext.Provider value={memberData}>
            {isStaff ? children : null}
        </DiscordContext.Provider>
    );
};

const styles = {
    center: {
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-dark)',
        color: 'var(--text-main)',
    },
    card: {
        background: 'var(--bg-card)',
        padding: '2rem',
        borderRadius: '12px',
        border: '1px solid var(--border)',
        maxWidth: '500px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
    },
    button: {
        background: 'var(--bg-card-hover)',
        border: '1px solid var(--border)',
        color: 'white',
        padding: '0.75rem 1.5rem',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: 'bold'
    }
};

export default RoleGuard;
