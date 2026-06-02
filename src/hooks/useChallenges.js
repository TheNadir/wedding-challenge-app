import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

/**
 * useChallenges — fetches all challenges and the current user's submissions in parallel.
 *
 * Challenges are ordered by `sort_order` ascending. Titles should be masked as
 * "???" in the UI for any challenge the user hasn't submitted a photo for yet.
 *
 * @param {import('@supabase/supabase-js').User|null} user - Current auth user (from useAuth).
 *
 * @returns {{
 *   challenges: Challenge[],
 *   submissions: Submission[],
 *   loading: boolean,
 *   error: Error|null,
 *   refetch: () => void,
 * }}
 *
 * @typedef {{ id: string, title: string, description: string, sort_order: number }} Challenge
 * @typedef {{ id: string, challenge_id: string, user_id: string, photo_url: string }} Submission
 *
 * @example
 * const { user } = useAuth()
 * const { challenges, submissions, loading, error, refetch } = useChallenges(user)
 */
export function useChallenges(user) {
  const [challenges, setChallenges] = useState([])
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  // Incrementing this triggers a manual re-fetch (used by `refetch`).
  const [tick, setTick] = useState(0)

  /** Call this to re-fetch both tables (e.g. after an error or a new upload). */
  const refetch = useCallback(() => setTick(t => t + 1), [])

  useEffect(() => {
    let cancelled = false

    async function fetchAll() {
      setLoading(true)
      setError(null)

      try {
        const [challengesResult, submissionsResult] = await Promise.all([
          // All challenges, sorted by sort_order
          supabase
            .from('challenges')
            .select('*')
            .order('sort_order', { ascending: true }),

          // Only fetch submissions when we have a user ID to filter on
          user?.id
            ? supabase
                .from('submissions')
                .select('*')
                .eq('user_id', user.id)
            : Promise.resolve({ data: [], error: null }),
        ])

        if (cancelled) return

        if (challengesResult.error) throw challengesResult.error
        if (submissionsResult.error) throw submissionsResult.error

        setChallenges(challengesResult.data ?? [])
        setSubmissions(submissionsResult.data ?? [])
      } catch (err) {
        if (!cancelled) setError(err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchAll()

    return () => {
      cancelled = true
    }
    // Re-fetch whenever the logged-in user changes or refetch() is called.
    // Use user?.id (not user) so a new object for the same user doesn't re-trigger.
  }, [user?.id, tick])

  return { challenges, submissions, loading, error, refetch }
}
