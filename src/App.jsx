import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AuthCallback from './components/auth/AuthCallback';
import LandingPage from './pages/LandingPage';
import ApplyPage from './pages/ApplyPage';
import AdminPanel from './pages/AdminPanel';
import RoleGuard from './components/auth/RoleGuard';

function App() {
  return (
    <BrowserRouter basename="/nacionmx-postulaciones">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/aplicar" element={<ApplyPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard/*" element={<Dashboard />} />
        
        {/* Direct Admin Panel Route */}
        <Route path="/admin" element={
          <RoleGuard>
            <AdminPanel />
          </RoleGuard>
        } />
        
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
