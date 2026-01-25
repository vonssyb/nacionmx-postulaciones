import { createClient } from '@supabase/supabase-js';

// TODO: Replace with actual environment variables or user input
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: window.localStorage, // Usar localStorage en lugar de sessionStorage
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
    }
});
