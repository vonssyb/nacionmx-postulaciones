// Obtener información de usuario de Roblox por username
export async function getRobloxUserByUsername(username) {
    try {
        // Primero obtenemos el ID del usuario
        const response = await fetch('https://users.roblox.com/v1/usernames/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                usernames: [username],
                excludeBannedUsers: false,
            }),
        })

        if (!response.ok) {
            throw new Error('Failed to fetch Roblox user')
        }

        const data = await response.json()

        if (!data.data || data.data.length === 0) {
            return null
        }

        const user = data.data[0]

        // Obtener información adicional del usuario
        const userInfo = await fetch(`https://users.roblox.com/v1/users/${user.id}`)
        const userDetails = await userInfo.json()

        return {
            id: user.id.toString(),
            username: user.name,
            displayName: user.displayName || user.name,
            created: userDetails.created,
            isBanned: userDetails.isBanned || false,
        }
    } catch (error) {
        console.error('Error fetching Roblox user:', error)
        return null
    }
}

// Validar que un usuario de Roblox exista
export async function validateRobloxUser(username) {
    const user = await getRobloxUserByUsername(username)
    return user !== null
}
