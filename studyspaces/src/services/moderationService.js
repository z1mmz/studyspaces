import { supabase } from './supabaseClient'

const APPROVALS_NEEDED = 2
const REVIEWERS_PER_SPACE = 3

const BADGE_META = {
  contributor:      { icon: '⭐', label: 'Contributor' },
  scout:            { icon: '🔭', label: 'Scout' },
  reviewer:         { icon: '👁️',  label: 'Reviewer' },
  trusted_reviewer: { icon: '🏆', label: 'Trusted Reviewer' },
  local_expert:     { icon: '📍', label: 'Local Expert' },
}
export { BADGE_META }

// ── Reviewer assignment ───────────────────────────────────────

export const assignReviewers = async (spaceId, lat, lon, submitterId) => {
  // Use the Postgres RPC for efficient geo-filtered random selection
  const { data: candidates, error } = await supabase.rpc('find_reviewers', {
    p_space_id:  spaceId,
    p_lat:       lat,
    p_lon:       lon,
    p_submitter: submitterId,
    p_limit:     REVIEWERS_PER_SPACE,
  })
  if (error) throw error

  // Deduplicate (RPC may return overlapping rows from the two clauses)
  const seen = new Set()
  const reviewers = (candidates ?? []).filter((r) => {
    if (seen.has(r.user_id)) return false
    seen.add(r.user_id)
    return true
  }).slice(0, REVIEWERS_PER_SPACE)

  if (!reviewers.length) return []

  // Insert moderation rows + notifications in parallel
  await Promise.all(reviewers.map((r) =>
    Promise.all([
      supabase.from('space_moderations').insert({
        space_id:     spaceId,
        moderator_id: r.user_id,
      }),
      supabase.from('notifications').insert({
        user_id:  r.user_id,
        type:     'review_request',
        space_id: spaceId,
        message:  'A new study space near you needs your review.',
      }),
    ])
  ))

  return reviewers
}

// ── Decision submission ───────────────────────────────────────

export const submitDecision = async (spaceId, decision) => {
  const { data: { user } } = await supabase.auth.getUser()

  const { error } = await supabase
    .from('space_moderations')
    .update({ decision, decided_at: new Date().toISOString() })
    .eq('space_id', spaceId)
    .eq('moderator_id', user.id)
  if (error) throw error

  // Tally votes
  const { data: votes } = await supabase
    .from('space_moderations')
    .select('decision')
    .eq('space_id', spaceId)

  const approved = votes?.filter((v) => v.decision === 'approved').length ?? 0
  const rejected = votes?.filter((v) => v.decision === 'rejected').length ?? 0

  if (approved >= APPROVALS_NEEDED) await _resolveSpace(spaceId, 'approved')
  else if (rejected >= APPROVALS_NEEDED) await _resolveSpace(spaceId, 'rejected')

  await checkAndAwardBadges(user.id)
}

// ── Admin force decision ──────────────────────────────────────

export const forceDecision = async (spaceId, decision) => {
  await _resolveSpace(spaceId, decision)
}

// ── Internal helpers ──────────────────────────────────────────

const _resolveSpace = async (spaceId, status) => {
  const { data: space, error } = await supabase
    .from('spaces')
    .update({ status })
    .eq('id', spaceId)
    .select('submitted_by, name')
    .single()
  if (error) throw error

  if (!space.submitted_by) return

  const message = status === 'approved'
    ? `Your space "${space.name}" has been approved and is now live on the map! 🎉`
    : `Your space "${space.name}" was not approved after community review.`

  await supabase.from('notifications').insert({
    user_id:  space.submitted_by,
    type:     status === 'approved' ? 'space_approved' : 'space_rejected',
    space_id: spaceId,
    message,
  })

  if (status === 'approved') await checkAndAwardBadges(space.submitted_by)
}

// ── Badge awarding ────────────────────────────────────────────

export const checkAndAwardBadges = async (userId) => {
  const [{ count: approvedSpaces }, { count: reviewCount }] = await Promise.all([
    supabase.from('spaces').select('*', { count: 'exact', head: true })
      .eq('submitted_by', userId).eq('status', 'approved'),
    supabase.from('reviews').select('*', { count: 'exact', head: true })
      .eq('user_id', userId),
  ])

  const toAward = []
  if (approvedSpaces >= 1)  toAward.push('contributor')
  if (approvedSpaces >= 5)  toAward.push('scout')
  if (reviewCount   >= 10)  toAward.push('reviewer')
  if (reviewCount   >= 25)  toAward.push('trusted_reviewer')

  // Local expert: 3 approved spaces within same ~10 km cluster
  const { data: userSpaces } = await supabase
    .from('spaces').select('lat, lon').eq('submitted_by', userId).eq('status', 'approved')
  if ((userSpaces?.length ?? 0) >= 3) {
    const hasCluster = userSpaces.some((anchor) =>
      userSpaces.filter((s) =>
        Math.abs(s.lat - anchor.lat) < 0.09 && Math.abs(s.lon - anchor.lon) < 0.12
      ).length >= 3
    )
    if (hasCluster) toAward.push('local_expert')
  }

  if (!toAward.length) return

  const rows = toAward.map((type) => ({ user_id: userId, type }))
  const { data: newBadges } = await supabase
    .from('badges').upsert(rows, { onConflict: 'user_id,type', ignoreDuplicates: true }).select()

  // Notify for genuinely new badges
  if (newBadges?.length) {
    await Promise.all(newBadges.map((b) =>
      supabase.from('notifications').insert({
        user_id: userId,
        type:    'badge_earned',
        message: `You earned the ${BADGE_META[b.type]?.icon} ${BADGE_META[b.type]?.label} badge!`,
      })
    ))
  }
}

// ── Notifications ─────────────────────────────────────────────

export const getNotifications = async () => {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)
  if (error) throw error
  return data ?? []
}

export const markRead = async (id) => {
  await supabase.from('notifications').update({ read: true }).eq('id', id)
}

export const getUnreadCount = async () => {
  const { count } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('read', false)
  return count ?? 0
}

// ── Moderation queue (admin) ──────────────────────────────────

export const getPendingSpaces = async () => {
  const { data, error } = await supabase
    .from('spaces')
    .select(`
      *,
      space_moderations (
        id, decision, decided_at, moderator_id,
        profiles:moderator_id ( display_name, badges(*) )
      )
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
  if (error) throw error
  return data ?? []
}
