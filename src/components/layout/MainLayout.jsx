import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Shield, FileText, Settings, LogOut } from 'lucide-react';
import { supabase } from '../../services/supabase';
import { useDiscordMember } from '../auth/RoleGuard';
import './MainLayout.css';

const MainLayout = () => {
    const navigate = useNavigate();
    const memberData = useDiscordMember();

    const [profile, setProfile] = useState({
        username: 'Usuario',
        role: 'Miembro',
        avatar: null
    });

    useEffect(() => {
        if (memberData && memberData.user) {
            let username = memberData.nick || memberData.user.username;
            let avatar = null;
            if (memberData.user.avatar) {
                avatar = `https://cdn.discordapp.com/avatars/${memberData.user.id}/${memberData.user.avatar}.png`;
            }

            let roleLabel = 'Miembro';
            const myRoles = memberData.roles || [];

            if (myRoles.includes('1412882240991658177')) roleLabel = 'Owner';
            else if (myRoles.includes('1449856794980516032')) roleLabel = 'Co-Owner';
            else if (myRoles.includes('1412882245735420006')) roleLabel = 'Junta Directiva';
            else if (myRoles.includes('1412882248411381872')) roleLabel = 'Administrador';
            else if (myRoles.includes('1412887079612059660')) roleLabel = 'Staff';
            else if (myRoles.includes('1412887167654690908')) roleLabel = 'Staff Ent.';

            setProfile({ username, role: roleLabel, avatar });
        }
    }, [memberData]);

    const handleLogout = async () => {
        sessionStorage.clear();
        await supabase.auth.signOut();
        navigate('/login');
    };

    return (
        <div className="layout-container">
            <aside className="sidebar">
                <div className="sidebar-header">
                    <Shield size={32} color="var(--primary)" />
                    <span className="sidebar-title">NACIÓN MX</span>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Portal de Postulaciones</p>
                </div>

                <nav className="nav-links">
                    <NavLink to="/dashboard" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <FileText size={20} />
                        <span>Solicitudes</span>
                    </NavLink>
                    
                    <NavLink to="/dashboard/admin" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <Settings size={20} />
                        <span>Admin</span>
                    </NavLink>
                </nav>

                <div className="user-profile">
                    {profile.avatar ? (
                        <img src={profile.avatar} alt="Profile" className="user-avatar" />
                    ) : (
                        <div className="user-avatar-placeholder">
                            {profile.username.charAt(0)}
                        </div>
                    )}
                    <div className="user-info">
                        <h4>{profile.username}</h4>
                        <span className="user-role-badge">{profile.role}</span>
                    </div>
                    <button onClick={handleLogout} className="nav-item logout-btn" title="Cerrar Sesión">
                        <LogOut size={18} />
                    </button>
                </div>
            </aside>

            <main className="main-content">
                <Outlet />
            </main>
        </div>
    );
};

export default MainLayout;
