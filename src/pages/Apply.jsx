import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { getSavedUser } from '../services/discord'
import { getRobloxUserByUsername } from '../services/roblox'
import { getApplicationQuestions, createApplication, canUserApply } from '../services/supabase'
import './Apply.css'

export default function Apply() {
    const navigate = useNavigate()
    const savedUser = getSavedUser()

    const [loading, setLoading] = useState(true)
    const [canApply, setCanApply] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')
    const [questions, setQuestions] = useState([])
    const [currentStep, setCurrentStep] = useState(0)
    const [formData, setFormData] = useState({})

    const [robloxUsername, setRobloxUsername] = useState('')
    const [robloxData, setRobloxData] = useState(null)
    const [robloxError, setRobloxError] = useState('')
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        if (!savedUser) {
            navigate('/')
            return
        }

        async function checkEligibility() {
            try {
                const eligible = await canUserApply(savedUser.user.id)
                setCanApply(eligible)

                if (!eligible) {
                    setErrorMessage('Ya tienes una postulación activa o estás en periodo de espera.')
                }

                const questionsData = await getApplicationQuestions()
                setQuestions(questionsData)
            } catch (err) {
                console.error(err)
                setErrorMessage('Error al cargar la información. Intenta de nuevo.')
            } finally {
                setLoading(false)
            }
        }

        checkEligibility()
    }, [savedUser, navigate])

    // Grupar preguntas por secciones y ordenarlas
    const sections = useMemo(() => {
        const groups = {}
        questions.forEach(q => {
            const sectionTitle = q.section_title || 'General'
            const sectionId = q.section_id || 99
            if (!groups[sectionId]) {
                groups[sectionId] = { id: sectionId, title: sectionTitle, questions: [] }
            }
            groups[sectionId].questions.push(q)
        })

        // Ordenar secciones por ID y preguntas por order_index
        return Object.values(groups)
            .sort((a, b) => a.id - b.id)
            .map(section => ({
                ...section,
                questions: section.questions.sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
            }))
    }, [questions])

    const totalSteps = sections.length + 2 // +1 for Roblox, +1 for Final Review

    const handleRobloxVerify = async () => {
        if (!robloxUsername.trim()) {
            setRobloxError('Ingresa tu username de Roblox')
            return
        }

        setRobloxError('')
        const user = await getRobloxUserByUsername(robloxUsername)

        if (!user) {
            setRobloxError('Usuario de Roblox no encontrado')
            return
        }

        setRobloxData(user)
    }

    const handleInputChange = (questionKey, value) => {
        setFormData(prev => ({
            ...prev,
            [questionKey]: value
        }))
    }

    const validateCurrentStep = () => {
        if (currentStep === 0) {
            if (!robloxData) return 'Debes vincular tu cuenta de Roblox para continuar.'
            return null
        }

        // Si es el paso de revisión final, no hay validación
        if (currentStep === totalSteps - 1) return null

        const currentSection = sections[currentStep - 1]
        if (!currentSection) return null

        for (const question of currentSection.questions) {
            const value = formData[question.question_key]
            if (question.required && (!value || value.toString().trim() === '')) {
                return `El campo "${question.question_text}" es obligatorio.`
            }
        }
        return null
    }

    const nextStep = () => {
        const error = validateCurrentStep()
        if (error) {
            alert(error)
            return
        }
        if (currentStep < totalSteps - 1) {
            setCurrentStep(prev => prev + 1)
            window.scrollTo(0, 0)
        }
    }

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1)
            window.scrollTo(0, 0)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        const error = validateCurrentStep()
        if (error) {
            alert(error)
            return
        }

        setSubmitting(true)

        const applicationData = {
            discord_id: savedUser.user.id,
            discord_username: savedUser.user.username,
            discord_avatar: savedUser.user.avatar,
            roblox_id: robloxData.id,
            roblox_username: robloxData.username,
            roblox_display_name: robloxData.displayName,
            custom_answers: formData // Guardamos todo en el JSONB
        }

        const result = await createApplication(applicationData)

        if (result.success) {
            navigate('/status')
        } else {
            alert(`Error al enviar postulación: ${result.error}`)
            setSubmitting(false)
        }
    }

    if (loading) {
        return (
            <div className="apply-container">
                <div className="loading-spinner"></div>
                <p>Cargando sistema de seguridad...</p>
            </div>
        )
    }

    if (!canApply) {
        return (
            <div className="apply-container">
                <div className="glass-card error-status">
                    <h2>ACCESO DENEGADO</h2>
                    <p>{errorMessage}</p>
                    <button onClick={() => navigate('/')} className="btn-primary">
                        Regresar a la Base
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="apply-container">
            <div className="apply-stepper">
                <div className="progress-bar">
                    <div
                        className="progress-fill"
                        style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
                    ></div>
                </div>
                <div className="step-indicator">
                    Paso {currentStep + 1} de {totalSteps}
                </div>
            </div>

            <div className="glass-card apply-form-card">
                <form onSubmit={handleSubmit}>
                    {currentStep === 0 && (
                        <div className="step-section animation-slide-in">
                            <div className="section-header">
                                <span className="section-badge">00</span>
                                <h2>VERIFICACIÓN DE IDENTIDAD</h2>
                                <p>Vincula tu cuenta de Roblox para continuar.</p>
                            </div>

                            <div className="roblox-verify-box">
                                <div className="input-group">
                                    <label>Username de Roblox</label>
                                    <div className="input-with-button">
                                        <input
                                            type="text"
                                            value={robloxUsername}
                                            onChange={(e) => setRobloxUsername(e.target.value)}
                                            placeholder="Ingresa tu usuario"
                                            className="premium-input"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleRobloxVerify}
                                            className="btn-verify"
                                        >
                                            VERIFICAR
                                        </button>
                                    </div>
                                </div>

                                {robloxError && <p className="error-text">{robloxError}</p>}

                                {robloxData && (
                                    <div className="roblox-profile animation-fade-in">
                                        <div className="profile-check">✓</div>
                                        <div className="profile-details">
                                            <h3>{robloxData.displayName}</h3>
                                            <span>@{robloxData.username}</span>
                                            <small>ID: {robloxData.id}</small>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {currentStep > 0 && currentStep <= sections.length && (
                        <div className="step-section animation-slide-in" key={currentStep}>
                            <div className="section-header">
                                <span className="section-badge">{currentStep < 10 ? `0${currentStep}` : currentStep}</span>
                                <h2>{sections[currentStep - 1].title}</h2>
                                <p className="section-subtitle">Pregunta {sections[currentStep - 1].questions[0]?.order_index || 0} a {sections[currentStep - 1].questions[sections[currentStep - 1].questions.length - 1]?.order_index || 0}</p>
                            </div>

                            <div className="questions-grid">
                                {sections[currentStep - 1].questions.map((q) => (
                                    <div key={q.id} className="form-group premium-field-box">
                                        <label className="premium-label">
                                            {q.question_text}
                                            {q.required && <span className="req-star">*</span>}
                                        </label>

                                        {q.question_type === 'text' && (
                                            <input
                                                type="text"
                                                value={formData[q.question_key] || ''}
                                                onChange={(e) => handleInputChange(q.question_key, e.target.value)}
                                                placeholder={q.placeholder || 'Escribe tu respuesta...'}
                                                className="premium-input"
                                            />
                                        )}

                                        {q.question_type === 'number' && (
                                            <input
                                                type="number"
                                                value={formData[q.question_key] || ''}
                                                onChange={(e) => handleInputChange(q.question_key, e.target.value)}
                                                placeholder={q.placeholder || '0'}
                                                className="premium-input"
                                            />
                                        )}

                                        {q.question_type === 'textarea' && (
                                            <textarea
                                                value={formData[q.question_key] || ''}
                                                onChange={(e) => handleInputChange(q.question_key, e.target.value)}
                                                placeholder={q.placeholder || 'Desarrolla tu respuesta aquí...'}
                                                rows={4}
                                                className="premium-input premium-textarea"
                                            />
                                        )}

                                        {q.question_type === 'select' && (
                                            <select
                                                value={formData[q.question_key] || ''}
                                                onChange={(e) => handleInputChange(q.question_key, e.target.value)}
                                                className="premium-input"
                                            >
                                                <option value="">Seleccionar una opción...</option>
                                                {(q.options || q.validation_rules?.options)?.map(opt => (
                                                    <option key={opt} value={opt}>{opt}</option>
                                                ))}
                                            </select>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {currentStep === totalSteps - 1 && (
                        <div className="step-section animation-slide-in">
                            <div className="section-header">
                                <span className="section-badge">FIN</span>
                                <h2>REVISIÓN FINAL</h2>
                                <p>Por favor, revisa tus respuestas antes de enviar la postulación oficial.</p>
                            </div>

                            <div className="review-summary">
                                <div className="review-item-group">
                                    <h3>Información de Identidad</h3>
                                    <div className="review-stat">
                                        <span>Roblox:</span>
                                        <strong>{robloxData.displayName} (@{robloxData.username})</strong>
                                    </div>
                                    <div className="review-stat">
                                        <span>Discord:</span>
                                        <strong>{savedUser.user.username}</strong>
                                    </div>
                                </div>

                                {sections.map(section => (
                                    <div key={section.id} className="review-item-group">
                                        <h3>{section.title}</h3>
                                        {section.questions.map(q => (
                                            <div key={q.id} className="review-q-row">
                                                <span className="q-text">{q.question_text}:</span>
                                                <span className="q-ans">{formData[q.question_key] || <i>No respondido</i>}</span>
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>

                            <div className="warning-box glass-card">
                                <p>⚠️ Al presionar enviar, tu postulación será revisada por el equipo de Recursos Humanos. No podrás editarla posteriormente.</p>
                            </div>
                        </div>
                    )}

                    <div className="form-actions">
                        {currentStep > 0 && (
                            <button type="button" onClick={prevStep} className="btn-secondary">
                                ANTERIOR
                            </button>
                        )}

                        {currentStep < totalSteps - 1 ? (
                            <button type="button" onClick={nextStep} className="btn-primary">
                                SIGUIENTE
                            </button>
                        ) : (
                            <button type="submit" disabled={submitting} className="btn-primary btn-submit">
                                {submitting ? 'TRANSMITIENDO...' : 'ENVIAR POSTULACIÓN'}
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    )
}
