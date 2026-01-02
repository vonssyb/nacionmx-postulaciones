import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getSavedUser } from '../services/discord'
import { getUserApplication } from '../services/supabase'
import StatusBadge from '../components/StatusBadge'
import './Status.css'

export default function Status() {
    const navigate = useNavigate()
    const savedUser = getSavedUser()
    const [loading, setLoading] = useState(true)
    const [application, setApplication] = useState(null)

    useEffect(() => {
        if (!savedUser) {
            navigate('/')
            return
        }

        async function fetchApplication() {
            const app = await getUserApplication(savedUser.user.id)
            setApplication(app)
            setLoading(false)
        }

        fetchApplication()
    }, [savedUser, navigate])

    if (loading) {
        return (
            <div className="status-container">
                <div className="loading">Cargando...</div>
            </div>
        )
    }

    if (!application) {
        return (
            <div className="status-container">
                <div className="no-application">
                    <h2>📋 Sin Postulación</h2>
                    <p>Aún no has enviado ninguna postulación.</p>
                    <button onClick={() => navigate('/apply')} className="btn-primary">
                        Postular Ahora
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="status-container">
            <div className="status-card">
                <h1>Estado de tu Postulación</h1>

                <div className="status-header">
                    <StatusBadge status={application.status} />
                    <span className="date">
                        Enviada el {new Date(application.created_at).toLocaleDateString('es-MX')}
                    </span>
                </div>

                <div className="application-details">
                    <h2>📝 Información Enviada</h2>

                    <div className="detail-grid">
                        <div className="detail-item">
                            <strong>Discord:</strong>
                            <span>{application.discord_username}</span>
                        </div>

                        <div className="detail-item">
                            <strong>Roblox:</strong>
                            <span>{application.roblox_username} (ID: {application.roblox_id})</span>
                        </div>

                        <div className="detail-item">
                            <strong>Edad:</strong>
                            <span>{application.age} años</span>
                        </div>

                        <div className="detail-item">
                            <strong>Zona Horaria:</strong>
                            <span>{application.timezone}</span>
                        </div>

                        <div className="detail-item">
                            <strong>Ubicación:</strong>
                            <span>{application.location}</span>
                        </div>

                        <div className="detail-item">
                            <strong>Disponibilidad:</strong>
                            <span>{application.availability}</span>
                        </div>
                    </div>

                    <div className="detail-section">
                        <strong>Experiencia:</strong>
                        <p>{application.experience}</p>
                    </div>

                    <div className="detail-section">
                        <strong>Motivación:</strong>
                        <p>{application.motivation}</p>
                    </div>

                    <div className="detail-section">
                        <strong>Respuesta a Escenario:</strong>
                        <p>{application.scenario_response}</p>
                    </div>

                    {application.additional_info && (
                        <div className="detail-section">
                            <strong>Información Adicional:</strong>
                            <p>{application.additional_info}</p>
                        </div>
                    )}
                </div>

                {application.status === 'rejected' && application.reject_reason && (
                    <div className="rejection-notice">
                        <h3>❌ Razón del Rechazo</h3>
                        <p>{application.reject_reason}</p>
                        {application.can_reapply_at && (
                            <p className="cooldown-notice">
                                Podrás volver a postularte el:{' '}
                                <strong>
                                    {new Date(application.can_reapply_at).toLocaleDateString('es-MX')}
                                </strong>
                            </p>
                        )}
                    </div>
                )}

                {application.status === 'approved' && (
                    <div className="approval-notice">
                        <h3>✅ ¡Felicidades!</h3>
                        <p>Tu postulación ha sido aprobada. Un administrador se pondrá en contacto contigo pronto.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
