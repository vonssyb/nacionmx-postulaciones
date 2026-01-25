import { createClient } from '@supabase/supabase-js';

// TODO: Replace with actual environment variables or user input
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: window.localStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
    }
});

// Roles bloqueados - usuarios con estos roles NO pueden postularse
const BLOCKED_ROLES = [
    '1451860028653834300', // Blacklist Moderación
];

// Verificar si un usuario puede aplicar
export async function canUserApply(discordId) {
    try {
        // 1. Verificar roles del usuario en Discord
        const savedUser = JSON.parse(localStorage.getItem('discord_user'));
        const token = localStorage.getItem('discord_token');

        if (token && savedUser) {
            // Obtener información del miembro del servidor
            const guildId = import.meta.env.VITE_DISCORD_GUILD_ID;
            if (guildId) {
                const memberResponse = await fetch(
                    `https://discord.com/api/users/@me/guilds/${guildId}/member`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (memberResponse.ok) {
                    const memberData = await memberResponse.json();
                    const userRoles = memberData.roles || [];

                    // Verificar si tiene algún rol bloqueado
                    const hasBlockedRole = userRoles.some(roleId => BLOCKED_ROLES.includes(roleId));
                    if (hasBlockedRole) {
                        console.log('User has blocked role, cannot apply');
                        return false;
                    }
                }
            }
        }

        // 2. Verificar si ya tiene una aplicación activa
        const { data: existingApps } = await supabase
            .from('applications')
            .select('id, status, created_at')
            .eq('applicant_discord_id', discordId)
            .in('status', ['pending', 'under_review']);

        if (existingApps && existingApps.length > 0) {
            return false; // Ya tiene una aplicación activa
        }

        // 3. Verificar período de espera después de rechazo
        const { data: rejectedApps } = await supabase
            .from('applications')
            .select('id, status, created_at, updated_at')
            .eq('applicant_discord_id', discordId)
            .eq('status', 'rejected')
            .order('updated_at', { ascending: false })
            .limit(1);

        if (rejectedApps && rejectedApps.length > 0) {
            const lastRejection = new Date(rejectedApps[0].updated_at);
            const daysSinceRejection = (Date.now() - lastRejection.getTime()) / (1000 * 60 * 60 * 24);

            // Período de espera de 30 días después de rechazo
            if (daysSinceRejection < 30) {
                return false;
            }
        }

        return true;
    } catch (error) {
        console.error('Error checking user eligibility:', error);
        return true; // En caso de error, permitir aplicar
    }
}

// Obtener preguntas de la aplicación
export async function getApplicationQuestions() {
    try {
        const { data, error } = await supabase
            .from('application_questions')
            .select('*')
            .eq('is_active', true)
            .order('section_id', { ascending: true })
            .order('order_index', { ascending: true });

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching questions:', error);
        return [];
    }
}

// Crear una nueva aplicación
export async function createApplication(applicationData) {
    try {
        const { data, error } = await supabase
            .from('applications')
            .insert([{
                applicant_discord_id: applicationData.discord_id,
                discord_username: applicationData.discord_username,
                discord_avatar_url: applicationData.discord_avatar,
                roblox_id: applicationData.roblox_id,
                roblox_username: applicationData.roblox_username,
                roblox_display_name: applicationData.roblox_display_name,
                custom_answers: applicationData.custom_answers,
                status: 'pending',
                created_at: new Date().toISOString()
            }])
            .select();

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('Error creating application:', error);
        return { success: false, error: error.message };
    }
}

// Obtener todas las aplicaciones (para admin)
export async function getApplications() {
    try {
        const { data, error } = await supabase
            .from('applications')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching applications:', error);
        return [];
    }
}

// Actualizar estado de una aplicación
export async function updateApplicationStatus(applicationId, status, notes = null) {
    try {
        const updateData = {
            status,
            updated_at: new Date().toISOString()
        };

        if (notes) {
            updateData.internal_notes = notes;
        }

        const { data, error } = await supabase
            .from('applications')
            .update(updateData)
            .eq('id', applicationId)
            .select();

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('Error updating application status:', error);
        return { success: false, error: error.message };
    }
}
