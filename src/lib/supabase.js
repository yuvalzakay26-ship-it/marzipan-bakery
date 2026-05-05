// Public Supabase client for the marketing SPA's read paths
// (catalog, public content). Auth-bearing flows still use
// lib/supabase/client.js — both point at the same project.

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(
        '[supabase] VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is missing — ' +
        'check your .env file at the project root.'
    );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;
