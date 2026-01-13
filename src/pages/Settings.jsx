import React, { useState, useEffect } from 'react';
import { Save, Shield, Settings as SettingsIcon, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '../services/supabase';

const Settings = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [roles, setRoles] = useState(''); // Textarea string
    const [guildId, setGuildId] = useState('');
    const [feedback, setFeedback] = useState(null);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('bot_settings')
                .select('*')
                .in('key', ['staff_approval_roles', 'staff_guild_id']);

            if (error) throw error;

            if (data) {
                const rolesConfig = data.find(s => s.key === 'staff_approval_roles');
                const guildConfig = data.find(s => s.key === 'staff_guild_id');

                if (rolesConfig && Array.isArray(rolesConfig.value)) {
                    setRoles(rolesConfig.value.join('\n'));
                }
                if (guildConfig) {
                    setGuildId(guildConfig.value); // Usually a string
                }
            }
        } catch (err) {
            console.error('Error fetching settings:', err);
            setFeedback({ type: 'error', text: 'Error al cargar configuraciones.' });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setFeedback(null);

        try {
            // Parse Roles
            const rolesArray = roles.split('\n')
                .map(r => r.trim())
                .filter(r => r.length > 0);

            // Update Roles
            const { error: errorRoles } = await supabase
                .from('bot_settings')
                .upsert({
                    key: 'staff_approval_roles',
                    value: rolesArray,
                    description: 'Roles ID list to assign when a staff application is approved',
                    updated_at: new Date().toISOString()
                });

            if (errorRoles) throw errorRoles;

            // Update Guild ID
            const { error: errorGuild } = await supabase
                .from('bot_settings')
                .upsert({
                    key: 'staff_guild_id',
                    value: guildId.trim(),
                    description: 'Guild ID where the staff roles should be assigned',
                    updated_at: new Date().toISOString()
                });

            if (errorGuild) throw errorGuild;

            setFeedback({ type: 'success', text: 'Configuración guardada correctamente.' });

        } catch (err) {
            console.error('Error saving settings:', err);
            setFeedback({ type: 'error', text: 'Error al guardar: ' + err.message });
        } finally {
            setSaving(false);
        }
    };

    const styles = {
        container: { maxWidth: '800px', margin: '0 auto' },
        header: { marginBottom: '2rem' },
        title: { fontSize: '2rem', fontWeight: '800', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.75rem' },
        subtitle: { color: 'var(--text-muted)', marginTop: '0.5rem', marginLeft: '3.5rem' },
        card: { background: 'var(--bg-card)', padding: '2rem', borderRadius: '12px', border: '1px solid var(--border)' },
        formGroup: { marginBottom: '1.5rem' },
        label: { display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: 'var(--text-main)' },
        labelDesc: { display: 'block', marginBottom: '0.75rem', fontSize: '0.9rem', color: 'var(--text-muted)' },
        input: {
            width: '100%', padding: '0.85rem', background: 'var(--bg-dark)', border: '1px solid var(--border)',
            borderRadius: '8px', color: 'white', fontFamily: 'monospace', fontSize: '1rem'
        },
        textarea: {
            width: '100%', padding: '0.85rem', background: 'var(--bg-dark)', border: '1px solid var(--border)',
            borderRadius: '8px', color: 'white', fontFamily: 'monospace', fontSize: '1rem', minHeight: '120px'
        },
        button: {
            background: 'var(--primary)', color: 'black', padding: '1rem 2rem', borderRadius: '8px',
            border: 'none', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem'
        },
        feedback: {
            padding: '1rem', borderRadius: '8px', marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold'
        }
    };

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Cargando configuración...</div>;

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>
                    <SettingsIcon size={32} color="var(--primary)" />
                    Configuración del Sistema
                </h1>
                <p style={styles.subtitle}>Gestiona las variables globales del bot y el portal.</p>
            </div>

            <div style={styles.card}>
                <form onSubmit={handleSave}>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Roles de Staff (Auto-Asignación)</label>
                        <span style={styles.labelDesc}>Ingresa un ID de rol por línea. Estos roles serán asignados automáticamente cuando se apruebe una postulación.</span>
                        <textarea
                            style={styles.textarea}
                            value={roles}
                            onChange={(e) => setRoles(e.target.value)}
                            placeholder="Ej: 1460678189104894138..."
                        />
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>ID del Servidor de Staff</label>
                        <span style={styles.labelDesc}>El ID del servidor de Discord donde se asignarán los roles (Guild ID).</span>
                        <input
                            type="text"
                            style={styles.input}
                            value={guildId}
                            onChange={(e) => setGuildId(e.target.value)}
                            placeholder="Ej: 1460059764494041211"
                        />
                    </div>

                    <button type="submit" style={styles.button} disabled={saving}>
                        <Save size={20} />
                        {saving ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </form>

                {feedback && (
                    <div style={{
                        ...styles.feedback,
                        background: feedback.type === 'error' ? 'rgba(231, 76, 60, 0.1)' : 'rgba(46, 204, 113, 0.1)',
                        color: feedback.type === 'error' ? '#e74c3c' : '#2ecc71',
                        border: `1px solid ${feedback.type === 'error' ? '#e74c3c' : '#2ecc71'}`
                    }}>
                        {feedback.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
                        {feedback.text}
                    </div>
                )}
            </div>

            <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(52, 152, 219, 0.1)', borderRadius: '12px', border: '1px solid rgba(52, 152, 219, 0.3)' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#3498db', marginTop: 0 }}>
                    <Shield size={20} /> Nota de Seguridad
                </h3>
                <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>
                    Esta configuración afecta directamente el comportamiento del Bot en tiempo real.
                    Asegúrate de verificar que los IDs de usuario y servidor sean correctos antes de guardar.
                </p>
            </div>
        </div>
    );
};

export default Settings;
