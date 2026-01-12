#!/bin/bash

# Create a temp file with the new handleSubmit function
cat > /tmp/new_submit.js << 'EOF'
  const handleSubmit = async () => {
    setSubmitting(true);
    setFeedback(null);

    try {
      // Prepare application text with all form data
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

ESCENARIOS:

IRL-X (Magia en RP):
${formData.escenario_irlx}

CXM (Info OOC en RP):
${formData.escenario_cxm}

VLV (Valorar la vida):
${formData.escenario_vlv}

VERIFICACIÓN:
- Discord: ${discordData.username} (${discordData.id})
- Roblox: ${robloxData.username}
- Email: ${discordData.email}
`.trim();

      const { error } = await supabase.from('applications').insert([{
        type: 'Staff',
        applicant_username: robloxData.username || discordData.username,
        applicant_discord_id: discordData.id,
        discord_avatar: discordData.avatar,
        status: 'pending',
        roblox_id: robloxData.id,
        roblox_verified: robloxData.verified || false,
        roblox_account_age: robloxData.accountAge,
        roblox_display_name: robloxData.displayName || robloxData.username,
        application_text: applicationText
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
EOF

# Replace lines 164-198 with new function
head -n 163 src/pages/ApplyPage.jsx > /tmp/apply_temp.jsx
cat /tmp/new_submit.js >> /tmp/apply_temp.jsx
tail -n +199 src/pages/ApplyPage.jsx >> /tmp/apply_temp.jsx
mv /tmp/apply_temp.jsx src/pages/ApplyPage.jsx

echo "✅ Submit function fixed"
