import { supabase } from './supabaseClient'

const getSpaces = async () => {
  const { data, error } = await supabase
    .from('spaces')
    .select('*, reviews(rating)')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

const getSpace = async (id) => {
  const { data, error } = await supabase
    .from('spaces')
    .select('*, reviews(*)')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

const addSpace = async (space) => {
  const { data, error } = await supabase
    .from('spaces')
    .insert([space])
    .select()
    .single()
  if (error) throw error
  return data
}

const searchSpaces = async (query) => {
  const { data, error } = await supabase
    .from('spaces')
    .select('*, reviews(rating)')
    .or(`name.ilike.%${query}%,address.ilike.%${query}%,description.ilike.%${query}%`)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

const addReview = async (review) => {
  const { data: { user } } = await supabase.auth.getUser()
  const { data, error } = await supabase
    .from('reviews')
    .insert([{ ...review, user_id: user?.id ?? null }])
    .select()
    .single()
  if (error) throw error
  return data
}

export default { getSpaces, getSpace, addSpace, searchSpaces, addReview }
