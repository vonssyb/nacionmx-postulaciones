import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AuthCallback from './components/auth/AuthCallback';
import LandingPage from './pages/LandingPage';
import ApplyPage from './pages/ApplyPage';

function App() {
  return (
    <BrowserRouter basename="/nacionmx-postulaciones">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/aplicar" element={<ApplyPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard/*" element={<Dashboard />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="*" element={<LandingPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
