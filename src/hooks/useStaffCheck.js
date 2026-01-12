import { useState, useCallback } from 'react';
import { supabase } from '../services/supabase';

// CONFIGURATION
const GUILD_ID = '1398525215134318713'; // Nacion MX

// Allowed Roles
const ALLOWED_ROLE_IDS = [
    '1412882240991658177', // Owner
    '1449856794980516032', // Co Owner
    '1412882245735420006', // Junta Directiva
    '1412882248411381872', // Administrador
    '1412887079612059660', // Staff
    '1412887167654690908'  // Staff en entrenamiento
];

export const useStaffCheck = () => {
    const [loading, setLoading] = useState(false);
    const [isStaff, setIsStaff] = useState(false);
    const [error, setError] = useState(null);
    const [memberData, setMemberData] = useState(null);

    const checkStaffStatus = useCallback(async (session) => {
        if (!session?.provider_token) {
            setError("No provider token found");
            return false;
        }

        setLoading(true);
        try {
            // Check cache first
            const cacheKey = `discord_member_${session.user.id}`;
            const cached = sessionStorage.getItem(cacheKey);

            let data;

            if (cached) {
                console.log("Using cached Discord member data");
                data = JSON.parse(cached);
            } else {
                console.log("Fetching Discord member data from API...");
                const response = await fetch(`https://discord.com/api/users/@me/guilds/${GUILD_ID}/member`, {
                    headers: {
                        Authorization: `Bearer ${session.provider_token}`
                    }
                });

                if (response.status === 404) throw new Error("No eres miembro del servidor de Discord de Nación MX.");
                if (response.status === 429) throw new Error("Discord API Rate Limit. Intenta más tarde.");
                if (!response.ok) throw new Error("Error verificando roles en Discord.");

                data = await response.json();
                sessionStorage.setItem(cacheKey, JSON.stringify(data));
            }

            const userRoles = data.roles || [];
            const hasRole = userRoles.some(roleId => ALLOWED_ROLE_IDS.includes(roleId));

            setIsStaff(hasRole);
            setMemberData(data);
            return hasRole;

        } catch (err) {
            console.error("Staff check error:", err);
            setError(err.message);
            setIsStaff(false);
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    return { loading, isStaff, error, memberData, checkStaffStatus };
};
