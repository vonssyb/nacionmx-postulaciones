import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { parseDiscordCallback, getDiscordUser, saveUser } from '../services/discord'
import './Callback.css'

export default function Callback() {
    const navigate = useNavigate()

    useEffect(() => {
        async function handleCallback() {
            try {
                const { accessToken } = parseDiscordCallback()

                if (!accessToken) {
                    throw new Error('No access token received')
                }

                // Obtener datos del usuario de Discord
                const user = await getDiscordUser(accessToken)

                // Guardar en localStorage
                saveUser(user, accessToken)

                // Redirigir a la página de postulación
                navigate('/apply', { replace: true })
            } catch (error) {
                console.error('Error during OAuth callback:', error)
                navigate('/', { replace: true })
            }
        }

        handleCallback()
    }, [navigate])

    return (
        <div className="callback-container">
            <div className="loading-spinner"></div>
            <p>Autenticando con Discord...</p>
        </div>
    )
}
