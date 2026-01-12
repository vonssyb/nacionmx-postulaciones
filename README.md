# 🇲🇽 Sistema de Postulaciones - Nación MX

Sistema de postulaciones para staff con Discord OAuth, vinculación de Roblox y panel de administración.

## 🚀 Deploy

El sitio está desplegado automáticamente en:
**https://vonssyb.github.io/nacionmx-postulaciones**

## ✨ Características

- ✅ Autenticación con Discord OAuth2
- ✅ Vinculación de cuenta de Roblox
- ✅ Formulario dinámico desde Supabase
- ✅ Validaciones en tiempo real
- ✅ Sistema de cooldown (30 días)
- ✅ Estados de postulación con badges
- ✅ Notificaciones por Discord
- ✅ Responsive design
- ✅ Deploy automático con GitHub Actions

## 🛠️ Tecnologías

- **Frontend**: React 19 + Vite
- **Routing**: React Router v7
- **Database**: Supabase PostgreSQL
- **Auth**: Discord OAuth2
- **API**: Roblox Users API
- **Hosting**: GitHub Pages
- **CI/CD**: GitHub Actions

## 📋 Configuración Local

### 1. Clonar el repositorio

```bash
git clone https://github.com/vonssyb/nacionmx-postulaciones.git
cd nacionmx-postulaciones
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Copia `.env.example` a `.env` y completa los valores:

```env
VITE_SUPABASE_URL=https://igjedwdxqwkpbgrmtrrq.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key
VITE_DISCORD_CLIENT_ID=tu_client_id
VITE_DISCORD_REDIRECT_URI=http://localhost:5173/callback
```

### 4. Ejecutar el servidor de desarrollo

```bash
npm run dev
```

El sitio estará disponible en `http://localhost:5173`

## 🗄️ Base de Datos

### Setup de Supabase

1. Ejecuta el SQL en Supabase:
   - Abre el editor SQL en tu proyecto de Supabase
   - Copia y pega el contenido de `supabase_staff_applications.sql`
   - Click en "Run"

2. Habilita Row Level Security (RLS) si no está activado

3. Configura las políticas de acceso según tus necesidades

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-B73C92?style=for-the-badge&logo=vite&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-181818?style=for-the-badge&logo=supabase&logoColor=3ECF8E)
![Deploy Status](https://github.com/vonssyb/nacionmx-postulaciones/actions/workflows/deploy.yml/badge.svg)

## 🔐 Discord OAuth Setup

1. Ve a https://discord.com/developers/applications
2. Crea una nueva aplicación o selecciona una existente
3. Ve a OAuth2 → General
4. Copia el **Client ID**
5. En OAuth2 → Redirects, agrega:
   - Desarrollo: `http://localhost:5173/callback`
   - Producción: `https://vonssyb.github.io/nacionmx-postulaciones/callback`

## 📦 Deploy

### GitHub Pages (Automático)

Cada push a `main` ejecuta el workflow de GitHub Actions que:
1. Instala dependencias
2. Hace build del proyecto
3. Despliega a la rama `gh-pages`

### Manual

```bash
npm run build
npm run deploy
```

## 📱 Páginas

### `/` - Home
- Descripción del proceso
- Requisitos mínimos
- Botón de login con Discord

### `/apply` - Formulario
- Vinculación de Roblox
- Preguntas dinámicas desde DB
- Validaciones en tiempo real
- Envío a Supabase

### `/status` - Estado
- Ver postulación actual
- Detalles de respuestas
- Razón de rechazo (si aplica)
- Fecha de repostulación

### `/callback` - OAuth
- Handler del redirect de Discord
- Guarda token y datos de usuario
- Redirige a `/apply`

## 🎨 Estilos

El diseño utiliza:
- Gradientes vibrantes (verde/cyan)
- Glassmorphism
- Dark mode
- Animaciones suaves
- Responsive desde mobile

## 🔧 Scripts

```bash
npm run dev        # Servidor de desarrollo
npm run build      # Build de producción
npm run preview    # Preview del build
npm run deploy     # Deploy a GitHub Pages
```

## 📊 Estructura del Proyecto

```
src/
├── components/
│   ├── Navbar.jsx       # Barra de navegación
│   └── StatusBadge.jsx  # Badge de estado
├── pages/
│   ├── Home.jsx         # Página inicial
│   ├── Apply.jsx        # Formulario
│   ├── Status.jsx       # Ver estado
│   └── Callback.jsx     # OAuth callback
├── services/
│   ├── supabase.js      # Cliente Supabase
│   ├── discord.js       # OAuth Discord
│   └── roblox.js        # API Roblox
└── App.jsx              # Router principal
```

## 🚀 Próximas Características

- [ ] Panel de administración
- [ ] Sistema de notificaciones push
- [ ] Webhook de Discord para nuevas postulaciones
- [ ] Exportar postulaciones a Excel
- [ ] Estadísticas y gráficas
- [ ] Sistema de comentarios entre staff

## 📝 Licencia

Proyecto privado para Nación MX.

---

**Desarrollado con ❤️ para la comunidad de Nación MX**
