import { supabase } from './supabaseClient'

export const signUp = async (email, password, displayName) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { display_name: displayName } },
  })
  if (error) throw error
  return data
}

export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export const signOut = () => supabase.auth.signOut()

export const getSession = () => supabase.auth.getSession()

export const onAuthChange = (callback) =>
  supabase.auth.onAuthStateChange((_event, session) => callback(session))

export const getProfile = async (userId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*, badges(*)')
    .eq('user_id', userId)
    .single()
  if (error) throw error
  return data
}
