import { useState, useEffect } from 'react'
import { getApplications, updateApplicationStatus, getApplicationQuestions } from '../services/supabase'
import { getSavedUser } from '../services/discord'
import StatusBadge from '../components/StatusBadge'
import './Admin.css'

export default function Admin() {
    const [applications, setApplications] = useState([])
    const [questions, setQuestions] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedApp, setSelectedApp] = useState(null)
    const [filter, setFilter] = useState('pending')
    const [reviewNotes, setReviewNotes] = useState('')
    const [rejectReason, setRejectReason] = useState('')
    const currentUser = getSavedUser()

    useEffect(() => {
        loadData()
    }, [filter])

    const loadData = async () => {
        setLoading(true)
        const apps = await getApplications({ status: filter })
        const qs = await getApplicationQuestions()
        setApplications(apps)
        setQuestions(qs)
        setLoading(false)
    }

    const handleAction = async (appId, newStatus) => {
        if (!window.confirm(`¿Estás seguro de que deseas cambiar el estado a ${newStatus.toUpperCase()}?`)) return

        const updateData = {
            status: newStatus,
            reviewed_by: currentUser.user.id,
            reviewed_by_username: currentUser.user.username,
            review_notes: reviewNotes,
            reject_reason: newStatus === 'rejected' ? rejectReason : null
        }

        const result = await updateApplicationStatus(appId, updateData)
        if (result.success) {
            setSelectedApp(null)
            setReviewNotes('')
            setRejectReason('')
            loadData()
            alert('Estado actualizado correctamente.')
        } else {
            alert('Error: ' + result.error)
        }
    }

    if (loading) return <div className="admin-loading">Cargando base de datos táctica...</div>

    return (
        <div className="admin-container animation-fade-in">
            <div className="admin-header">
                <h1>PANEL DE CONTROL: RECLUTAMIENTO</h1>
                <div className="admin-filters">
                    <button className={filter === 'pending' ? 'active' : ''} onClick={() => setFilter('pending')}>PENDIENTES</button>
                    <button className={filter === 'under_review' ? 'active' : ''} onClick={() => setFilter('under_review')}>EN REVISIÓN</button>
                    <button className={filter === 'approved' ? 'active' : ''} onClick={() => setFilter('approved')}>APROBADAS</button>
                    <button className={filter === 'rejected' ? 'active' : ''} onClick={() => setFilter('rejected')}>RECHAZADAS</button>
                    <button className={filter === '' ? 'active' : ''} onClick={() => setFilter('')}>TODAS</button>
                </div>
            </div>

            <div className="admin-content">
                <div className="app-list-side">
                    <div className="list-header">
                        <span>Candidatos ({applications.length})</span>
                    </div>
                    <div className="app-items">
                        {applications.length === 0 ? (
                            <div className="no-apps">No hay postulaciones en esta categoría.</div>
                        ) : (
                            applications.map(app => (
                                <div
                                    key={app.id}
                                    className={`app-card ${selectedApp?.id === app.id ? 'selected' : ''}`}
                                    onClick={() => setSelectedApp(app)}
                                >
                                    <div className="app-card-info">
                                        <strong>{app.discord_username}</strong>
                                        <span>{app.roblox_username || 'Sin Roblox'}</span>
                                    </div>
                                    <StatusBadge status={app.status} />
                                    <div className="app-card-date">{new Date(app.created_at).toLocaleDateString()}</div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="app-detail-side">
                    {selectedApp ? (
                        <div className="detail-view animation-slide-in">
                            <div className="detail-header">
                                <h2>Expediente: {selectedApp.discord_username}</h2>
                                <div className="detail-meta">
                                    <span>ID: {selectedApp.id.slice(0, 8)}</span>
                                    <span>Recibida: {new Date(selectedApp.created_at).toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="detail-sections">
                                <div className="detail-group">
                                    <h3>IDENTIDAD FEDERAL</h3>
                                    <div className="detail-row">
                                        <span>Roblox:</span>
                                        <strong>{selectedApp.roblox_display_name} (@{selectedApp.roblox_username})</strong>
                                    </div>
                                    <div className="detail-row">
                                        <span>Discord:</span>
                                        <strong>{selectedApp.discord_username} ({selectedApp.discord_id})</strong>
                                    </div>
                                </div>

                                {questions.reduce((acc, q) => {
                                    const sectionTitle = q.section_title || 'General'
                                    if (!acc[sectionTitle]) acc[sectionTitle] = []
                                    acc[sectionTitle].push(q)
                                    return acc
                                }, {}).entries ? null : null /* Hack for iteration if needed */}

                                {Object.entries(
                                    questions.reduce((acc, q) => {
                                        const sectionTitle = q.section_title || 'General'
                                        if (!acc[sectionTitle]) acc[sectionTitle] = []
                                        acc[sectionTitle].push(q)
                                        return acc
                                    }, {})
                                ).map(([section, qs]) => (
                                    <div key={section} className="detail-group">
                                        <h3>{section.toUpperCase()}</h3>
                                        {qs.map(q => (
                                            <div key={q.id} className="detail-q-row">
                                                <span className="q-label">{q.question_text}:</span>
                                                <div className="q-answer">{selectedApp[q.question_key] || <i>No respondido</i>}</div>
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>

                            {selectedApp.status === 'pending' || selectedApp.status === 'under_review' ? (
                                <div className="review-actions">
                                    <div className="notes-box">
                                        <label>Notas Internas (Solo staff):</label>
                                        <textarea
                                            value={reviewNotes}
                                            onChange={(e) => setReviewNotes(e.target.value)}
                                            placeholder="Escribe comentarios para otros reclutadores..."
                                        />
                                    </div>
                                    <div className="reject-box">
                                        <label>Motivo de Rechazo (Visible al usuario):</label>
                                        <textarea
                                            value={rejectReason}
                                            onChange={(e) => setRejectReason(e.target.value)}
                                            placeholder="Explica por qué se rechaza la postulación..."
                                        />
                                    </div>
                                    <div className="action-buttons">
                                        <button className="btn-approve" onClick={() => handleAction(selectedApp.id, 'approved')}>APROBAR CANDIDATO</button>
                                        <button className="btn-reject" onClick={() => handleAction(selectedApp.id, 'rejected')}>RECHAZAR</button>
                                    </div>
                                </div>
                            ) : (
                                <div className="review-completion-info">
                                    <h3>REVISIÓN FINALIZADA</h3>
                                    <div className="detail-row">
                                        <span>Estado:</span>
                                        <StatusBadge status={selectedApp.status} />
                                    </div>
                                    <div className="detail-row">
                                        <span>Revisado por:</span>
                                        <strong>{selectedApp.reviewed_by_username || 'Desconocido'}</strong>
                                    </div>
                                    <div className="detail-row">
                                        <span>Fecha:</span>
                                        <strong>{selectedApp.reviewed_at ? new Date(selectedApp.reviewed_at).toLocaleString() : 'N/A'}</strong>
                                    </div>
                                    {selectedApp.review_notes && (
                                        <div className="detail-row vertical">
                                            <span>Notas:</span>
                                            <p>{selectedApp.review_notes}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="empty-detail">
                            <div className="eagle-icon">🦅</div>
                            <h2>SISTEMA NACIONAL DE SELECCIÓN</h2>
                            <p>Selecciona un expediente de la izquierda para comenzar la auditoría táctica.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
