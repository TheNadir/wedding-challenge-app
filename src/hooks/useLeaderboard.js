import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const POLL_MS = 30_000

/**
 * useLeaderboard — fetches ranked player data via Supabase RPC and polls every 30 s.
 *
 * @returns {{
 *   players: LeaderboardRow[],
 *   totalChallenges: number,
 *   loading: boolean,
 *   error: Error|null,
 *   lastUpdated: Date|null,
 *   refetch: () => void,
 * }}
 *
 * @typedef {{ user_id: string, display_name: string, avatar_url: string|null, completed_count: number }} LeaderboardRow
 */
export function useLeaderboard() {
  const [players, setPlayers] = useState([])
  const [totalChallenges, setTotalChallenges] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [tick, setTick] = useState(0)

  const refetch = useCallback(() => setTick(t => t + 1), [])

  useEffect(() => {
    let cancelled = false

    async function fetchAll() {
      setError(null)
      try {
        const [leaderboardResult, challengesResult] = await Promise.all([
          supabase.rpc('get_leaderboard'),
          supabase.from('challenges').select('*', { count: 'exact', head: true }),
        ])

        if (cancelled) return

        if (leaderboardResult.error) throw leaderboardResult.error
        if (challengesResult.error) throw challengesResult.error

        setPlayers(leaderboardResult.data ?? [])
        setTotalChallenges(challengesResult.count ?? 0)
        setLastUpdated(new Date())
      } catch (err) {
        if (!cancelled) setError(err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchAll()

    const interval = setInterval(fetchAll, POLL_MS)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [tick])

  return { players, totalChallenges, loading, error, lastUpdated, refetch }
}
