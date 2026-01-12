#!/bin/bash

cat > src/pages/ApplyPage_New.jsx << 'EOF'
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { verifyRobloxUser, getRobloxAvatar } from '../services/roblox';
import { Shield, Check, AlertCircle, Loader, User, Gamepad2, ChevronRight, ChevronLeft } from 'lucide-react';
import './Apply.css';

const STEPS = [
  { id: 1, title: 'Verificación Discord', icon: Shield },
  { id: 2, title: 'Verificación Roblox', icon: Gamepad2 },
  { id: 3, title: 'Información Personal', icon: User },
  { id: 4, title: 'Experiencia', icon: Check },
  { id: 5, title: 'Revisión Final', icon: AlertCircle }
];

const ApplyPage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Discord Data (auto-filled)
  const [discordData, setDiscordData] = useState(null);

  // Roblox Data
  const [robloxUsername, setRobloxUsername] = useState('');
  const [robloxData, setRobloxData] = useState(null);
  const [verifying, setVerifying] = useState(false);

  // Form Data
  const [formData, setFormData] = useState({
    nombreCompleto: '',
    edad: '',
    zonaHoraria: '',
    recomendadoPor: '',
    experiencia: '',
    disponibilidad: '',
    motivacion: '',
    escenario_irlx: '',
    escenario_cxm: '',
    escenario_vlv: ''
  });

  // Load Discord session on mount
  useEffect(() => {
    checkDiscordAuth();
  }, []);

  const checkDiscordAuth = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      // Not logged in - redirect to Discord OAuth
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'discord',
        options: {
          redirectTo: `${window.location.origin}/nacionmx-postulaciones/aplicar`,
          scopes: 'identify guilds guilds.members.read'
        }
      });
      if (error) {
        setFeedback({ type: 'error', text: 'Error al conectar con Discord' });
      }
    } else {
      // Logged in - extract Discord data
      const user = session.user;
      setDiscordData({
        id: user.id,
        username: user.user_metadata.full_name || user.email,
        avatar: user.user_metadata.avatar_url,
        email: user.email
      });
      setLoading(false);
    }
  };

  const handleRobloxVerify = async () => {
    if (!robloxUsername.trim()) {
      setFeedback({ type: 'error', text: 'Ingresa tu nombre de usuario de Roblox' });
      return;
    }

    setVerifying(true);
    setFeedback(null);

    const result = await verifyRobloxUser(robloxUsername);

    if (result.verified) {
      const avatar = await getRobloxAvatar(result.id);
      setRobloxData({
        ...result,
        avatar
      });
      setFeedback({ type: 'success', text: '✅ Cuenta de Roblox verificada correctamente' });
    } else {
      setFeedback({ type: 'error', text: result.error });
    }

    setVerifying(false);
  };

  const handleNext = () => {
    // Validation for each step
    if (currentStep === 1 && !discordData) {
      setFeedback({ type: 'error', text: 'Debes estar autenticado con Discord' });
      return;
    }
    if (currentStep === 2 && !robloxData) {
      setFeedback({ type: 'error', text: 'Debes verificar tu cuenta de Roblox' });
      return;
    }
    if (currentStep === 3) {
      if (!formData.nombreCompleto || !formData.edad || !formData.zonaHoraria) {
        setFeedback({ type: 'error', text: 'Completa todos los campos obligatorios' });
        return;
      }
    }
    if (currentStep === 4) {
      if (!formData.experiencia || !formData.disponibilidad || !formData.motivacion) {
        setFeedback({ type: 'error', text: 'Completa todos los campos de experiencia' });
        return;
      }
      if (!formData.escenario_irlx || !formData.escenario_cxm || !formData.escenario_vlv) {
        setFeedback({ type: 'error', text: 'Debes responder los 3 escenarios' });
        return;
      }
    }

    setFeedback(null);
    setCurrentStep(currentStep + 1);
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setFeedback(null);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setFeedback(null);

    try {
      const { error } = await supabase.from('applications').insert([{
        type: 'Staff',
        applicant_username: discordData.username,
        applicant_discord_id: discordData.id,
        discord_avatar: discordData.avatar,
        status: 'pending',
        roblox_id: robloxData.id,
        roblox_verified: true,
        roblox_account_age: robloxData.accountAge,
        roblox_display_name: robloxData.displayName,
        form_data: {
          ...formData,
          robloxUsername: robloxData.username,
          discordEmail: discordData.email
        }
      }]);

      if (error) throw error;

      setFeedback({ type: 'success', text: '¡Postulación enviada con éxito! Recibirás una respuesta pronto.' });
      
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (error) {
      setFeedback({ type: 'error', text: 'Error al enviar postulación: ' + error.message });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <Loader size={48} className="spin" />
        <p>Verificando autenticación...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Postulación de Staff</h1>
        <p style={styles.subtitle}>Completa el proceso de verificación y formulario</p>
      </div>

      {/* Progress Bar */}
      <div style={styles.progressContainer}>
        {STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isActive = currentStep === step.id;
          const isCompleted = currentStep > step.id;
          
          return (
            <div key={step.id} style={styles.stepWrapper}>
              <div style={{
                ...styles.stepCircle,
                background: isCompleted ? 'var(--primary)' : isActive ? 'rgba(255,215,0,0.2)' : 'var(--bg-card)',
                border: isActive ? '2px solid var(--primary)' : '1px solid var(--border)',
                color: isCompleted || isActive ? 'var(--primary)' : 'var(--text-muted)'
              }}>
                {isCompleted ? <Check size={20} /> : <Icon size={20} />}
              </div>
              <span style={{
                ...styles.stepLabel,
                color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                fontWeight: isActive ? '700' : '600'
              }}>{step.title}</span>
              {idx < STEPS.length - 1 && <div style={styles.stepLine} />}
            </div>
          );
        })}
      </div>

      {/* Feedback */}
      {feedback && (
        <div style={{
          ...styles.feedback,
          background: feedback.type === 'error' ? '#e74c3c20' : '#2ecc7120',
          border: `1px solid ${feedback.type === 'error' ? '#e74c3c' : '#2ecc71'}`,
          color: feedback.type === 'error' ? '#e74c3c' : '#2ecc71'
        }}>
          {feedback.type === 'error' ? <AlertCircle size={18} /> : <Check size={18} />}
          {feedback.text}
        </div>
      )}

      {/* Step Content */}
      <div style={styles.formCard}>
        {currentStep === 1 && (
          <div style={styles.stepContent}>
            <h2>Verificación de Discord</h2>
            <p style={styles.stepDesc}>Tu cuenta de Discord ha sido verificada automáticamente</p>
            
            {discordData && (
              <div style={styles.verifiedCard}>
                <img src={discordData.avatar} alt="Avatar" style={styles.avatar} />
                <div style={styles.verifiedInfo}>
                  <h3>{discordData.username}</h3>
                  <span style={styles.verifiedBadge}>
                    <Check size={14} /> Discord Verificado
                  </span>
                  <p style={styles.discordId}>ID: {discordData.id}</p>  
                </div>
              </div>
            )}
          </div>
        )}

        {currentStep === 2 && (
          <div style={styles.stepContent}>
            <h2>Verificación de Roblox</h2>
            <p style={styles.stepDesc}>Ingresa tu nombre de usuario para verificar tu cuenta</p>
            
            <div style={styles.inputGroup}>
              <label>Nombre de Usuario de Roblox *</label>
              <div style={styles.verifyRow}>
                <input
                  type="text"
                  value={robloxUsername}
                  onChange={(e) => setRobloxUsername(e.target.value)}
                  placeholder="Ej: JohnDoe123"
                  style={styles.input}
                  disabled={robloxData !== null}
                />
                {!robloxData && (
                  <button 
                    onClick={handleRobloxVerify} 
                    disabled={verifying}
                    style={styles.verifyBtn}
                  >
                    {verifying ? <Loader size={16} className="spin" /> : <Check size={16} />}
                    {verifying ? 'Verificando...' : 'Verificar'}
                  </button>
                )}
              </div>
            </div>

            {robloxData && (
              <div style={styles.verifiedCard}>
                {robloxData.avatar && (
                  <img src={robloxData.avatar} alt="Roblox Avatar" style={styles.avatar} />
                )}
                <div style={styles.verifiedInfo}>
                  <h3>{robloxData.username}</h3>
                  <span style={styles.verifiedBadge}>
                    <Check size={14} /> Roblox Verificado
                  </span>
                  <p style={styles.robloxInfo}>
                    <strong>ID:</strong> {robloxData.id}<br/>
                    <strong>Edad de cuenta:</strong> {robloxData.accountAge} días
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {currentStep === 3 && (
          <div style={styles.stepContent}>
            <h2>Información Personal</h2>
            <p style={styles.stepDesc}>Cuéntanos más sobre ti</p>
            
            <div style={styles.inputGroup}>
              <label>Nombre Completo *</label>
              <input
                type="text"
                value={formData.nombreCompleto}
                onChange={(e) => setFormData({...formData, nombreCompleto: e.target.value})}
                placeholder="Juan Pérez García"
                style={styles.input}
              />
            </div>

            <div style={styles.row}>
              <div style={styles.inputGroup}>
                <label>Edad *</label>
                <select
                  value={formData.edad}
                  onChange={(e) => setFormData({...formData, edad: e.target.value})}
                  style={styles.input}
                >
                  <option value="">Seleccionar...</option>
                  {[...Array(48)].map((_, i) => (
                    <option key={i} value={13 + i}>{13 + i} años</option>
                  ))}
                </select>
              </div>

              <div style={styles.inputGroup}>
                <label>Zona Horaria *</label>
                <select
                  value={formData.zonaHoraria}
                  onChange={(e) => setFormData({...formData, zonaHoraria: e.target.value})}
                  style={styles.input}
                >
                  <option value="">Seleccionar...</option>
                  <option value="GMT-6 (México)">GMT-6 (México)</option>
                  <option value="GMT-5 (COL/PER)">GMT-5 (Colombia/Perú)</option>
                  <option value="GMT-4 (CHI)">GMT-4 (Chile)</option>
                  <option value="GMT-3 (ARG)">GMT-3 (Argentina)</option>
                  <option value="GMT+1 (ESP)">GMT+1 (España)</option>
                </select>
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label>¿Quién te recomendó? (Opcional)</label>
              <input
                type="text"
                value={formData.recomendadoPor}
                onChange={(e) => setFormData({...formData, recomendadoPor: e.target.value})}
                placeholder="Nombre del staff que te recomendó"
                style={styles.input}
              />
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div style={styles.stepContent}>
            <h2>Experiencia y Conocimiento</h2>
            <p style={styles.stepDesc}>Demuestra tu experiencia y conocimiento del servidor</p>
            
            <div style={styles.inputGroup}>
              <label>Experiencia previa como Staff *</label>
              <textarea
                value={formData.experiencia}
                onChange={(e) => setFormData({...formData, experiencia: e.target.value})}
                placeholder="Describe tu experiencia previa (mínimo 50 caracteres)"
                style={{...styles.input, minHeight: '100px'}}
                rows={4}
              />
            </div>

            <div style={styles.inputGroup}>
              <label>Horas disponibles por semana *</label>
              <input
                type="text"
                value={formData.disponibilidad}
                onChange={(e) => setFormData({...formData, disponibilidad: e.target.value})}
                placeholder="Ej: 20-30 horas semanales"
                style={styles.input}
              />
            </div>

            <div style={styles.inputGroup}>
              <label>¿Por qué quieres ser Staff? *</label>
              <textarea
                value={formData.motivacion}
                onChange={(e) => setFormData({...formData, motivacion: e.target.value})}
                placeholder="Explica tu motivación (mínimo 100 caracteres)"
                style={{...styles.input, minHeight: '120px'}}
                rows={5}
              />
            </div>

            <h3 style={{marginTop: '2rem', color: 'var(--primary)'}}>Escenarios de Reglas</h3>
            
            <div style={styles.inputGroup}>
              <label>Escenario IRL-X: ¿Cómo actuarías si ves a alguien usando "magia" en roleplay? *</label>
              <textarea
                value={formData.escenario_irlx}
                onChange={(e) => setFormData({...formData, escenario_irlx: e.target.value})}
                placeholder="Tu respuesta..."
                style={{...styles.input, minHeight: '80px'}}
                rows={3}
              />
            </div>

            <div style={styles.inputGroup}>
              <label>Escenario CXM: ¿Qué harías si un jugador usa información OOC en roleplay? *</label>
              <textarea
                value={formData.escenario_cxm}
                onChange={(e) => setFormData({...formData, escenario_cxm: e.target.value})}
                placeholder="Tu respuesta..."
                style={{...styles.input, minHeight: '80px'}}
                rows={3}
              />
            </div>

            <div style={styles.inputGroup}>
              <label>Escenario VLV: ¿Cómo explicarías la regla de valorar la vida? *</label>
              <textarea
                value={formData.escenario_vlv}
                onChange={(e) => setFormData({...formData, escenario_vlv: e.target.value})}
                placeholder="Tu respuesta..."
                style={{...styles.input, minHeight: '80px'}}
                rows={3}
              />
            </div>
          </div>
        )}

        {currentStep === 5 && (
          <div style={styles.stepContent}>
            <h2>Revisión Final</h2>
            <p style={styles.stepDesc}>Verifica que toda tu información sea correcta antes de enviar</p>
            
            <div style={styles.reviewSection}>
              <h3>Discord</h3>
              <p>✓ {discordData?.username}</p>
            </div>

            <div style={styles.reviewSection}>
              <h3>Roblox</h3>
              <p>✓ {robloxData?.username} (ID: {robloxData?.id})</p>
            </div>

            <div style={styles.reviewSection}>
              <h3>Información Personal</h3>
              <p><strong>Nombre:</strong> {formData.nombreCompleto}</p>
              <p><strong>Edad:</strong> {formData.edad}</p>
              <p><strong>Zona Horaria:</strong> {formData.zonaHoraria}</p>
            </div>

            <div style={styles.declaration}>
              <p>Al enviar esta postulación, confirmo que:</p>
              <ul>
                <li>Toda la información proporcionada es verídica</li>
                <li>He leído y acepto el reglamento del servidor</li>
                <li>Entiendo que proporcionar información falsa resultará en rechazo permanente</li>
              </ul>
            </div>

            <button
              onClick={handleSubmit}
              disabled={submitting}
              style={{...styles.submitBtn, opacity: submitting ? 0.6 : 1}}
            >
              {submitting ? (
                <>
                  <Loader size={20} className="spin" /> Enviando...
                </>
              ) : (
                <>
                  <Check size={20} /> Enviar Postulación
                </>
              )}
            </button>
          </div>
        )}

        {/* Navigation Buttons */}
        <div style={styles.navigation}>
          {currentStep > 1 && (
            <button onClick={handlePrevious} style={styles.navBtn}>
              <ChevronLeft size={18} /> Anterior
            </button>
          )}
          <div style={{flex: 1}} />
          {currentStep < 5 && (
            <button onClick={handleNext} style={{...styles.navBtn, background: 'var(--primary)', color: 'black'}}>
              Siguiente <ChevronRight size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: { maxWidth: '900px', margin: '0 auto', padding: '2rem' },
  header: { textAlign: 'center', marginBottom: '3rem' },
  title: { fontSize: '2.5rem', fontWeight: '900', color: 'var(--text-main)', marginBottom: '0.5rem' },
  subtitle: { color: 'var(--text-muted)', fontSize: '1.1rem' },
  progressContainer: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3rem', gap: '0.5rem' },
  stepWrapper: { display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, position: 'relative' },
  stepCircle: { width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.5rem', transition: '0.3s' },
  stepLabel: { fontSize: '0.75rem', textAlign: 'center', maxWidth: '100px' },
  stepLine: { position: 'absolute', top: '24px', left: '50%', width: '100%', height: '2px', background: 'var(--border)', zIndex: -1 },
  feedback: { padding: '1rem 1.5rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem', fontWeight: '600' },
  formCard: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '2.5rem' },
  stepContent: {},
  stepDesc: { color: 'var(--text-muted)', marginBottom: '2rem' },
  inputGroup: { marginBottom: '1.5rem' },
  input: { width: '100%', padding: '0.85rem', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-main)', fontSize: '1rem' },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' },
  verifyRow: { display: 'flex', gap: '0.75rem' },
  verifyBtn: { padding: '0.85rem 1.5rem', background: 'var(--primary)', color: 'black', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap' },
  verifiedCard: { background: 'rgba(255, 215, 0, 0.05)', border: '1px solid var(--primary)', borderRadius: '12px', padding: '1.5rem', display: 'flex', gap: '1.5rem', alignItems: 'center', marginTop: '1.5rem' },
  avatar: { width: '80px', height: '80px', borderRadius: '50%', border: '3px solid var(--primary)' },
  verifiedInfo: { flex: 1 },
  verifiedBadge: { display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'var(--primary)', color: 'black', padding: '0.35rem 0.85rem', borderRadius: '6px', fontSize: '0.85rem', fontWeight: '700', marginTop: '0.5rem' },
  discordId: { marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)', fontFamily: 'monospace' },
  robloxInfo: { marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' },
  reviewSection: { background: 'var(--bg)', padding: '1.5rem', borderRadius: '12px', marginBottom: '1.5rem', border: '1px solid var(--border)' },
  declaration: { background: 'rgba(255, 215, 0, 0.05)', padding: '1.5rem', borderRadius: '12px', marginTop: '2rem', marginBottom: '2rem', border: '1px solid var(--primary)' },
  submitBtn: { width: '100%', padding: '1.25rem', background: '#2ecc71', color: 'white', border: 'none', borderRadius: '12px', fontSize: '1.1rem', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', transition: '0.2s' },
  navigation: { display: 'flex', gap: '1rem', marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid var(--border)' },
  navBtn: { padding: '0.85rem 1.5rem', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-main)', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: '0.2s' },
  loadingContainer: { height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', color: 'var(--text-muted)' }
};

export default ApplyPage;
EOF

echo "✅ New ApplyPage created successfully"
