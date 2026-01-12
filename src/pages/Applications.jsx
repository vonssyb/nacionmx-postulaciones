import React, { useState, useEffect } from 'react';
import { FileText, CheckCircle, XCircle, Eye, Calendar, User } from 'lucide-react';
import { supabase } from '../services/supabase';

const Applications = () => {
    const [applications, setApplications] = useState([]);
    const [selectedApp, setSelectedApp] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('applications')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) console.error(error);
        else setApplications(data || []);
        setLoading(false);
    };

    const handleUpdateStatus = async (id, newStatus) => {
        const { error } = await supabase
            .from('applications')
            .update({ status: newStatus })
            .eq('id', id);

        if (!error) {
            fetchApplications();
            setSelectedApp(null);
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            pending: { bg: '#f39c1220', color: '#f39c12', icon: <Calendar size={14} /> },
            approved: { bg: '#2ecc7120', color: '#2ecc71', icon: <CheckCircle size={14} /> },
            rejected: { bg: '#e74c3c20', color: '#e74c3c', icon: <XCircle size={14} /> }
        };
        const s = styles[status] || styles.pending;
        return (
            <span style={{ 
                background: s.bg, 
                color: s.color, 
                padding: '0.4rem 0.8rem', 
                borderRadius: '6px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.85rem',
                fontWeight: '700',
                textTransform: 'uppercase'
            }}>
                {s.icon} {status}
            </span>
        );
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div>
                    <h1 style={styles.title}>Postulaciones de Staff</h1>
                    <p style={styles.subtitle}>Revisa y gestiona las solicitudes recibidas</p>
                </div>
            </div>

            {loading ? (
                <div style={styles.loading}>Cargando postulaciones...</div>
            ) : applications.length === 0 ? (
                <div style={styles.empty}>
                    <FileText size={64} color="var(--text-muted)" />
                    <p>No se han recibido postulaciones aún</p>
                </div>
            ) : (
                <div style={styles.grid}>
                    {applications.map(app => {
                        const formData = typeof app.form_data === 'string' ? JSON.parse(app.form_data) : app.form_data;
                        return (
                            <div key={app.id} style={styles.card}>
                                <div style={styles.cardHeader}>
                                    <div style={styles.avatarWrap}>
                                        <div style={styles.avatar}>
                                            {app.applicant_username?.charAt(0).toUpperCase() || 'A'}
                                        </div>
                                        <div>
                                            <h3 style={styles.name}>{app.applicant_username}</h3>
                                            <span style={styles.date}>
                                                <Calendar size={14} /> {new Date(app.created_at).toLocaleDateString('es-MX')}
                                            </span>
                                        </div>
                                    </div>
                                    {getStatusBadge(app.status)}
                                </div>
                                <div style={styles.cardBody}>
                                    <div style={styles.infoRow}>
                                        <span style={styles.label}>Tipo:</span>
                                        <span style={styles.value}>{app.type}</span>
                                    </div>
                                    <div style={styles.infoRow}>
                                        <span style={styles.label}>Edad:</span>
                                        <span style={styles.value}>{formData?.edad || 'N/A'}</span>
                                    </div>
                                    <div style={styles.infoRow}>
                                        <span style={styles.label}>Experiencia:</span>
                                        <span style={styles.value}>{formData?.experiencia || 'N/A'}</span>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedApp(app)} style={styles.viewBtn}>
                                    <Eye size={16} /> Ver Detalles
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modal */}
            {selectedApp && (
                <div style={styles.overlay} onClick={() => setSelectedApp(null)}>
                    <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div style={styles.modalHeader}>
                            <h2>Detalles de Postulación</h2>
                            <button onClick={() => setSelectedApp(null)} style={styles.closeBtn}>✕</button>
                        </div>
                        <div style={styles.modalBody}>
                            <div style={styles.detailSection}>
                                <h3>Información Personal</h3>
                                <p><strong>Nombre:</strong> {selectedApp.applicant_username}</p>
                                <p><strong>Estado:</strong> {getStatusBadge(selectedApp.status)}</p>
                            </div>
                            {selectedApp.form_data && (
                                <div style={styles.detailSection}>
                                    <h3>Respuestas</h3>
                                    {Object.entries(typeof selectedApp.form_data === 'string' ? JSON.parse(selectedApp.form_data) : selectedApp.form_data).map(([key, val]) => (
                                        <p key={key}><strong>{key}:</strong> {val}</p>
                                    ))}
                                </div>
                            )}
                        </div>
                        {selectedApp.status === 'pending' && (
                            <div style={styles.modalActions}>
                                <button onClick={() => handleUpdateStatus(selectedApp.id, 'approved')} style={{ ...styles.actionBtn, background: '#2ecc71' }}>
                                    <CheckCircle size={18} /> Aprobar
                                </button>
                                <button onClick={() => handleUpdateStatus(selectedApp.id, 'rejected')} style={{ ...styles.actionBtn, background: '#e74c3c' }}>
                                    <XCircle size={18} /> Rechazar
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

const styles = {
    container: { paddingBottom: '2rem' },
    header: { marginBottom: '2rem' },
    title: { fontSize: '2rem', fontWeight: '800', color: 'var(--text-main)' },
    subtitle: { color: 'var(--text-muted)', marginTop: '0.25rem' },
    loading: { textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', fontSize: '1.1rem' },
    empty: { textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' },
    card: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.5rem', transition: '0.2s' },
    cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' },
    avatarWrap: { display: 'flex', gap: '1rem', alignItems: 'center' },
    avatar: { width: '48px', height: '48px', borderRadius: '50%', background: 'var(--primary)', color: 'black', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '1.25rem' },
    name: { fontSize: '1.1rem', fontWeight: '700', margin: 0 },
    date: { fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' },
    cardBody: { marginBottom: '1.25rem' },
    infoRow: { display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border)' },
    label: { color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: '600' },
    value: { fontWeight: '700' },
    viewBtn: { width: '100%', background: 'var(--primary)', color: 'black', border: 'none', padding: '0.75rem', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: '0.2s' },
    overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
    modal: { background: 'var(--bg-card)', borderRadius: '16px', maxWidth: '700px', width: '90%', maxHeight: '85vh', overflow: 'auto', border: '1px solid var(--border)' },
    modalHeader: { padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    closeBtn: { background: 'transparent', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-muted)' },
    modalBody: { padding: '1.5rem' },
    detailSection: { marginBottom: '1.5rem' },
    modalActions: { padding: '1.5rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '1rem' },
    actionBtn: { flex: 1, padding: '0.85rem', borderRadius: '8px', border: 'none', color: 'white', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }
};

export default Applications;
