# 🚀 Cómo Deployar la Edge Function

## Pasos para Deployar:

### Paso 1: Login a Supabase

```bash
supabase login
```

Esto abrirá tu navegador. Haz login con tu cuenta de Supabase.

### Paso 2: Link al Proyecto

```bash
cd /Users/gonzalez/Documents/nacionmx/nacionmx-postulaciones
supabase link --project-ref igjedwdxqwkpbgrmtrrq
```

### Paso 3: Deploy la Edge Function

```bash
supabase functions deploy verify-roblox
```

¡Y listo! La función estará disponible en:
```
https://igjedwdxqwkpbgrmtrrq.supabase.co/functions/v1/verify-roblox
```

---

## ⚡ Comandos Resumidos

Copia y pega estos 3 comandos uno por uno:

```bash
supabase login
supabase link --project-ref igjedwdxqwkpbgrmtrrq
supabase functions deploy verify-roblox
```

---

## 🔍 Verificar que Funciona

Después del deploy, prueba con:

```bash
curl -X POST https://igjedwdxqwkpbgrmtrrq.supabase.co/functions/v1/verify-roblox \
  -H "Content-Type: application/json" \
  -d '{"username": "vonssyb", "verificationCode": "NMX-1234"}'
```

Deberías recibir una respuesta JSON.

---

## ❓ Si tienes problemas

1. **Login falla**: Asegúrate de tener una cuenta en supabase.com
2. **Link falla**: Verifica que el project-ref sea correcto
3. **Deploy falla**: Revisa que la carpeta `supabase/functions/verify-roblox/` exista

---

## ✅ Una vez deployado

La web automáticamente usará la Edge Function.
Ya no habrá errores de NetworkError.
La verificación funcionará igual que el bot de Discord.
