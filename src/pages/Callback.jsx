import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { parseDiscordCallback, getDiscordUser, saveUser } from '../services/discord'
import './Callback.css'

export default function Callback() {
    const navigate = useNavigate()

    useEffect(() => {
        async function handleCallback() {
            try {
                console.log('Callback: Parsing URL...', window.location.href);
                const { accessToken } = parseDiscordCallback()
                console.log('Callback: Access Token found?', !!accessToken);

                if (!accessToken) {
                    // Try searching in search params as fallback (sometimes redirect scripts move things)
                    const searchParams = new URLSearchParams(window.location.search);
                    const tokenFromSearch = searchParams.get('access_token');
                    if (tokenFromSearch) {
                        console.log('Callback: Found token in search params instead of hash');
                        await processToken(tokenFromSearch);
                        return;
                    }
                    throw new Error('No access token received in hash or search');
                }

                await processToken(accessToken);
            } catch (error) {
                console.error('Error during OAuth callback:', error)
                // navigate('/', { replace: true }) // Temporarily disabled to see errors in console
            }
        }

        async function processToken(token) {
            console.log('Callback: Fetching Discord user...');
            const user = await getDiscordUser(token)
            console.log('Callback: User fetched:', user.username);
            saveUser(user, token)
            navigate('/apply', { replace: true })
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
