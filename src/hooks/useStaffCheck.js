import { useState, useCallback } from 'react';
import { supabase } from '../services/supabase';

// CONFIGURATION
const MAIN_GUILD_ID = '1398525215134318713'; // Nacion MX (Roleplay)
const STAFF_GUILD_ID = '1460059764494041211'; // Nacion MX Staff (Administration)
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

// Allowed Roles (These IDs must exist in the guild being checked)
// Allowed Roles (These IDs must exist in the guild being checked)
const ALLOWED_ROLE_IDS = [
    '1412882240991658177', // Owner
    '1449856794980516032', // Co Owner
    '1412882245735420006', // Junta Directiva
    '1460064525297647812', // Junta Directiva (Staff Server)
    '1412882248411381872', // Administrador
    '1412887079612059660', // Staff
    '1412887167654690908', // Staff Separator (Legacy check)
    '1457558479287091417', // Staff de Entrenamiento
    '1458597791906533477', // Tercer Al Mando
    '1450242319121911848', // Key Mod
    '1454985316292100226',  // Encargado Staff
    '1450242487422812251'   // Staff Separator (New)
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
            // Check cache first with expiration
            const cacheKey = `discord_member_v4_${session.user.id}`;
            const cached = sessionStorage.getItem(cacheKey);

            if (cached) {
                try {
                    const parsedCache = JSON.parse(cached);
                    const cacheAge = Date.now() - (parsedCache.timestamp || 0);

                    if (cacheAge < CACHE_DURATION) {
                        console.log('[StaffCheck] Using cached staff status (age: ' + Math.round(cacheAge / 1000) + 's)');
                        setMemberData(parsedCache.memberData);
                        setIsStaff(parsedCache.isStaff);
                        setLoading(false);
                        return parsedCache.isStaff;
                    } else {
                        console.log('[StaffCheck] Cache expired, refreshing...');
                        sessionStorage.removeItem(cacheKey);
                    }
                } catch (e) {
                    console.warn('[StaffCheck] Invalid cache, clearing...');
                    sessionStorage.removeItem(cacheKey);
                }
            }

            // Helper function to fetch member with rate limit handling
            const fetchMember = async (guildId, guildName) => {
                try {
                    const response = await fetch(`https://discord.com/api/users/@me/guilds/${guildId}/member`, {
                        headers: { Authorization: `Bearer ${session.provider_token}` }
                    });

                    if (response.status === 429) {
                        console.warn(`[StaffCheck] Rate limited by Discord API for ${guildName}`);
                        const retryAfter = response.headers.get('Retry-After') || 5;
                        console.log(`[StaffCheck] Retry after ${retryAfter} seconds`);
                        return null;
                    }

                    if (!response.ok) {
                        console.warn(`[StaffCheck] ${guildName} returned ${response.status}`);
                        return null;
                    }

                    return await response.json();
                } catch (err) {
                    console.error(`[StaffCheck] Error fetching ${guildName}:`, err);
                    return null;
                }
            };

            // 1. Try Main Guild
            console.log('[StaffCheck] Checking Main Guild:', MAIN_GUILD_ID);
            let data = await fetchMember(MAIN_GUILD_ID, 'Main Guild');
            let hasRole = false;

            if (data && data.roles) {
                console.log('[StaffCheck] Main Guild roles:', data.roles);
                hasRole = data.roles.some(roleId => ALLOWED_ROLE_IDS.includes(roleId));
                if (hasRole) {
                    console.log('[StaffCheck] ✅ Staff role found in Main Guild');
                    setMemberData(data);
                    setIsStaff(true);

                    // Save to cache
                    sessionStorage.setItem(cacheKey, JSON.stringify({
                        isStaff: true,
                        memberData: data,
                        timestamp: Date.now()
                    }));

                    setLoading(false);
                    return true;
                }
            }

            // 2. If not found, Try Staff Guild
            console.log('[StaffCheck] Checking Staff Guild:', STAFF_GUILD_ID);
            const staffData = await fetchMember(STAFF_GUILD_ID, 'Staff Guild');

            if (staffData && staffData.roles) {
                console.log('[StaffCheck] Staff Guild roles:', staffData.roles);
                const hasStaffRole = staffData.roles.some(roleId => ALLOWED_ROLE_IDS.includes(roleId));
                if (hasStaffRole) {
                    console.log('[StaffCheck] ✅ Staff role found in Staff Guild');
                    setMemberData(staffData);
                    setIsStaff(true);

                    // Save to cache
                    sessionStorage.setItem(cacheKey, JSON.stringify({
                        isStaff: true,
                        memberData: staffData,
                        timestamp: Date.now()
                    }));

                    setLoading(false);
                    return true;
                }
            }

            // 3. Fallback: No staff role found in either
            console.warn('[StaffCheck] ❌ No staff roles found in Main or Staff guilds.');
            console.warn('[StaffCheck] ALLOWED_ROLE_IDS:', ALLOWED_ROLE_IDS);
            setIsStaff(false);
            setMemberData(data || staffData);

            // Cache negative result too (for shorter time)
            sessionStorage.setItem(cacheKey, JSON.stringify({
                isStaff: false,
                memberData: data || staffData,
                timestamp: Date.now()
            }));

            setLoading(false);
            return false;

        } catch (err) {
            console.error('[StaffCheck] Error:', err);
            setError(err.message);
            setIsStaff(false);
            setLoading(false);
            return false;
        }
    }, []);

    return { loading, isStaff, error, memberData, checkStaffStatus };
};
