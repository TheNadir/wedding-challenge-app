import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const MAX_BYTES = 10 * 1024 * 1024 // 10 MB

/**
 * useSubmission — manages the upload flow for a single challenge submission.
 *
 * Uses XHR directly (instead of the supabase client) so we get real upload
 * progress events; the supabase client uses fetch internally and doesn't
 * expose onUploadProgress in v2.
 *
 * @param {string} challengeId
 * @param {string} userId
 * @returns {{ submit: (file: File) => Promise<void>, uploading: boolean, progress: number, error: string|null, success: boolean }}
 */
export function useSubmission(challengeId, userId) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError]     = useState(null)
  const [success, setSuccess] = useState(false)

  const submit = useCallback(async (file) => {
    setError(null)
    setSuccess(false)
    setProgress(0)

    // ── Validation ────────────────────────────────────────────────────────
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (JPEG, PNG, HEIC, etc.).')
      return
    }
    if (file.size > MAX_BYTES) {
      setError('Photo must be under 10 MB. Try a lower resolution or compress it first.')
      return
    }

    setUploading(true)

    try {
      // ── Build storage path ────────────────────────────────────────────
      const safeName = file.name.replace(/\s+/g, '_').replace(/[^\w.\-]/g, '')
      const path = `${userId}/${challengeId}/${Date.now()}-${safeName}`

      // ── Upload via XHR for real progress events ───────────────────────
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Session expired — please sign in again.')

      const uploadUrl =
        `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/photos/${path}`

      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest()

        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            // Reserve last 5% for the DB insert step
            setProgress(Math.round((e.loaded / e.total) * 95))
          }
        })

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve()
          } else {
            let msg = 'Upload failed — please try again.'
            try {
              const body = JSON.parse(xhr.responseText)
              if (body.error) msg = body.error
              else if (body.message) msg = body.message
            } catch { /* non-JSON response */ }
            reject(new Error(msg))
          }
        })

        xhr.addEventListener('error', () =>
          reject(new Error('Network error — check your connection and try again.')))

        xhr.open('POST', uploadUrl)
        xhr.setRequestHeader('Authorization', `Bearer ${session.access_token}`)
        xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream')
        xhr.setRequestHeader('x-upsert', 'false')
        xhr.send(file)
      })

      // ── Get public URL (synchronous in supabase-js v2) ────────────────
      const { data: urlData } = supabase.storage.from('photos').getPublicUrl(path)
      const photoUrl = urlData.publicUrl

      // ── Insert submission row ─────────────────────────────────────────
      const { error: insertError } = await supabase.from('submissions').insert({
        user_id:      userId,
        challenge_id: challengeId,
        photo_url:    photoUrl,
      })

      if (insertError) throw insertError

      setProgress(100)
      setSuccess(true)
    } catch (err) {
      setError(err.message ?? 'Something went wrong. Please try again.')
    } finally {
      setUploading(false)
    }
  }, [challengeId, userId])

  return { submit, uploading, progress, error, success }
}
