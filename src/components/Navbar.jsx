import { Link } from 'react-router-dom'
import { getSavedUser, logout } from '../services/discord'
import './Navbar.css'

export default function Navbar() {
    const savedUser = getSavedUser()
    const user = savedUser?.user

    const handleLogout = () => {
        logout()
        window.location.href = '/'
    }

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-logo">
                    <img src="/nacionmx-postulaciones/logo.png" alt="Nación MX Logo" className="logo-img" />
                    <span className="logo-text">Nación MX</span>
                </Link>

                <div className="navbar-menu">
                    <Link to="/" className="nav-link">Inicio</Link>
                    {user && <Link to="/apply" className="nav-link">Postular</Link>}
                    {user && <Link to="/status" className="nav-link">Mi Postulación</Link>}
                </div>

                <div className="navbar-user">
                    {user ? (
                        <div className="user-info">
                            <img src={user.avatar} alt={user.username} className="user-avatar" />
                            <span className="user-name">{user.username}</span>
                            <button onClick={handleLogout} className="btn-logout">
                                Salir
                            </button>
                        </div>
                    ) : (
                        <Link to="/" className="btn-login">
                            Iniciar Sesión
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    )
}
