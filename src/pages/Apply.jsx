import { useState, useEffect } from 'react'
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
            const eligible = await canUserApply(savedUser.user.id)
            setCanApply(eligible)

            if (!eligible) {
                setErrorMessage('Ya tienes una postulación activa o estás en periodo de espera.')
            }

            const questionsData = await getApplicationQuestions()
            setQuestions(questionsData)
            setLoading(false)
        }

        checkEligibility()
    }, [savedUser, navigate])

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

    const validateForm = () => {
        for (const question of questions) {
            if (question.required && !formData[question.question_key]) {
                return `El campo "${question.question_text}" es obligatorio`
            }

            const rules = question.validation_rules || {}
            const value = formData[question.question_key]

            if (rules.minLength && value?.length < rules.minLength) {
                return `"${question.question_text}" debe tener al menos ${rules.minLength} caracteres`
            }

            if (rules.maxLength && value?.length > rules.maxLength) {
                return `"${question.question_text}" no puede exceder ${rules.maxLength} caracteres`
            }

            if (rules.min && value < rules.min) {
                return `"${question.question_text}" debe ser al menos ${rules.min}`
            }

            if (rules.max && value > rules.max) {
                return `"${question.question_text}" no puede ser mayor a ${rules.max}`
            }
        }

        if (!robloxData) {
            return 'Debes vincular tu cuenta de Roblox'
        }

        return null
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        const error = validateForm()
        if (error) {
            alert(error)
            return
        }

        setSubmitting(true)

        const applicationData = {
            discord_id: savedUser.user.id,
            discord_username: savedUser.user.tag,
            discord_avatar: savedUser.user.avatar,
            roblox_id: robloxData.id,
            roblox_username: robloxData.username,
            roblox_display_name: robloxData.displayName,
            ...formData,
        }

        const result = await createApplication(applicationData)

        if (result.success) {
            alert('¡Postulación enviada con éxito! Recibirás una notificación en Discord cuando sea revisada.')
            navigate('/status')
        } else {
            alert(`Error al enviar postulación: ${result.error}`)
            setSubmitting(false)
        }
    }

    if (loading) {
        return (
            <div className="apply-container">
                <div className="loading">Cargando formulario...</div>
            </div>
        )
    }

    if (!canApply) {
        return (
            <div className="apply-container">
                <div className="error-message">
                    <h2>❌ No puedes postularte</h2>
                    <p>{errorMessage}</p>
                    <button onClick={() => navigate('/')} className="btn-primary">
                        Volver al inicio
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="apply-container">
            <div className="apply-card">
                <h1>Postulación para Staff</h1>
                <p className="subtitle">Completa todos los campos requeridos</p>

                <form onSubmit={handleSubmit} className="application-form">
                    {/* Vinculación de Roblox */}
                    <div className="form-section">
                        <h2>🎮 Cuenta de Roblox</h2>
                        <div className="roblox-verify">
                            <input
                                type="text"
                                value={robloxUsername}
                                onChange={(e) => setRobloxUsername(e.target.value)}
                                placeholder="Tu username de Roblox"
                                className="input-field"
                            />
                            <button
                                type="button"
                                onClick={handleRobloxVerify}
                                className="btn-secondary"
                            >
                                Verificar
                            </button>
                        </div>

                        {robloxError && (
                            <p className="error-text">{robloxError}</p>
                        )}

                        {robloxData && (
                            <div className="roblox-verified">
                                <span className="verified-icon">✅</span>
                                <div>
                                    <strong>{robloxData.displayName}</strong> (@{robloxData.username})
                                    <br />
                                    <small>ID: {robloxData.id}</small>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Preguntas dinámicas */}
                    <div className="form-section">
                        <h2>📋 Información General</h2>
                        {questions.map((question) => (
                            <div key={question.id} className="form-group">
                                <label>
                                    {question.question_text}
                                    {question.required && <span className="required">*</span>}
                                </label>

                                {question.question_type === 'text' && (
                                    <input
                                        type="text"
                                        value={formData[question.question_key] || ''}
                                        onChange={(e) => handleInputChange(question.question_key, e.target.value)}
                                        placeholder={question.placeholder}
                                        className="input-field"
                                    />
                                )}

                                {question.question_type === 'number' && (
                                    <input
                                        type="number"
                                        value={formData[question.question_key] || ''}
                                        onChange={(e) => handleInputChange(question.question_key, e.target.value)}
                                        placeholder={question.placeholder}
                                        className="input-field"
                                    />
                                )}

                                {question.question_type === 'textarea' && (
                                    <textarea
                                        value={formData[question.question_key] || ''}
                                        onChange={(e) => handleInputChange(question.question_key, e.target.value)}
                                        placeholder={question.placeholder}
                                        rows={5}
                                        className="input-field"
                                    />
                                )}

                                {question.question_type === 'select' && (
                                    <select
                                        value={formData[question.question_key] || ''}
                                        onChange={(e) => handleInputChange(question.question_key, e.target.value)}
                                        className="input-field"
                                    >
                                        <option value="">Selecciona una opción</option>
                                        {question.validation_rules?.options?.map((option) => (
                                            <option key={option} value={option}>
                                                {option}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>
                        ))}
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="btn-primary btn-submit"
                    >
                        {submitting ? 'Enviando...' : 'Enviar Postulación'}
                    </button>
                </form>
            </div>
        </div>
    )
}
