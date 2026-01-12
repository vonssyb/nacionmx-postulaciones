import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { Shield, Key, RefreshCw, UserCheck, Users, Activity } from 'lucide-react';

const AdminPanel = () => {
    const [stats, setStats] = useState({ profiles: 0, applications: 0 });
    const [profiles, setProfiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [feedback, setFeedback] = useState(null);

    useEffect(() => {
        fetchAdminData();
    }, []);

    const fetchAdminData = async () => {
        setLoading(true);
        try {
            const { count: profileCount, data: loadedProfiles } = await supabase.from('profiles').select('*', { count: 'exact' });
            const { count: appCount } = await supabase.from('applications').select('*', { count: 'exact', head: true });

            setStats({ profiles: profileCount || 0, applications: appCount || 0 });
            setProfiles(loadedProfiles || []);
        } catch (error) {
            console.error("Admin Fetch Error:", error);
            setFeedback({ type: 'error', text: 'Error de Conexión: ' + (error.message || 'Consulta fallida') });
        } finally {
            setLoading(false);
        }
    };

    const handleLinkDiscord = async (userId, username) => {
        const discordId = prompt(`Ingresa el Discord ID para ${username}:`);
        if (!discordId) return;

        const { error } = await supabase
            .from('profiles')
            .update({ discord_id: discordId })
            .eq('id', userId);

        if (error) {
            setFeedback({ type: 'error', text: 'Error al vincular: ' + error.message });
        } else {
            setFeedback({ type: 'success', text: `✅ Discord ID vinculado a ${username}` });
            fetchAdminData();
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div>
                    <h1 style={styles.title}>Panel de Administración</h1>
                    <p style={styles.subtitle}>Gestión de usuarios y postulaciones</p>
                </div>
                <button onClick={fetchAdminData} style={styles.iconBtn} title="Recargar">
                    <RefreshCw size={20} />
                </button>
            </div>

            {loading && <div style={styles.loading}>Cargando datos del sistema...</div>}

            {feedback && (
                <div style={{ ...styles.feedback, background: feedback.type === 'error' ? '#e74c3c20' : '#2ecc7120', borderColor: feedback.type === 'error' ? '#e74c3c' : '#2ecc71' }}>
                    {feedback.text}
                </div>
            )}

            {/* Quick Stats */}
            <div style={styles.grid}>
                <div style={styles.card}>
                    <div style={styles.cardIcon}>
                        <Users size={32} color="var(--primary)" />
                    </div>
                    <div style={styles.cardContent}>
                        <h3 style={styles.cardNumber}>{stats.profiles}</h3>
                        <span style={styles.cardLabel}>Usuarios Totales</span>
                    </div>
                </div>
                <div style={styles.card}>
                    <div style={styles.cardIcon}>
                        <Activity size={32} color="#2ecc71" />
                    </div>
                    <div style={styles.cardContent}>
                        <h3 style={styles.cardNumber}>{stats.applications}</h3>
                        <span style={styles.cardLabel}>Postulaciones</span>
                    </div>
                </div>
            </div>

            {/* User Management */}
            <h2 style={styles.sectionTitle}>
                <Shield size={20} style={{ marginRight: '0.5rem' }} />
                Gestión de Usuarios & Discord
            </h2>
            <div style={styles.tableCard}>
                <table style={styles.table}>
                    <thead>
                        <tr style={styles.thead}>
                            <th style={{ ...styles.th, textAlign: 'left' }}>Usuario</th>
                            <th style={{ ...styles.th, textAlign: 'left' }}>Rol</th>
                            <th style={{ ...styles.th, textAlign: 'left' }}>Discord ID</th>
                            <th style={{ ...styles.th, textAlign: 'right' }}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {profiles.map(p => (
                            <tr key={p.id} style={styles.tr}>
                                <td style={styles.td}>
                                    <div style={styles.userCell}>
                                        <div style={styles.avatar}>
                                            {(p.username || p.full_name || 'U').charAt(0).toUpperCase()}
                                        </div>
                                        <span>{p.username || p.full_name || 'Sin Nombre'}</span>
                                    </div>
                                </td>
                                <td style={styles.td}>
                                    <span style={styles.badge}>{p.role || 'user'}</span>
                                </td>
                                <td style={{ ...styles.td, fontFamily: 'monospace', fontSize: '0.9rem' }}>
                                    <span style={{ color: p.discord_id ? '#2ecc71' : '#e74c3c' }}>
                                        {p.discord_id || 'Sin vincular'}
                                    </span>
                                </td>
                                <td style={{ ...styles.td, textAlign: 'right' }}>
                                    <button
                                        onClick={() => handleLinkDiscord(p.id, p.username || p.full_name)}
                                        style={styles.actionBtn}
                                        title="Vincular Discord ID"
                                    >
                                        <Key size={16} /> Vincular
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const styles = {
    container: { paddingBottom: '2rem' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' },
    title: { fontSize: '2rem', fontWeight: '800', color: 'var(--text-main)' },
    subtitle: { color: 'var(--text-muted)', marginTop: '0.25rem' },
    iconBtn: { 
        background: 'var(--bg-card)', 
        border: '1px solid var(--border)', 
        borderRadius: '8px',
        padding: '0.75rem',
        color: 'var(--text-muted)', 
        cursor: 'pointer',
        transition: '0.2s',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    grid: { 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '1.5rem', 
        marginBottom: '3rem' 
    },
    card: { 
        background: 'var(--bg-card)', 
        padding: '2rem', 
        borderRadius: '12px', 
        border: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        gap: '1.5rem',
        transition: '0.2s'
    },
    cardIcon: {
        width: '64px',
        height: '64px',
        borderRadius: '12px',
        background: 'rgba(255, 215, 0, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    cardContent: {
        flex: 1
    },
    cardNumber: {
        fontSize: '2.5rem',
        fontWeight: '900',
        color: 'var(--text-main)',
        margin: 0
    },
    cardLabel: { 
        color: 'var(--text-muted)', 
        fontSize: '0.9rem', 
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        fontWeight: '600'
    },
    sectionTitle: { 
        fontSize: '1.4rem', 
        marginBottom: '1.5rem', 
        marginTop: '2rem', 
        color: 'var(--primary)',
        fontWeight: '700',
        display: 'flex',
        alignItems: 'center'
    },
    tableCard: { 
        background: 'var(--bg-card)', 
        borderRadius: '12px', 
        border: '1px solid var(--border)', 
        overflow: 'hidden' 
    },
    table: { width: '100%', borderCollapse: 'collapse' },
    thead: {
        background: 'rgba(255, 215, 0, 0.05)',
        borderBottom: '2px solid var(--border)'
    },
    th: {
        padding: '1rem 1.5rem',
        fontWeight: '700',
        fontSize: '0.85rem',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        color: 'var(--text-muted)'
    },
    tr: { 
        borderBottom: '1px solid var(--border)',
        transition: '0.2s'
    },
    td: {
        padding: '1.25rem 1.5rem',
        color: 'var(--text-main)'
    },
    userCell: {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem'
    },
    avatar: {
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        background: 'var(--primary)',
        color: 'black',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: '900',
        fontSize: '1.1rem'
    },
    badge: { 
        background: 'rgba(255, 215, 0, 0.15)', 
        padding: '0.35rem 0.75rem', 
        borderRadius: '6px', 
        fontSize: '0.85rem',
        fontWeight: '600',
        color: 'var(--primary)',
        textTransform: 'uppercase',
        letterSpacing: '0.3px'
    },
    actionBtn: { 
        background: 'var(--primary)', 
        color: 'black', 
        border: 'none', 
        padding: '0.6rem 1.25rem', 
        borderRadius: '8px', 
        cursor: 'pointer', 
        display: 'inline-flex', 
        alignItems: 'center', 
        gap: '0.5rem', 
        fontSize: '0.9rem', 
        fontWeight: '700',
        transition: '0.2s'
    },
    feedback: { 
        padding: '1rem 1.5rem', 
        marginBottom: '1.5rem', 
        borderRadius: '8px', 
        border: '1px solid', 
        color: 'white',
        fontWeight: '600'
    },
    loading: { 
        padding: '3rem', 
        textAlign: 'center', 
        color: 'var(--text-muted)', 
        fontStyle: 'italic',
        fontSize: '1.1rem'
    }
};

export default AdminPanel;
