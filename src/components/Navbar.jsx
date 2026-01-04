import { Link } from 'react-router-dom'
import { getSavedUser, logout } from '../services/discord'
import './Navbar.css'

export default function Navbar() {
    const savedUser = getSavedUser()
    const user = savedUser?.user

    const handleLogout = () => {
        logout()
        // Ir a la raíz del subdirectorio del sitio
        window.location.href = window.location.pathname.split('/').slice(0, 2).join('/') + '/'
    }

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-logo">
                    <img src={`${import.meta.env.BASE_URL}logo.png`} alt="Nación MX Logo" className="logo-img" />
                    <span className="logo-text">Nación MX</span>
                </Link>

                <div className="navbar-menu">
                    <Link to="/" className="nav-link">Inicio</Link>
                    {user && <Link to="/apply" className="nav-link">Postular</Link>}
                    {user && <Link to="/status" className="nav-link">Mi Postulación</Link>}
                    {user && <Link to="/admin" className="nav-link admin-link">Admin</Link>}
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
