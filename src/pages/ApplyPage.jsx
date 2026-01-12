import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { generateVerificationCode, verifyRobloxWithCode, getRobloxAvatar } from '../services/roblox';
import { Shield, Check, AlertCircle, Loader, User, Gamepad2, ChevronRight, ChevronLeft } from 'lucide-react';
import './Apply.css';

const STEPS = [
  { id: 1, title: 'Verificación Discord', icon: Shield },
  { id: 2, title: 'Verificación Roblox', icon: Gamepad2 },
  { id: 3, title: 'Información Personal', icon: User },
  { id: 4, title: 'Experiencia y Test', icon: Check },
  { id: 5, title: 'Revisión Final', icon: AlertCircle }
];

const STAFF_QUESTIONS = [
  "Un jugador reporta metagaming, pero la única prueba es un clip incompleto y el acusado lo niega. ¿Cómo procedes y qué criterios usas para decidir?",
  "Explica la diferencia entre PowerGaming y ForceRP, y da un ejemplo de cada uno sin confundirlos.",
  "Un usuario nuevo comete varias faltas menores por desconocimiento de reglas. ¿Qué aplica mejor: sanción directa, advertencia pedagógica o ambas? Fundamenta.",
  "Durante un rol, un jugador rompe FearRP porque cree que “su personaje es muy valiente”. ¿Cómo evaluas si realmente rompió la regla?",
  "¿En qué casos el NLR (New Life Rule) NO debería aplicarse?, aunque el jugador haya reaparecido.",
  "Dos usuarios discuten por RDM, pero ambos iniciaron provocaciones previas. ¿Cómo determinas quién tiene razón y qué sanción corresponde?",
  "¿Qué consideras FailRP en una persecución y qué no lo sería, aunque parezca poco realista?",
  "Define “abuso de rol de autoridad” y explica cómo lo sancionarías si lo comete un miembro del staff dentro del rol.",
  "Si un miembro del staff participa en rol y tiene conflictos con usuarios, ¿cuándo debe retirarse para evitar parcialidad?",
  "¿Qué diferencia hay entre bug abuse y aprovechamiento de mecánicas del juego, y cómo se determina la intención?",
  "Un jugador usa información del Discord para ganar ventaja en rol sin que su personaje la sepa. ¿Qué regla rompe y cómo se comprueba?",
  "¿Cómo actuarías si un jugador rompe reglas accidentalmente durante un evento grande, afectando a muchos usuarios?",
  "Un usuario rolea una situación sensible de forma irrespetuosa. ¿Cómo intervienes equilibrando libertad de rol y límites de convivencia?",
  "Explica por qué un staff no debe resolver reportes donde él está involucrado y cómo se maneja correctamente ese caso.",
  "¿Qué pasos sigues antes de aplicar una sanción permanente?"
];

const ApplyPage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Discord Data
  const [discordData, setDiscordData] = useState(null);

  // Roblox Data
  const [robloxUsername, setRobloxUsername] = useState('');
  const [robloxData, setRobloxData] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');

  // Form Data
  const [formData, setFormData] = useState({
    nombreCompleto: '',
    edad: '',
    zonaHoraria: '',
    recomendadoPor: '',
    experiencia: '',
    disponibilidad: '',
    motivacion: '',
    respuestas: {} // Object to store answers by index
  });


  useEffect(() => {
    // 1. Check Discord Auth
    checkDiscordAuth();

    // 2. Load Roblox Session from LocalStorage
    const savedRoblox = localStorage.getItem('nmx_roblox_session');
    if (savedRoblox) {
      try {
        const parsed = JSON.parse(savedRoblox);
        // Optional: Check expiry or validate
        console.log('Restoring Roblox session:', parsed);
        setRobloxData(parsed);
      } catch (e) {
        console.error('Error loading saved Roblox session', e);
        localStorage.removeItem('nmx_roblox_session');
      }
    }
  }, []);

  // Save Roblox session whenever it changes
  useEffect(() => {
    if (robloxData) {
      localStorage.setItem('nmx_roblox_session', JSON.stringify(robloxData));
    }
  }, [robloxData]);

  const checkDiscordAuth = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
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

  const handleGenerateCode = async () => {
    if (!robloxUsername.trim()) {
      setFeedback({ type: 'error', text: 'Ingresa tu nombre de usuario de Roblox' });
      return;
    }

    setVerifying(true);
    setFeedback(null);

    // Generate unique code
    const code = generateVerificationCode();
    setVerificationCode(code);
    setVerifying(false);
    setFeedback({ type: 'success', text: 'Código generado. Agrégalo a tu descripción de Roblox.' });
  };

  const handleVerifyCode = async () => {
    setVerifying(true);
    setFeedback(null);

    const result = await verifyRobloxWithCode(robloxUsername, verificationCode);

    if (result.verified) {
      // Fetch avatar headshot
      const avatarUrl = await getRobloxAvatar(result.id);

      setRobloxData({
        ...result,
        avatar: avatarUrl
      });
      setFeedback({ type: 'success', text: '✅ Cuenta verificada correctamente' });
    } else {
      setFeedback({ type: 'error', text: result.error });
    }

    setVerifying(false);
  };

  const handleNext = () => {
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
      // Character validations
      const validations = [
        { field: 'experiencia', min: 50, label: 'Experiencia previa' },
        { field: 'motivacion', min: 100, label: 'Motivación' }
      ];

      for (const v of validations) {
        const value = formData[v.field] || '';
        if (value.length < v.min) {
          setFeedback({
            type: 'error',
            text: `⚠️ El campo "${v.label}" es demasiado corto. Falta(n) ${v.min - value.length} caracteres.`
          });
          return;
        }
      }

      // Questons Validation
      for (let i = 0; i < STAFF_QUESTIONS.length; i++) {
        const answer = formData.respuestas[i] || '';
        if (answer.length < 30) {
          setFeedback({
            type: 'error',
            text: `⚠️ La respuesta a la pregunta ${i + 1} es muy corta. Mínimo 30 caracteres.`
          });
          return;
        }
      }

      if (!formData.disponibilidad) {
        setFeedback({ type: 'error', text: 'Debes indicar tu disponibilidad horaria' });
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
      const applicationText = `
=== POSTULACIÓN DE STAFF ===

INFORMACIÓN PERSONAL:
- Nombre Completo: ${formData.nombreCompleto}
- Edad: ${formData.edad} años
- Zona Horaria: ${formData.zonaHoraria}
- Recomendado por: ${formData.recomendadoPor || 'N/A'}

EXPERIENCIA:
${formData.experiencia}

DISPONIBILIDAD:
${formData.disponibilidad}

MOTIVACIÓN:
${formData.motivacion}

RESPUESTAS TEST STAFF:
${STAFF_QUESTIONS.map((q, i) => `
Q${i + 1}: ${q}
R: ${formData.respuestas[i] || 'Sin respuesta'}
`).join('\n')}

VERIFICACIÓN:
- Discord: ${discordData.username} (${discordData.id})
- Roblox: ${robloxData.username} (${robloxData.id})
- Email: ${discordData.email}
`.trim();

      const { error } = await supabase.from('applications').insert([{
        type: 'staff',
        applicant_username: robloxData.username || discordData.username,
        applicant_discord_id: discordData.id,
        discord_avatar: discordData.avatar,
        status: 'pending',
        roblox_id: robloxData.id,
        roblox_verified: true,
        roblox_account_age: robloxData.accountAge,
        roblox_display_name: robloxData.displayName || robloxData.username,
        content: applicationText
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
                <div style={styles.avatarWrapper}>
                  <img src={discordData.avatar} alt="Avatar" style={styles.avatar} />
                </div>
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

            {!verificationCode && !robloxData && (
              <div>
                <p style={styles.stepDesc}>Ingresa tu nombre de usuario de Roblox para comenzar</p>

                <div style={styles.inputGroup}>
                  <label>Nombre de Usuario de Roblox *</label>
                  <div style={styles.verifyRow}>
                    <input
                      type="text"
                      value={robloxUsername}
                      onChange={(e) => setRobloxUsername(e.target.value)}
                      placeholder="Ej: vonssyb"
                      style={styles.input}
                    />
                    <button
                      onClick={handleGenerateCode}
                      disabled={verifying}
                      style={styles.verifyBtn}
                    >
                      {verifying ? <Loader size={16} className="spin" /> : <Shield size={16} />}
                      {verifying ? 'Buscando...' : 'Generar Código'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {verificationCode && !robloxData && (
              <div>
                <div style={{
                  background: 'rgba(255, 215, 0, 0.1)',
                  border: '2px solid var(--primary)',
                  borderRadius: '12px',
                  padding: '2rem',
                  marginBottom: '2rem'
                }}>
                  <h3 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>
                    📝 Paso 1: Agrega este código
                  </h3>
                  <p style={{ marginBottom: '1rem' }}>
                    Copia este código y agrégalo a tu <strong>descripción de Roblox</strong>:
                  </p>
                  <div style={{
                    background: 'var(--bg)',
                    padding: '1rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    fontFamily: 'monospace',
                    fontSize: '1.2rem',
                    fontWeight: '700',
                    color: 'var(--primary)',
                    textAlign: 'center',
                    marginBottom: '1rem',
                    letterSpacing: '2px'
                  }}>
                    {verificationCode}
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(verificationCode);
                      setFeedback({ type: 'success', text: '✅ Código copiado al portapapeles' });
                    }}
                    style={{
                      ...styles.verifyBtn,
                      width: '100%',
                      justifyContent: 'center',
                      marginBottom: '1rem'
                    }}
                  >
                    📋 Copiar Código
                  </button>

                  <div style={{
                    background: 'rgba(46, 204, 113, 0.1)',
                    border: '1px solid #2ecc71',
                    borderRadius: '8px',
                    padding: '1rem',
                    marginTop: '1rem'
                  }}>
                    <p style={{ fontSize: '0.9rem', margin: 0 }}>
                      <strong>Instrucciones:</strong><br />
                      1. Ve a <a href="https://www.roblox.com/my/account#!/info" target="_blank" rel="noopener" style={{ color: 'var(--primary)' }}>Configuración de Roblox</a><br />
                      2. Pega el código en tu descripción<br />
                      3. Guarda los cambios<br />
                      4. Vuelve aquí y presiona "Verificar"
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleVerifyCode}
                  disabled={verifying}
                  style={{
                    ...styles.verifyBtn,
                    width: '100%',
                    justifyContent: 'center',
                    padding: '1.25rem',
                    fontSize: '1.1rem'
                  }}
                >
                  {verifying ? <Loader size={20} className="spin" /> : <Check size={20} />}
                  {verifying ? 'Verificando...' : 'Verificar Código'}
                </button>

                <button
                  onClick={() => {
                    setVerificationCode('');
                    setRobloxUsername('');
                    setFeedback(null);
                  }}
                  style={{
                    ...styles.navBtn,
                    width: '100%',
                    justifyContent: 'center',
                    marginTop: '1rem'
                  }}
                >
                  ← Cambiar Usuario
                </button>
              </div>
            )}

            {robloxData && (
              <div className="fade-in">
                <p style={styles.stepDesc}>✅ Tu cuenta de Roblox ha sido verificada correctamente</p>
                <div style={styles.verifiedCard}>
                  <div style={styles.avatarWrapper}>
                    {robloxData.avatar ? (
                      <img src={robloxData.avatar} alt="Roblox Avatar" style={styles.avatar} />
                    ) : (
                      <div style={styles.avatarPlaceholder}>
                        <span style={styles.placeholderText}>Roblox<br />Avatar</span>
                      </div>
                    )}
                  </div>
                  <div style={styles.verifiedInfo}>
                    <h3 style={styles.verifiedName}>{robloxData.username}</h3>
                    <div style={styles.verifiedBadge}>
                      <Shield size={14} fill="black" /> Verificado Oficial
                    </div>
                    <p style={styles.robloxInfo}>
                      <strong>User ID:</strong> <span style={{ color: 'var(--primary)' }}>{robloxData.id}</span><br />
                      <strong>Edad de cuenta:</strong> {robloxData.accountAge} días
                    </p>
                  </div>
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
                onChange={(e) => setFormData({ ...formData, nombreCompleto: e.target.value })}
                placeholder="Juan Pérez García"
                style={styles.input}
              />
            </div>

            <div style={styles.row}>
              <div style={styles.inputGroup}>
                <label>Edad *</label>
                <select
                  value={formData.edad}
                  onChange={(e) => setFormData({ ...formData, edad: e.target.value })}
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
                  onChange={(e) => setFormData({ ...formData, zonaHoraria: e.target.value })}
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
                onChange={(e) => setFormData({ ...formData, recomendadoPor: e.target.value })}
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
                onChange={(e) => setFormData({ ...formData, experiencia: e.target.value })}
                placeholder="Describe tu experiencia previa (mínimo 50 caracteres)"
                style={{ ...styles.input, minHeight: '100px' }}
                rows={4}
              />
              <div style={styles.charCounter}>
                {formData.experiencia.length} / 50 caracteres
                {formData.experiencia.length < 50 && <span style={styles.charWarning}> (Faltan {50 - formData.experiencia.length})</span>}
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label>Horas disponibles por semana *</label>
              <input
                type="text"
                value={formData.disponibilidad}
                onChange={(e) => setFormData({ ...formData, disponibilidad: e.target.value })}
                placeholder="Ej: 20-30 horas semanales"
                style={styles.input}
              />
            </div>

            <div style={styles.inputGroup}>
              <label>¿Por qué quieres ser Staff? *</label>
              <textarea
                value={formData.motivacion}
                onChange={(e) => setFormData({ ...formData, motivacion: e.target.value })}
                placeholder="Explica tu motivación (mínimo 100 caracteres)"
                style={{ ...styles.input, minHeight: '120px' }}
                rows={5}
              />
              <div style={styles.charCounter}>
                {formData.motivacion.length} / 100 caracteres
                {formData.motivacion.length < 100 && <span style={styles.charWarning}> (Faltan {100 - formData.motivacion.length})</span>}
              </div>
            </div>

            <h3 style={{ marginTop: '2rem', color: 'var(--primary)', marginBottom: '1.5rem' }}>
              Test de Conocimiento ({STAFF_QUESTIONS.length} Preguntas)
            </h3>

            {STAFF_QUESTIONS.map((q, index) => (
              <div key={index} style={styles.inputGroup}>
                <label style={{ fontSize: '0.95rem', lineHeight: '1.4', marginBottom: '0.5rem', display: 'block' }}>
                  <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{index + 1}.</span> {q}
                </label>
                <textarea
                  value={formData.respuestas[index] || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    respuestas: { ...formData.respuestas, [index]: e.target.value }
                  })}
                  placeholder="Tu respuesta detallada..."
                  style={{ ...styles.input, minHeight: '80px' }}
                  rows={3}
                />
                <div style={styles.charCounter}>
                  {(formData.respuestas[index] || '').length} / 30 caracteres mín.
                  {(formData.respuestas[index] || '').length < 30 && (
                    <span style={styles.charWarning}>
                      (Faltan {30 - (formData.respuestas[index] || '').length})
                    </span>
                  )}
                </div>
              </div>
            ))}
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
              style={{ ...styles.submitBtn, opacity: submitting ? 0.6 : 1 }}
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
          <div style={{ flex: 1 }} />
          {currentStep < 5 && (
            <button onClick={handleNext} style={{ ...styles.navBtn, background: 'var(--primary)', color: 'black' }}>
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
  verifiedCard: { background: 'rgba(212, 175, 55, 0.05)', border: '1px solid #D4AF37', borderRadius: '16px', padding: '2rem', display: 'flex', gap: '2rem', alignItems: 'center', marginTop: '1.5rem', boxShadow: '0 8px 32px rgba(0,0,0,0.3)', animation: 'slideUp 0.5s ease-out' },
  avatarWrapper: { position: 'relative', width: '100px', height: '100px' },
  avatar: { width: '100%', height: '100%', borderRadius: '50%', border: '3px solid #D4AF37', objectFit: 'cover', boxShadow: '0 0 15px rgba(212, 175, 55, 0.3)' },
  avatarPlaceholder: { width: '100%', height: '100%', borderRadius: '50%', border: '3px solid #D4AF37', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' },
  placeholderText: { color: 'white', fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase', lineHeight: '1.1', letterSpacing: '1px' },
  verifiedInfo: { flex: 1 },
  verifiedName: { fontSize: '1.5rem', fontWeight: '900', color: 'white', marginBottom: '0.5rem' },
  verifiedBadge: { display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#D4AF37', color: 'black', padding: '0.4rem 1rem', borderRadius: '50px', fontSize: '0.8rem', fontWeight: '900', textTransform: 'uppercase', marginBottom: '1rem' },
  discordId: { marginTop: '0.5rem', fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace' },
  robloxInfo: { marginTop: '0.5rem', fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)', lineHeight: '1.6' },
  reviewSection: { background: 'var(--bg)', padding: '1.5rem', borderRadius: '12px', marginBottom: '1.5rem', border: '1px solid var(--border)' },
  declaration: { background: 'rgba(212, 175, 55, 0.05)', padding: '1.5rem', borderRadius: '12px', marginTop: '2rem', marginBottom: '2rem', border: '1px solid #D4AF37' },
  submitBtn: { width: '100%', padding: '1.25rem', background: '#2ecc71', color: 'white', border: 'none', borderRadius: '12px', fontSize: '1.1rem', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', transition: '0.3s cubic-bezier(0.4, 0, 0.2, 1)' },
  navigation: { display: 'flex', gap: '1rem', marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid var(--border)' },
  navBtn: { padding: '0.85rem 1.5rem', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-main)', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: '0.2s', '&:hover': { borderColor: 'var(--primary)' } },
  charCounter: { fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem', textAlign: 'right', fontWeight: '600' },
  charWarning: { color: '#e74c3c', marginLeft: '0.5rem' },
  loadingContainer: { height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', color: 'var(--text-muted)' }
};

export default ApplyPage;
