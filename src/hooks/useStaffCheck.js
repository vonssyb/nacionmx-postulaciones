import { useState, useCallback } from 'react';
import { supabase } from '../services/supabase';

// CONFIGURATION
const MAIN_GUILD_ID = '1398525215134318713'; // Nacion MX (Roleplay)
const STAFF_GUILD_ID = '1460059764494041211'; // Nacion MX Staff (Administration)

// Allowed Roles (These IDs must exist in the guild being checked)
// Note: If roles have different IDs in Staff Server, add them here too.
const ALLOWED_ROLE_IDS = [
    '1412882240991658177', // Owner
    '1449856794980516032', // Co Owner
    '1412882245735420006', // Junta Directiva
    '1460064525297647812', // Junta Directiva (Staff Server)
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
            // Helper function to fetch member from a specific guild
            const fetchMember = async (guildId) => {
                const response = await fetch(`https://discord.com/api/users/@me/guilds/${guildId}/member`, {
                    headers: { Authorization: `Bearer ${session.provider_token}` }
                });
                if (!response.ok) return null; // 404 or prohibited
                return await response.json();
            };

            // Check cache first (Bumped to v2 to force refresh after permissions update)
            const cacheKey = `discord_member_v2_${session.user.id}`;
            const cached = sessionStorage.getItem(cacheKey);

            if (cached) {
                const parsedCache = JSON.parse(cached);
                console.log("Using cached staff status:", parsedCache);
                setMemberData(parsedCache.memberData);
                setIsStaff(parsedCache.isStaff);
                return parsedCache.isStaff;
            }

            // 1. Try Main Guild
            console.log("Checking Main Guild...");
            let data = await fetchMember(MAIN_GUILD_ID);
            let hasRole = false;

            if (data && data.roles) {
                hasRole = data.roles.some(roleId => ALLOWED_ROLE_IDS.includes(roleId));
                if (hasRole) {
                    console.log("Staff role found in Main Guild");
                    setMemberData(data);
                    setIsStaff(true);
                    return true;
                }
            }

            // 2. If not found, Try Staff Guild
            console.log("Checking Staff Guild...");
            const staffData = await fetchMember(STAFF_GUILD_ID);

            if (staffData && staffData.roles) {
                // Merge roles or just check staff guild roles
                // Assuming allowed IDs are the same or added to the list
                const hasStaffRole = staffData.roles.some(roleId => ALLOWED_ROLE_IDS.includes(roleId));
                if (hasStaffRole) {
                    console.log("Staff role found in Staff Guild");
                    // We use staff data for the profile if found here
                    setMemberData(staffData);
                    setIsStaff(true);
                    return true;
                }
            }

            // 3. Fallback: No staff role found in either
            console.warn("No staff roles found in Main or Staff guilds.");
            setIsStaff(false);
            setMemberData(data || staffData); // Return whatever data we found for profile pic
            return false;

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
