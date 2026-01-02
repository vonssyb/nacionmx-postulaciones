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
            <div className="hero-section animation-fade-in">
                <div className="hero-badge">SISTEMA DE SEGURIDAD NACIONAL</div>

                <div className="hero-main-content">
                    <div className="hero-logo-container">
                        <img src="logo.png" alt="Nación MX Elite" className="hero-premium-logo" />
                        <div className="logo-glow"></div>
                    </div>

                    <div className="hero-text">
                        <h1 className="hero-title">
                            <span className="accent-text">POSTULACIONES</span>
                            <br />
                            STAFF NACIÓN MX
                        </h1>

                        <p className="hero-description">
                            Buscamos a los ciudadanos más capacitados para mantener el orden
                            y la excelencia en nuestra patria. ¿Tienes lo necesario para el servicio?
                        </p>

                        <div className="hero-actions">
                            <button onClick={handleLogin} className="btn-primary btn-hero">
                                <img
                                    src="https://cdn.prod.website-files.com/6257adef93867e50d84d30e2/636e0a6ca814282eca7172c6_icon_clyde_white_RGB.svg"
                                    alt="Discord"
                                    className="discord-icon"
                                />
                                {savedUser ? 'ACCEDER AL TERMINAL' : 'INGRESAR CON DISCORD'}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="features-grid">
                    <div className="glass-card feature-item">
                        <div className="feature-id">01</div>
                        <h3>MÓDULOS DE ÉLITE</h3>
                        <p>Evaluación integral de 10 secciones para medir tu disciplina y conocimientos.</p>
                    </div>
                    <div className="glass-card feature-item">
                        <div className="feature-id">02</div>
                        <h3>RESPUESTA TÁCTICA</h3>
                        <p>Nuestros oficiales de reclutamiento revisarán tu expediente en tiempo récord.</p>
                    </div>
                    <div className="glass-card feature-item">
                        <div className="feature-id">03</div>
                        <h3>SERVICIO PATRIÓTICO</h3>
                        <p>Forma parte de la estructura jerárquica más estable del roleplay en Roblox.</p>
                    </div>
                </div>

                <div className="glass-card requirements-box">
                    <div className="req-header">
                        <h2>PROTOCOLO DE REQUERIMIENTOS</h2>
                        <div className="status-indicator">SISTEMA ACTIVO</div>
                    </div>
                    <div className="req-list">
                        <div className="req-item">
                            <span className="req-check">✓</span>
                            <div>
                                <strong>REQUISITO DE EDAD</strong>
                                <p>Haber cumplido al menos 13 años (OOC).</p>
                            </div>
                        </div>
                        <div className="req-item">
                            <span className="req-check">✓</span>
                            <div>
                                <strong>REGISTRO FEDERAL</strong>
                                <p>Cuentas de Discord y Roblox vinculadas y activas.</p>
                            </div>
                        </div>
                        <div className="req-item">
                            <span className="req-check">✓</span>
                            <div>
                                <strong>DISPONIBILIDAD OPERATIVA</strong>
                                <p>Mínimo 5 horas semanales de patrullaje/admin.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
