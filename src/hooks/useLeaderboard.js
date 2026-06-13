import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const POLL_INTERVAL_MS = 30_000

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
      setLoading(true)
      setError(null)

      try {
        const [leaderboardResult, challengesResult] = await Promise.all([
          supabase.rpc('get_leaderboard'),
          supabase.from('challenges').select('id', { count: 'exact', head: true }),
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

    const timer = setInterval(fetchAll, POLL_INTERVAL_MS)

    return () => {
      cancelled = true
      clearInterval(timer)
    }
  }, [tick])

  return { players, totalChallenges, loading, error, lastUpdated, refetch }
}
