import React, { useState, useEffect } from 'react';
import { FileText, CheckCircle, XCircle, Eye, Calendar, User, History, MessageSquare, AlertCircle, Save, Trash2 } from 'lucide-react';
import { supabase } from '../services/supabase';
import QuestionReview from '../components/QuestionReview';
import { useToast } from '../components/ui/Toast';
import BackToHome from '../components/BackToHome';

const Applications = () => {
    const toast = useToast();
    const [applications, setApplications] = useState([]);
    const [selectedApp, setSelectedApp] = useState(null);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [history, setHistory] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [actionState, setActionState] = useState(null); // 'approve' | 'reject' | null
    const [notes, setNotes] = useState('');
    const [reason, setReason] = useState('');
    const [processing, setProcessing] = useState(false);

    // Grading State
    const [reviewScores, setReviewScores] = useState({});
    const [reviewNotes, setReviewNotes] = useState({});
    const [questionBank, setQuestionBank] = useState([]);

    useEffect(() => {
        const loadQuestions = async () => {
            const { data } = await supabase.from('test_questions').select('question, correct_answer');
            if (data) setQuestionBank(data);
        };
        loadQuestions();
    }, []);

    useEffect(() => {
        fetchApplications();
    }, []);

    useEffect(() => {
        if (selectedApp) {
            if (selectedApp.applicant_discord_id) fetchHistory(selectedApp.applicant_discord_id);
            setNotes(selectedApp.internal_notes || '');
            setReason(selectedApp.rejection_reason || '');

            // Reset grading state
            setReviewScores({});
            setReviewNotes({});
            setActionState(null);
        }
    }, [selectedApp]);

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

    const fetchHistory = async (discordId) => {
        setHistoryLoading(true);
        const { data } = await supabase
            .from('applications')
            .select('*')
            .eq('applicant_discord_id', discordId)
            .neq('id', selectedApp?.id) // Exclude current
            .order('created_at', { ascending: false });

        setHistory(data || []);
        setHistoryLoading(false);
    };

    const handleUpdateStatus = async () => {
        if (!selectedApp || !actionState) return;

        setProcessing(true);

        const newStatus = actionState === 'approve' ? 'approved' : 'rejected';
        const { data: { user } } = await supabase.auth.getUser();

        // Get Staff Name from Metadata
        const staffName = user?.user_metadata?.full_name ||
            user?.user_metadata?.name ||
            user?.user_metadata?.user_name ||
            user?.email?.split('@')[0] ||
            'Staff';

        // Calculate score summary if mapped
        const totalScore = Object.values(reviewScores).reduce((acc, s) => acc + (s === 'correct' ? 1 : s === 'partial' ? 0.5 : 0), 0);
        const maxScore = Object.keys(reviewScores).length;

        let finalNotes = notes;
        // Prefix grading score to notes logic check passed

        // ... (existing logic preservation, only updating processed_by line effectively below in full block replace if needed, but here targeted)
        // Wait, replace tool needs contiguous context. I need to capture the 'processed_by' line in updateData object.

        // Actually, let's target the separate blocks.
        // Block 1: The 'updateData' construction (Lines 74-92)
        // Block 2: The render of Discord ID (Line 319)

        // Let's do Block 1 first.
        // Can't do multiple unrelated blocks in one replace if non-contiguous.
        // I will do Block 1 (handleUpdateStatus) first.
        const pct = maxScore > 0 ? ((totalScore / maxScore) * 100).toFixed(1) : 0;

        let finalNotes = notes;
        if (maxScore > 0) {
            finalNotes = `[Calificación: ${totalScore}/${maxScore} (${pct}%)]\n\n${notes}`;
        }

        const updateData = {
            status: newStatus,
            internal_notes: finalNotes,
            rejection_reason: actionState === 'reject' ? reason : null,
            processed_by: staffName, // Changed from email
            processed_at: new Date().toISOString()
        };

        const { error } = await supabase
            .from('applications')
            .update(updateData)
            .eq('id', selectedApp.id);

        if (!error) {
            // Send status notification webhook to applicant
            const webhookUrl = import.meta.env.VITE_DISCORD_WEBHOOK_URL;
            if (webhookUrl) {
                try {
                    const statusColor = newStatus === 'approved' ? 0x57F287 : 0xED4245; // Verde o Rojo
                    const statusEmoji = newStatus === 'approved' ? '✅' : '❌';
                    const statusTitle = newStatus === 'approved' ? 'Postulación Aprobada' : 'Postulación Rechazada';

                    let description = newStatus === 'approved'
                        ? `¡Felicidades! Tu postulación para **Staff** ha sido **APROBADA**.`
                        : `Tu postulación para **Staff** ha sido **RECHAZADA**.`;

                    const fields = [
                        { name: '👤 Candidato', value: `<@${selectedApp.discord_id}>`, inline: true },
                        { name: '🎮 Roblox', value: selectedApp.roblox_username, inline: true }
                    ];

                    if (maxScore > 0) {
                        fields.push({
                            name: '📊 Calificación',
                            value: `${totalScore}/${maxScore} (${pct}%)`,
                            inline: true
                        });
                    }

                    if (newStatus === 'rejected' && reason) {
                        fields.push({
                            name: '📝 Razón',
                            value: reason,
                            inline: false
                        });
                    }

                    await fetch(webhookUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            content: `<@${selectedApp.discord_id}>`, // Mention the user
                            embeds: [{
                                title: `${statusEmoji} ${statusTitle}`,
                                description,
                                color: statusColor,
                                fields,
                                footer: { text: 'Sistema de Postulaciones | Nación MX' },
                                timestamp: new Date().toISOString()
                            }]
                        })
                    });
                } catch (webhookError) {
                    console.error('Error sending status webhook:', webhookError);
                }
            }

            // If approved, trigger role assignment via bot webhook
            if (newStatus === 'approved') {
                try {
                    const response = await fetch(`${import.meta.env.VITE_BOT_WEBHOOK_URL || 'http://localhost:3001'}/api/assign-postulante-role`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${import.meta.env.VITE_BOT_API_KEY || 'default'}`
                        },
                        body: JSON.stringify({
                            discord_user_id: selectedApp.applicant_discord_id,
                            application_id: selectedApp.id
                        })
                    });

                    if (!response.ok) {
                        console.error('Failed to assign role via webhook');
                        toast.info('Aplicación aprobada, pero el rol no pudo ser asignado automáticamente. Usa /aceptar postu en Discord.');
                    } else {
                        toast.success('¡Aplicación aprobada y rol asignado correctamente!');
                    }
                } catch (webhookError) {
                    console.error('Webhook error:', webhookError);
                    toast.info('Aplicación aprobada, pero el rol no pudo ser asignado automáticamente. Usa /aceptar postu en Discord.');
                }
            } else {
                toast.success('Postulación rechazada correctamente.');
            }

            fetchApplications();
            setSelectedApp(null);
        } else {
            toast.error('Error actualizando: ' + error.message);
        }
        setProcessing(false);
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
                <div style={styles.grid}>
                    {[1, 2, 3].map(i => (
                        <div key={i} style={{ ...styles.card, height: '200px' }} className="animate-pulse">
                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }}></div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ height: '20px', width: '60%', background: 'rgba(255,255,255,0.1)', marginBottom: '8px', borderRadius: '4px' }}></div>
                                    <div style={{ height: '14px', width: '40%', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }}></div>
                                </div>
                            </div>
                            <div style={{ height: '14px', width: '100%', background: 'rgba(255,255,255,0.1)', marginBottom: '8px', borderRadius: '4px' }}></div>
                            <div style={{ height: '14px', width: '80%', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }}></div>
                        </div>
                    ))}
                </div>
            ) : applications.length === 0 ? (
                <div style={styles.empty}>
                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '2rem', borderRadius: '50%', marginBottom: '1.5rem', display: 'inline-flex' }}>
                        <FileText size={48} color="var(--text-muted)" />
                    </div>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>Sin postulaciones pendientes</h3>
                    <p style={{ color: 'var(--text-muted)' }}>Todo está al día por ahora.</p>
                </div>
            ) : (
                <div style={styles.grid}>
                    {applications.map(app => {
                        let appData = {};
                        try {
                            const raw = app.content || app.form_data;
                            appData = typeof raw === 'string' ? JSON.parse(raw) : raw;
                        } catch (e) { appData = {}; }

                        const edad = appData?.edad || appData?.personal_info?.edad || 'N/A';
                        const exp = appData?.experiencia || (typeof appData?.experiencia === 'string' ? appData.experiencia.substring(0, 50) + '...' : 'N/A');
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
                                        <span style={styles.label}>📋 Tipo:</span>
                                        <span style={styles.value}>{app.type}</span>
                                    </div>
                                    <div style={styles.infoRow}>
                                        <span style={styles.label}>🎂 Edad:</span>
                                        <span style={styles.value}>{edad}</span>
                                    </div>
                                    <div style={styles.infoRow}>
                                        <span style={styles.label}>💼 Experiencia:</span>
                                        <span style={{ ...styles.value, fontSize: '0.85rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{exp}</span>
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
                            <div>
                                <h2 style={{ margin: 0, marginBottom: '0.5rem' }}>Detalles de Postulación</h2>
                                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                    <span>📅 {new Date(selectedApp.created_at).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                    <span>⏱️ Hace {Math.ceil((Date.now() - new Date(selectedApp.created_at)) / (1000 * 60 * 60 * 24))} días</span>
                                    <span>🎯 {selectedApp.type.toUpperCase()}</span>
                                </div>
                            </div>
                            <button onClick={() => setSelectedApp(null)} style={styles.closeBtn}>✕</button>
                        </div>
                        <div style={styles.modalContainer}>
                            {/* LEFT SIDE: APPLICATION CONTENT */}
                            <div style={styles.modalContent}>
                                <div style={styles.detailSection}>
                                    <h3>Información Personal</h3>
                                    <p><strong>Nombre:</strong> {selectedApp.applicant_username}</p>
                                    <p><strong>Discord ID:</strong> {selectedApp.discord_id || selectedApp.applicant_discord_id}</p>
                                    <p><strong>Estado:</strong> {getStatusBadge(selectedApp.status)}</p>
                                    {selectedApp.processed_by && <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Procesado por: {selectedApp.processed_by}</p>}
                                </div>

                                {selectedApp.rejection_reason && (
                                    <div style={{ ...styles.detailSection, background: 'rgba(231, 76, 60, 0.1)', padding: '1rem', borderRadius: '8px', border: '1px solid #e74c3c' }}>
                                        <h3 style={{ color: '#e74c3c', marginTop: 0 }}>Razón de Rechazo</h3>
                                        <p style={{ margin: 0 }}>{selectedApp.rejection_reason}</p>
                                    </div>
                                )}

                                {selectedApp.internal_notes && (
                                    <div style={{ ...styles.detailSection, background: 'rgba(241, 196, 15, 0.1)', padding: '1rem', borderRadius: '8px', border: '1px solid #f1c40f' }}>
                                        <h3 style={{ color: '#f1c40f', marginTop: 0 }}>Notas Internas</h3>
                                        <p style={{ margin: 0 }}>{selectedApp.internal_notes}</p>
                                    </div>
                                )}

                                {selectedApp.content && (
                                    <div style={styles.detailSection}>
                                        <h3>Respuestas / Contenido</h3>
                                        {(() => {
                                            // Helper function to parse plain text questions
                                            const parseQuestionsFromText = (text) => {
                                                if (!text || typeof text !== 'string') return [];

                                                const questions = [];
                                                const lines = text.split('\n');
                                                let currentQ = null;
                                                let currentR = null;

                                                for (const line of lines) {
                                                    const trimmed = line.trim();

                                                    // Match Q1:, Q2:, etc.
                                                    const qMatch = trimmed.match(/^Q(\d+):\s*(.+)/);
                                                    if (qMatch) {
                                                        // Save previous Q&A if exists
                                                        if (currentQ && currentR) {
                                                            questions.push({ question: currentQ, answer: currentR });
                                                        }
                                                        currentQ = qMatch[2];
                                                        currentR = null;
                                                    }

                                                    // Match R:
                                                    const rMatch = trimmed.match(/^R:\s*(.+)/);
                                                    if (rMatch && currentQ) {
                                                        currentR = rMatch[1];
                                                    }
                                                }

                                                // Save last Q&A
                                                if (currentQ && currentR) {
                                                    questions.push({ question: currentQ, answer: currentR });
                                                }

                                                return questions;
                                            };

                                            try {
                                                const content = typeof selectedApp.content === 'string' ? JSON.parse(selectedApp.content) : selectedApp.content;

                                                // Check if content is structured JSON
                                                if (typeof content === 'object' && (content.personal_info || content.experiencia)) {
                                                    // Structured content
                                                    let parsedQuestions = [];

                                                    if (Array.isArray(content.respuestas) && content.respuestas.length > 0) {
                                                        parsedQuestions = content.respuestas;
                                                    }

                                                    return (
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                                            {content.experiencia && (<div> <h4 style={styles.subHeader}>Experiencia</h4> <p style={styles.textBlock}>{content.experiencia}</p> </div>)}
                                                            {content.motivacion && (<div> <h4 style={styles.subHeader}>Motivación</h4> <p style={styles.textBlock}>{content.motivacion}</p> </div>)}
                                                            {content.disponibilidad && (<div> <h4 style={styles.subHeader}>Disponibilidad</h4> <p style={styles.textBlock}>{content.disponibilidad}</p> </div>)}
                                                            {parsedQuestions.length > 0 && (
                                                                <div>
                                                                    <h4 style={styles.subHeader}>Test de Conocimiento</h4>
                                                                    <QuestionReview
                                                                        questions={parsedQuestions.map(q => ({
                                                                            ...q,
                                                                            correct_answer: questionBank.find(qb =>
                                                                                qb.question.trim() === (q.question || q.pregunta).trim()
                                                                            )?.correct_answer
                                                                        }))}
                                                                        scores={reviewScores}
                                                                        setScores={setReviewScores}
                                                                        notes={reviewNotes}
                                                                        setNotes={setReviewNotes}
                                                                    />
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                }
                                                else {
                                                    return Object.entries(content).map(([key, val]) => (<p key={key}><strong>{key}:</strong> {val}</p>));
                                                }
                                            } catch (e) {
                                                // Plain text format - parse it
                                                const textContent = selectedApp.content;
                                                const parsedQuestions = parseQuestionsFromText(textContent);

                                                if (parsedQuestions.length > 0) {
                                                    return (
                                                        <div>
                                                            <p style={{ whiteSpace: 'pre-wrap', marginBottom: '2rem' }}>{textContent.split('RESPUESTAS TEST STAFF:')[0]}</p>
                                                            <h4 style={styles.subHeader}>Test de Conocimiento ({parsedQuestions.length} preguntas)</h4>
                                                            <QuestionReview
                                                                questions={parsedQuestions.map(q => ({
                                                                    ...q,
                                                                    correct_answer: questionBank.find(qb =>
                                                                        qb.question.trim() === (q.question || q.pregunta).trim()
                                                                    )?.correct_answer
                                                                }))}
                                                                scores={reviewScores}
                                                                setScores={setReviewScores}
                                                                notes={reviewNotes}
                                                                setNotes={setReviewNotes}
                                                            />
                                                        </div>
                                                    );
                                                }

                                                // Fallback: just show text
                                                return <p style={{ whiteSpace: 'pre-wrap' }}>{textContent}</p>;
                                            }
                                        })()}
                                    </div>
                                )}
                            </div>

                            {/* RIGHT SIDE: HISTORY & ACTIONS */}
                            <div style={styles.modalSidebar}>
                                {/* ACTION PANEL */}
                                {selectedApp.status === 'pending' && (
                                    <div style={styles.sectionCard}>
                                        <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>Acciones</h3>

                                        {!actionState ? (
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button onClick={() => setActionState('approve')} style={{ ...styles.actionBtn, background: '#2ecc71', color: 'black' }}>
                                                    <CheckCircle size={18} /> Aprobar
                                                </button>
                                                <button onClick={() => setActionState('reject')} style={{ ...styles.actionBtn, background: '#e74c3c', color: 'white' }}>
                                                    <XCircle size={18} /> Rechazar
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="fade-in">
                                                <div style={{ marginBottom: '1rem' }}>
                                                    <label style={styles.label}>{actionState === 'approve' ? 'Notas Internas (Opcional)' : 'Razón de Rechazo (Requerido)'}</label>
                                                    {actionState === 'reject' ? (
                                                        <textarea
                                                            style={styles.textarea}
                                                            value={reason}
                                                            onChange={e => setReason(e.target.value)}
                                                            placeholder="Explica por qué se rechaza..."
                                                        ></textarea>
                                                    ) : (
                                                        <textarea
                                                            style={styles.textarea}
                                                            value={notes}
                                                            onChange={e => setNotes(e.target.value)}
                                                            placeholder="Notas para otros staffs..."
                                                        ></textarea>
                                                    )}
                                                </div>
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <button onClick={() => setActionState(null)} style={{ ...styles.actionBtn, background: 'var(--bg-dark)', border: '1px solid var(--border)' }}>
                                                        Cancelar
                                                    </button>
                                                    <button
                                                        onClick={handleUpdateStatus}
                                                        disabled={processing || (actionState === 'reject' && !reason.trim())}
                                                        style={{
                                                            ...styles.actionBtn,
                                                            background: actionState === 'approve' ? '#2ecc71' : '#e74c3c',
                                                            color: actionState === 'approve' ? 'black' : 'white',
                                                            opacity: (processing || (actionState === 'reject' && !reason.trim())) ? 0.5 : 1
                                                        }}
                                                    >
                                                        {processing ? '...' : 'Confirmar'}
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* HISTORY PANEL */}
                                <div style={styles.sectionCard}>
                                    <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <History size={18} /> Historial
                                    </h3>
                                    {historyLoading ? <p>Cargando...</p> : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                            {history.length === 0 ? <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Sin historial previo.</p> : (
                                                history.map(h => (
                                                    <div key={h.id} style={styles.historyItem}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(h.created_at).toLocaleDateString()}</span>
                                                            {getStatusBadge(h.status)}
                                                        </div>
                                                        <div style={{ fontSize: '0.85rem' }}><strong>{h.type}</strong></div>
                                                        {h.rejection_reason && <div style={{ fontSize: '0.8rem', color: '#e74c3c', marginTop: '0.25rem' }}>"{h.rejection_reason}"</div>}
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
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
    infoRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' },
    label: { color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: '600' },
    value: { fontWeight: '700' },
    viewBtn: { width: '100%', background: 'var(--primary)', color: 'black', border: 'none', padding: '0.75rem', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: '0.2s' },
    overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
    modal: { background: 'var(--bg-card)', borderRadius: '16px', maxWidth: '1100px', width: '95%', height: '85vh', display: 'flex', flexDirection: 'column', border: '1px solid var(--border)' },
    modalHeader: { padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    closeBtn: { background: 'transparent', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-muted)' },
    modalContainer: { display: 'flex', flex: 1, overflow: 'hidden' }, // Split view
    modalContent: { flex: 2, padding: '1.5rem', overflowY: 'auto' },
    modalSidebar: { flex: 1, padding: '1.5rem', background: 'var(--bg-dark)', borderLeft: '1px solid var(--border)', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' },
    detailSection: { marginBottom: '1.5rem' },
    actionBtn: { flex: 1, padding: '0.75rem', borderRadius: '8px', border: 'none', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' },
    subHeader: { color: 'var(--primary)', marginTop: 0, marginBottom: '0.5rem', fontSize: '1rem' },
    textBlock: { background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px', lineHeight: '1.6', fontSize: '0.95rem' },
    qaBlock: { marginBottom: '1rem', background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px' },
    question: { display: 'block', color: '#ffd700', marginBottom: '0.5rem', fontSize: '0.95rem' },
    answer: { margin: 0, color: '#e0e0e0', lineHeight: '1.5' },
    sectionCard: { background: 'var(--bg-card)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)' },
    textarea: { width: '100%', minHeight: '80px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '6px', color: 'white', padding: '0.5rem', fontFamily: 'inherit' },
    historyItem: { padding: '0.75rem', background: 'var(--bg)', borderRadius: '6px', border: '1px solid var(--border)' }
};

export default Applications;
