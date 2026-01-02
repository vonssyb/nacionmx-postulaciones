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

// Parsear la respuesta de Discord del hash de la URL
export function parseDiscordCallback() {
    const hash = window.location.hash.substring(1)
    const params = new URLSearchParams(hash)

    return {
        accessToken: params.get('access_token'),
        tokenType: params.get('token_type'),
        expiresIn: params.get('expires_in'),
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
