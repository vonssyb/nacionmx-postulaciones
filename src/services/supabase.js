import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables. Check your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper para verificar si un usuario puede postularse
export async function canUserApply(discordId) {
    try {
        const { data, error } = await supabase
            .rpc('can_user_apply', { user_discord_id: discordId })

        if (error) throw error
        return data
    } catch (error) {
        console.error('Error checking if user can apply:', error)
        return false
    }
}

// Obtener la postulación activa de un usuario
export async function getUserApplication(discordId) {
    try {
        const { data, error } = await supabase
            .from('staff_applications')
            .select('*')
            .eq('discord_id', discordId)
            .order('created_at', { ascending: false })
            .limit(1)
            .single()

        if (error && error.code !== 'PGRST116') throw error // Ignore "not found"
        return data
    } catch (error) {
        console.error('Error fetching user application:', error)
        return null
    }
}

// Crear una nueva postulación
export async function createApplication(applicationData) {
    try {
        const { data, error } = await supabase
            .from('staff_applications')
            .insert([applicationData])
            .select()
            .single()

        if (error) throw error
        return { success: true, data }
    } catch (error) {
        console.error('Error creating application:', error)
        return { success: false, error: error.message }
    }
}

// Obtener preguntas del formulario
export async function getApplicationQuestions() {
    try {
        const { data, error } = await supabase
            .from('application_questions')
            .select('*')
            .eq('active', true)
            .order('order_index')

        if (error) throw error
        return data
    } catch (error) {
        console.error('Error fetching questions:', error)
        return []
    }
}
// --- ADMIN FUNCTIONS ---

// Obtener todas las postulaciones (para staff)
export async function getApplications(filters = {}) {
    try {
        let query = supabase
            .from('staff_applications')
            .select('*')
            .order('created_at', { ascending: false })

        if (filters.status) {
            query = query.eq('status', filters.status)
        }

        const { data, error } = await query

        if (error) throw error
        return data
    } catch (error) {
        console.error('Error fetching applications:', error)
        return []
    }
}

// Actualizar el estado de una postulación
export async function updateApplicationStatus(applicationId, updateData) {
    try {
        const { data, error } = await supabase
            .from('staff_applications')
            .update({
                ...updateData,
                updated_at: new Date().toISOString(),
                reviewed_at: new Date().toISOString()
            })
            .eq('id', applicationId)
            .select()
            .single()

        if (error) throw error
        return { success: true, data }
    } catch (error) {
        console.error('Error updating application status:', error)
        return { success: false, error: error.message }
    }
}
