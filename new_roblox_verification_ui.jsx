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
                  <h3 style={{color: 'var(--primary)', marginBottom: '1rem'}}>
                    📝 Paso 1: Agrega este código
                  </h3>
                  <p style={{marginBottom: '1rem'}}>
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
                    <p style={{fontSize: '0.9rem', margin: 0}}>
                      <strong>Instrucciones:</strong><br/>
                      1. Ve a <a href="https://www.roblox.com/my/account#!/info" target="_blank" rel="noopener" style={{color: 'var(--primary)'}}>Configuración de Roblox</a><br/>
                      2. Pega el código en tu descripción<br/>
                      3. Guarda los cambios<br/>
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
              <div>
                <p style={styles.stepDesc}>✅ Tu cuenta de Roblox ha sido verificada correctamente</p>
                <div style={styles.verifiedCard}>
                  {robloxData.avatar && (
                    <img src={robloxData.avatar} alt="Roblox Avatar" style={styles.avatar} />
                  )}
                  <div style={styles.verifiedInfo}>
                    <h3>{robloxData.username}</h3>
                    <span style={styles.verifiedBadge}>
                      <Check size={14} /> Verificado con Código
                    </span>
                    <p style={styles.robloxInfo}>
                      <strong>User ID:</strong> {robloxData.id}<br/>
                      <strong>Edad de cuenta:</strong> {robloxData.accountAge} días
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
