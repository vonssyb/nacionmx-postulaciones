const DISCORD_CLIENT_ID = import.meta.env.VITE_DISCORD_CLIENT_ID
const DISCORD_REDIRECT_URI = import.meta.env.VITE_DISCORD_REDIRECT_URI

// Generar URL de autenticación de Discord
export function getDiscordAuthUrl() {
    const params = new URLSearchParams({
        client_id: DISCORD_CLIENT_ID,
        redirect_uri: DISCORD_REDIRECT_URI,
        response_type: 'token',
        scope: 'identify',
    })

    return `https://discord.com/api/oauth2/authorize?${params.toString()}`
}

// Parsear la respuesta de Discord del hash de la URL o search params (fallback para GH Pages)
export function parseDiscordCallback() {
    // Cuando usamos HashRouter, el hash real de Discord puede quedar al final o mezclado
    // Ejemplo: #/callback#access_token=... o simplemente #access_token=...
    const fullHash = window.location.hash
    const searchParams = new URLSearchParams(window.location.search)

    // Función para buscar en una cadena tipo URLSearchParams
    const findInString = (str, key) => {
        const params = new URLSearchParams(str.replace(/^#/, '').replace(/^[?]/, ''))
        return params.get(key)
    }

    // Buscamos en el hash completo (puede contener múltiples #)
    const getToken = (key) => {
        // Intentar en search params normales
        let val = searchParams.get(key)
        if (val) return val

        // Intentar splitear por # y buscar en cada parte
        const parts = fullHash.split('#')
        for (const part of parts) {
            if (!part) continue
            val = findInString(part, key)
            if (val) return val
        }
        return null
    }

    return {
        accessToken: getToken('access_token'),
        tokenType: getToken('token_type'),
        expiresIn: getToken('expires_in'),
    }
}

// Obtener información del usuario de Discord
export async function getDiscordUser(accessToken) {
    try {
        const response = await fetch('https://discord.com/api/users/@me', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        })

        if (!response.ok) {
            throw new Error('Failed to fetch Discord user')
        }

        const user = await response.json()

        return {
            id: user.id,
            username: user.username,
            discriminator: user.discriminator,
            avatar: user.avatar
                ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
                : `https://cdn.discordapp.com/embed/avatars/${parseInt(user.discriminator) % 5}.png`,
            tag: `${user.username}#${user.discriminator}`,
        }
    } catch (error) {
        console.error('Error fetching Discord user:', error)
        throw error
    }
}

// Guardar usuario en localStorage
export function saveUser(user, accessToken) {
    localStorage.setItem('discord_user', JSON.stringify(user))
    localStorage.setItem('discord_token', accessToken)
}

// Obtener usuario guardado
export function getSavedUser() {
    const user = localStorage.getItem('discord_user')
    const token = localStorage.getItem('discord_token')

    if (!user || !token) return null

    return {
        user: JSON.parse(user),
        token,
    }
}

// Cerrar sesión
export function logout() {
    localStorage.removeItem('discord_user')
    localStorage.removeItem('discord_token')
}
