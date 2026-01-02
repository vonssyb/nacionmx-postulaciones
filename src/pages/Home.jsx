import { getDiscordAuthUrl, getSavedUser } from '../services/discord'
import { useNavigate } from 'react-router-dom'
import './Home.css'

export default function Home() {
    const navigate = useNavigate()
    const savedUser = getSavedUser()

    const handleLogin = () => {
        if (savedUser) {
            navigate('/apply')
        } else {
            window.location.href = getDiscordAuthUrl()
        }
    }

    return (
        <div className="home-container">
            <div className="hero-section">
                <div className="hero-content">
                    <h1 className="hero-title">
                        <span className="gradient-text">Únete al Staff</span>
                        <br />
                        de Nación MX
                    </h1>

                    <p className="hero-description">
                        ¿Tienes lo que se necesita para ser parte del equipo? Postúlate ahora
                        y ayúdanos a construir la mejor comunidad de roleplay en Roblox.
                    </p>

                    <button onClick={handleLogin} className="btn-primary">
                        <img
                            src="https://cdn.prod.website-files.com/6257adef93867e50d84d30e2/636e0a6ca814282eca7172c6_icon_clyde_white_RGB.svg"
                            alt="Discord"
                            className="discord-icon"
                        />
                        {savedUser ? 'Ir a Postulación' : 'Iniciar con Discord'}
                    </button>

                    <div className="features">
                        <div className="feature-card">
                            <span className="feature-icon">📋</span>
                            <h3>Proceso Simple</h3>
                            <p>Formulario rápido y fácil de completar</p>
                        </div>

                        <div className="feature-card">
                            <span className="feature-icon">⚡</span>
                            <h3>Respuesta Rápida</h3>
                            <p>Revisamos postulaciones en 24-48 horas</p>
                        </div>

                        <div className="feature-card">
                            <span className="feature-icon">🎯</span>
                            <h3>Requisitos Claros</h3>
                            <p>Sabemos exactamente lo que buscamos</p>
                        </div>
                    </div>

                    <div className="requirements">
                        <h2>Requisitos Mínimos</h2>
                        <ul>
                            <li>✅ Tener al menos 13 años de edad</li>
                            <li>✅ Cuenta de Discord y Roblox activas</li>
                            <li>✅ Disponibilidad mínima de 5 horas semanales</li>
                            <li>✅ Experiencia en roleplay (deseable)</li>
                            <li>✅ Actitud positiva y ganas de aprender</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}
