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

    // Redirect logic for unauthorized users
    useEffect(() => {
        if (!sessionLoading && !checkingRole) {
            if (!isStaff) {
                // User is logged in but not staff
                // Redirect to Home with a message
                alert("⛔ Acceso Restringido: No tienes permisos de Staff para ver esta sección.");
                navigate('/');
            }
        }
    }, [sessionLoading, checkingRole, isStaff, navigate]);

    if (sessionLoading || checkingRole) {
        return (
            <div style={styles.center}>
                <Loader size={48} className="animate-spin" color="var(--primary)" />
                <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Verificando credenciales...</p>
                <style>{`
                    .animate-spin { animation: spin 1s linear infinite; }
                    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                `}</style>
            </div>
        );
    }

    // If we are here, isStaff must be true (or useEffect would have redirected)
    // We render children only if authorized
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
    }
};

export default RoleGuard;
