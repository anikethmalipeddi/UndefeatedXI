const viteEnv = import.meta.env ?? {}

export const supabaseUrl = viteEnv.VITE_SUPABASE_URL as string | undefined
export const supabaseAnonKey = viteEnv.VITE_SUPABASE_ANON_KEY as string | undefined

export const hasSupabaseConfig = viteEnv.MODE !== 'test' && Boolean(supabaseUrl && supabaseAnonKey)
