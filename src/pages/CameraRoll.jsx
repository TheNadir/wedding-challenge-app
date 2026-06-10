import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import NavBar from '../components/NavBar'
import { useAuth } from '../hooks/useAuth'
import { useFeatureFlags } from '../context/FeatureFlagsContext'
import { useCameraRoll } from '../hooks/useCameraRoll'
import styles from './CameraRoll.module.css'

export default function CameraRoll() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { flags, loading: flagsLoading } = useFeatureFlags()

  useEffect(() => {
    if (!flagsLoading && !flags.camera_roll) {
      navigate('/challenges', { replace: true })
    }
  }, [flagsLoading, flags.camera_roll, navigate])

  const {
    upload, uploading, progress, uploadError, uploadSuccess, resetUpload,
    photoCount, countLoading,
  } = useCameraRoll(user?.id)

  const [file, setFile]       = useState(null)
  const [preview, setPreview] = useState(null)

  const cameraRef  = useRef(null)
  const libraryRef = useRef(null)

  // ── Revoke object URL on preview change / unmount ─────────────────────────
  useEffect(() => {
    return () => { if (preview) URL.revokeObjectURL(preview) }
  }, [preview])

  // ── Reset upload form 2s after success ────────────────────────────────────
  useEffect(() => {
    if (!uploadSuccess) return
    const t = setTimeout(() => {
      resetUpload()
      setFile(null)
      setPreview(null)
      if (cameraRef.current)  cameraRef.current.value  = ''
      if (libraryRef.current) libraryRef.current.value = ''
    }, 2000)
    return () => clearTimeout(t)
  }, [uploadSuccess, resetUpload])

  function handleFileChange(e) {
    const selected = e.target.files?.[0]
    if (!selected) return
    if (preview) URL.revokeObjectURL(preview)
    setFile(selected)
    setPreview(URL.createObjectURL(selected))
    resetUpload()
  }

  function clearFile() {
    if (preview) URL.revokeObjectURL(preview)
    setFile(null)
    setPreview(null)
    resetUpload()
    if (cameraRef.current)  cameraRef.current.value  = ''
    if (libraryRef.current) libraryRef.current.value = ''
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (file) await upload(file)
  }

  return (
    <>
      <NavBar />
      <main className={styles.main}>

        {/* ── Page header ────────────────────────────────────────────── */}
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>My Camera Roll</h1>
          {!countLoading && photoCount > 0 && (
            <span className={styles.photoCount}>
              {photoCount} {photoCount === 1 ? 'photo' : 'photos'}
            </span>
          )}
        </div>

        {/* ── Upload panel ───────────────────────────────────────────── */}
        <section className={styles.uploadSection} aria-label="Add a photo">
          <p className={styles.uploadSectionTitle}>Add a photo</p>

          <form onSubmit={handleSubmit} noValidate>

            {/* No file selected */}
            {!file && !uploadSuccess && (
              <div className={styles.uploadArea}>
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

            {/* File selected — preview + submit */}
            {file && !uploadSuccess && (
              <div className={styles.previewArea}>
                <img
                  src={preview}
                  alt="Your selected photo"
                  className={styles.preview}
                />

                {uploadError && (
                  <div className={styles.errorBox} role="alert">
                    <WarningIcon />
                    <span>{uploadError}</span>
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
                  {uploading ? `Uploading… ${progress}%` : 'Add to camera roll'}
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

            {/* Success flash */}
            {uploadSuccess && (
              <div className={styles.successFlash} role="status">
                <CheckIcon />
                Photo saved!
              </div>
            )}

          </form>
        </section>

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

function CheckIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"
      width={18} height={18} aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
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
