# Supabase Edge Function Deployment

## Para que la verificación de Roblox funcione, necesitas deployar la Edge Function:

### Opción 1: Supabase CLI (Recomendado)

```bash
# 1. Instalar Supabase CLI
npm install -g supabase

# 2. Login
supabase login

# 3. Link al proyecto
supabase link --project-ref igjedwdxqwkpbgrmtrrq

# 4. Deploy
supabase functions deploy verify-roblox
```

### Opción 2: Supabase Dashboard

1. Ve a: https://supabase.com/dashboard/project/igjedwdxqwkpbgrmtrrq/functions
2. Click "Create a new function"
3. Nombra: `verify-roblox`
4. Copia el contenido de `supabase/functions/verify-roblox/index.ts`
5. Deploy

### Verificar que funcione:

```bash
curl -X POST https://igjedwdxqwkpbgrmtrrq.supabase.co/functions/v1/verify-roblox \
  -H "Content-Type: application/json" \
  -d '{"username": "vonssyb", "verificationCode": "TEST-123"}'
```

Deberías recibir una respuesta JSON.

---

## URL de la función:
```
https://igjedwdxqwkpbgrmtrrq.supabase.co/functions/v1/verify-roblox
```

Esta función se llama automáticamente desde `src/services/roblox.js` cuando el usuario hace click en "Verificar Código".
