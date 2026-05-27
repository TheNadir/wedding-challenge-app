import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

/**
 * useChallenges — fetches all challenges from Supabase.
 *
 * Challenges are ordered by their `sort_order` column so the list is
 * deterministic. Titles will be masked as "???" in the UI until the
 * current user has submitted a photo for that challenge.
 *
 * @returns {{ challenges: Challenge[], loading: boolean, error: Error|null }}
 *
 * @typedef {{ id: string, title: string, description: string, sort_order: number }} Challenge
 */
export function useChallenges() {
  const [challenges, setChallenges] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function fetchChallenges() {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('challenges')
        .select('*')
        .order('sort_order', { ascending: true })

      if (cancelled) return

      if (error) {
        setError(error)
      } else {
        setChallenges(data ?? [])
      }
      setLoading(false)
    }

    fetchChallenges()
    return () => {
      cancelled = true
    }
  }, [])

  return { challenges, loading, error }
}
