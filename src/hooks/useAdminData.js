import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useAdminData() {
  const [leaderboard, setLeaderboard] = useState([])
  const [challenges, setChallenges] = useState([])
  const [submissions, setSubmissions] = useState([])
  const [profileMap, setProfileMap] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [tick, setTick] = useState(0)

  const refetch = useCallback(() => setTick(t => t + 1), [])

  useEffect(() => {
    let cancelled = false

    async function fetchAll() {
      setLoading(true)
      setError(null)

      try {
        const { data, error: rpcError } = await supabase.rpc('get_admin_dashboard')
        if (rpcError) throw rpcError
        if (cancelled) return

        const map = Object.fromEntries(
          (data.profiles ?? []).map(p => [p.id, p])
        )

        setLeaderboard(data.leaderboard ?? [])
        setChallenges(data.challenges ?? [])
        setSubmissions(data.submissions ?? [])
        setProfileMap(map)
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
  }, [tick])

  return { leaderboard, challenges, submissions, profileMap, loading, error, refetch }
}
