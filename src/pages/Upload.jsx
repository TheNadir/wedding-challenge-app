import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import NavBar from '../components/NavBar'
import { useAuth } from '../hooks/useAuth'
import { useSubmission } from '../hooks/useSubmission'
import { supabase } from '../lib/supabase'
import styles from './Upload.module.css'

/**
 * Upload — reveals the challenge and lets the player submit a photo.
 *
 * On mount, checks whether the user already submitted for this challenge and
 * redirects to /challenges if so (prevents double-submissions).
 *
 * Route: /upload/:challengeId  (protected)
 */
export default function Upload() {
  const { challengeId } = useParams()
  const navigate        = useNavigate()
  const { user }        = useAuth()

  const [challenge, setChallenge]           = useState(null)
  const [challengeLoading, setChallengeLoading] = useState(true)

  const [file, setFile]       = useState(null)
  const [preview, setPreview] = useState(null)

  const cameraRef  = useRef(null)
  const libraryRef = useRef(null)

  const { submit, uploading, progress, error, success } =
    useSubmission(challengeId, user?.id)

  // ── Fetch challenge + guard against re-submission ─────────────────────────
  useEffect(() => {
    if (!user?.id) return
    let cancelled = false

    async function load() {
      // If the user already submitted, send them back immediately.
      const { data: existing } = await supabase
        .from('submissions')
        .select('id')
        .eq('user_id', user.id)
        .eq('challenge_id', challengeId)
        .maybeSingle()

      if (existing) {
        navigate('/challenges', { replace: true })
        return
      }

      const { data } = await supabase
        .from('challenges')
        .select('*')
        .eq('id', challengeId)
        .single()

      if (!cancelled) {
        setChallenge(data)
        setChallengeLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [challengeId, user?.id, navigate])

  // ── Revoke object URL when preview changes or on unmount ─────────────────
  useEffect(() => {
    return () => { if (preview) URL.revokeObjectURL(preview) }
  }, [preview])

  // ── Navigate home after success ───────────────────────────────────────────
  useEffect(() => {
    if (!success) return
    const t = setTimeout(() => navigate('/challenges', { replace: true }), 1500)
    return () => clearTimeout(t)
  }, [success, navigate])

  // ── Handlers ──────────────────────────────────────────────────────────────
  function handleFileChange(e) {
    const selected = e.target.files?.[0]
    if (!selected) return
    if (preview) URL.revokeObjectURL(preview)
    setFile(selected)
    setPreview(URL.createObjectURL(selected))
  }

  function clearFile() {
    if (preview) URL.revokeObjectURL(preview)
    setFile(null)
    setPreview(null)
    // Reset so the same file can be re-selected after clearing.
    if (cameraRef.current)  cameraRef.current.value  = ''
    if (libraryRef.current) libraryRef.current.value = ''
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (file) await submit(file)
  }

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (challengeLoading) {
    return (
      <>
        <NavBar />
        <main className={styles.main} aria-busy="true">
          <div className={styles.skeletonBadge}   aria-hidden="true" />
          <div className={styles.skeletonTitle}   aria-hidden="true" />
          <div className={styles.skeletonDesc}    aria-hidden="true" />
          <div className={styles.skeletonUpload}  aria-hidden="true" />
        </main>
      </>
    )
  }

  return (
    <>
      <NavBar />
      <main className={styles.main}>

        {/* ── Challenge reveal ────────────────────────────────────────── */}
        <header className={styles.header}>
          <span className={styles.orderBadge} aria-label={`Challenge ${challenge.sort_order}`}>
            #{challenge.sort_order}
          </span>
          <h1 className={styles.title}>{challenge.title}</h1>
          {challenge.description && (
            <p className={styles.desc}>{challenge.description}</p>
          )}
        </header>

        {/* ── Upload form ─────────────────────────────────────────────── */}
        <form onSubmit={handleSubmit} noValidate>

          {/* No file selected yet */}
          {!file && !success && (
            <div className={styles.uploadArea}>
              {/* Visually hidden file inputs — triggered by custom buttons */}
              <input
                ref={cameraRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                className={styles.hiddenInput}
                tabIndex={-1}
                aria-hidden="true"
              />
              <input
                ref={libraryRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className={styles.hiddenInput}
                tabIndex={-1}
                aria-hidden="true"
              />

              <button
                type="button"
                className={[styles.btn, styles.btnPrimary].join(' ')}
                onClick={() => cameraRef.current?.click()}
              >
                <CameraIcon />
                Take a photo
              </button>

              <div className={styles.orRow} aria-hidden="true">
                <span className={styles.orLine} />
                <span className={styles.orText}>or</span>
                <span className={styles.orLine} />
              </div>

              <button
                type="button"
                className={[styles.btn, styles.btnOutline].join(' ')}
                onClick={() => libraryRef.current?.click()}
              >
                <PhotoIcon />
                Choose from library
              </button>
            </div>
          )}

          {/* File selected — show preview + submit controls */}
          {file && !success && (
            <div className={styles.previewArea}>
              <img
                src={preview}
                alt="Your selected photo"
                className={styles.preview}
              />

              {error && (
                <div className={styles.errorBox} role="alert">
                  <WarningIcon />
                  <span>{error}</span>
                </div>
              )}

              {uploading && (
                <div
                  className={styles.progressTrack}
                  role="progressbar"
                  aria-valuenow={progress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`Uploading: ${progress}%`}
                >
                  <div
                    className={styles.progressFill}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}

              <button
                type="submit"
                className={[styles.btn, styles.btnPrimary].join(' ')}
                disabled={uploading}
                aria-busy={uploading}
              >
                {uploading ? `Uploading… ${progress}%` : 'Submit photo'}
              </button>

              {!uploading && (
                <button
                  type="button"
                  className={styles.reChooseBtn}
                  onClick={clearFile}
                >
                  Choose a different photo
                </button>
              )}
            </div>
          )}

          {/* Success state */}
          {success && (
            <div className={styles.successBox} role="status">
              <CheckCircleIcon />
              <p className={styles.successText}>Challenge complete!</p>
              <p className={styles.successSub}>Heading back to challenges…</p>
            </div>
          )}
        </form>
      </main>
    </>
  )
}

// ── Inline SVG icons ─────────────────────────────────────────────────────────

function CameraIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
      width={22} height={22} aria-hidden="true">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx={12} cy={13} r={4} />
    </svg>
  )
}

function PhotoIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
      width={22} height={22} aria-hidden="true">
      <rect x={3} y={3} width={18} height={18} rx={2} ry={2} />
      <circle cx={8.5} cy={8.5} r={1.5} />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  )
}

function CheckCircleIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
      width={52} height={52} aria-hidden="true">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  )
}

function WarningIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
      width={18} height={18} aria-hidden="true">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1={12} y1={9} x2={12} y2={13} />
      <line x1={12} y1={17} x2={12.01} y2={17} />
    </svg>
  )
}
