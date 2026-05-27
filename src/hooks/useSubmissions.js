import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

/**
 * useSubmissions — fetches the current user's submissions from Supabase.
 *
 * Returns a Set of challenge IDs the user has already completed, plus a
 * `submit` helper that uploads a photo and writes the submission row.
 *
 * @returns {{
 *   submittedIds: Set<string>,
 *   loading: boolean,
 *   error: Error|null,
 *   submit: (challengeId: string, file: File) => Promise<{ error: Error|null }>
 * }}
 */
export function useSubmissions() {
  const { user } = useAuth()
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!user) {
      setSubmissions([])
      setLoading(false)
      return
    }

    let cancelled = false

    async function fetchSubmissions() {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('submissions')
        .select('challenge_id, photo_url')
        .eq('user_id', user.id)

      if (cancelled) return

      if (error) {
        setError(error)
      } else {
        setSubmissions(data ?? [])
      }
      setLoading(false)
    }

    fetchSubmissions()
    return () => {
      cancelled = true
    }
  }, [user])

  /**
   * Upload a photo to Supabase Storage and record the submission row.
   *
   * Storage path: {userId}/{challengeId}/{timestamp}-{filename}
   */
  const submit = useCallback(
    async (challengeId, file) => {
      if (!user) return { error: new Error('Not authenticated') }

      const ext = file.name.split('.').pop()
      const path = `${user.id}/${challengeId}/${Date.now()}.${ext}`

      // 1. Upload the file.
      const { error: uploadError } = await supabase.storage
        .from('photos')
        .upload(path, file, { upsert: false })

      if (uploadError) return { error: uploadError }

      // 2. Get a public URL.
      const { data: urlData } = supabase.storage.from('photos').getPublicUrl(path)
      const photoUrl = urlData?.publicUrl ?? path

      // 3. Insert submission row.
      const { error: insertError } = await supabase.from('submissions').insert({
        user_id: user.id,
        challenge_id: challengeId,
        photo_url: photoUrl,
      })

      if (insertError) return { error: insertError }

      // 4. Optimistically update local state.
      setSubmissions((prev) => [...prev, { challenge_id: challengeId, photo_url: photoUrl }])

      return { error: null }
    },
    [user],
  )

  const submittedIds = new Set(submissions.map((s) => s.challenge_id))

  return { submittedIds, submissions, loading, error, submit }
}
