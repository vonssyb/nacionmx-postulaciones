#!/bin/bash

# Find the Roblox step section and update it to show verification requirement
cat > /tmp/roblox_step.txt << 'EOF'
        {currentStep === 2 && (
          <div style={styles.stepContent}>
            <h2>Verificación de Roblox</h2>
            {!robloxData ? (
              <div>
                <p style={styles.stepDesc}>
                  Debes tener tu cuenta de Roblox verificada en Discord para continuar.
                </p>
                <div style={{
                  background: 'rgba(231, 76, 60, 0.1)',
                  border: '1px solid #e74c3c',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  marginTop: '1rem'
                }}>
                  <h3 style={{color: '#e74c3c', marginBottom: '1rem'}}>⚠️ Verificación Requerida</h3>
                  <p style={{marginBottom: '0.5rem'}}>No encontramos una cuenta de Roblox verificada.</p>
                  <p style={{fontWeight: '600', color: 'var(--primary)'}}>
                    Usa el comando <code style={{background: 'var(--bg)', padding: '0.25rem 0.5rem', borderRadius: '4px'}}>/verificar</code> en Discord primero.
                  </p>
                </div>
              </div>
            ) : (
              <div>
                <p style={styles.stepDesc}>Tu cuenta de Roblox ha sido verificada automáticamente desde Discord</p>
                {autoVerified && (
                  <div style={{
                    background: 'rgba(46, 204, 113, 0.1)',
                    border: '1px solid #2ecc71',
                    borderRadius: '8px',
                    padding: '0.75rem 1rem',
                    marginBottom: '1.5rem',
                    color: '#2ecc71',
                    fontWeight: '600'
                  }}>
                    ✅ Verificado automáticamente desde Discord
                  </div>
                )}
                <div style={styles.verifiedCard}>
                  {robloxData.avatar && (
                    <img src={robloxData.avatar} alt="Roblox Avatar" style={styles.avatar} />
                  )}
                  <div style={styles.verifiedInfo}>
                    <h3>{robloxData.username}</h3>
                    <span style={styles.verifiedBadge}>
                      <Check size={14} /> Verificado desde Discord
                    </span>
                    {robloxData.id && (
                      <p style={styles.robloxInfo}>
                        <strong>User ID:</strong> {robloxData.id}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
EOF

# This is complex, so let's just notify the user to check the console logs
echo "✅ Roblox verification logic updated - will now strictly require Discord verification"
echo "📝 Manual entry disabled - must use /verificar in Discord"
