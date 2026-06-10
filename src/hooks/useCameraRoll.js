import { useState, useCallback, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const MAX_BYTES = 10 * 1024 * 1024 // 10 MB

export function useCameraRoll(userId) {
  // ── Upload state ───────────────────────────────────────────────────────────
  const [uploading, setUploading]         = useState(false)
  const [progress, setProgress]           = useState(0)
  const [uploadError, setUploadError]     = useState(null)
  const [uploadSuccess, setUploadSuccess] = useState(false)

  // ── Photo count state ──────────────────────────────────────────────────────
  const [photoCount, setPhotoCount]       = useState(0)
  const [countLoading, setCountLoading]   = useState(true)

  // ── Fetch count (list only, no signed URLs) ────────────────────────────────
  const refetchCount = useCallback(async () => {
    if (!userId) return
    setCountLoading(true)

    try {
      const { data: files, error } = await supabase.storage
        .from('camera_roll')
        .list(userId)

      if (error) throw error
      setPhotoCount(files?.length ?? 0)
    } catch {
      // Non-critical — count stays at previous value
    } finally {
      setCountLoading(false)
    }
  }, [userId])

  useEffect(() => {
    refetchCount()
  }, [refetchCount])

  // ── Upload ─────────────────────────────────────────────────────────────────
  const upload = useCallback(async (file) => {
    setUploadError(null)
    setUploadSuccess(false)
    setProgress(0)

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select an image file (JPEG, PNG, HEIC, etc.).')
      return
    }
    if (file.size > MAX_BYTES) {
      setUploadError('Photo must be under 10 MB. Try a lower resolution or compress it first.')
      return
    }

    setUploading(true)

    try {
      const safeName = file.name.replace(/\s+/g, '_').replace(/[^\w.\-]/g, '')
      const path = `${userId}/${Date.now()}-${safeName}`

      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Session expired — please sign in again.')

      const uploadUrl =
        `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/camera_roll/${path}`

      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest()

        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            setProgress(Math.round((e.loaded / e.total) * 100))
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

      setProgress(100)
      setUploadSuccess(true)
      setPhotoCount((c) => c + 1)
    } catch (err) {
      setUploadError(err.message ?? 'Something went wrong. Please try again.')
    } finally {
      setUploading(false)
    }
  }, [userId])

  const resetUpload = useCallback(() => {
    setUploading(false)
    setProgress(0)
    setUploadError(null)
    setUploadSuccess(false)
  }, [])

  return {
    upload, uploading, progress, uploadError, uploadSuccess, resetUpload,
    photoCount, countLoading,
  }
}
