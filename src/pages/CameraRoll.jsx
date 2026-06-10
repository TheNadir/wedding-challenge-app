import { useEffect, useRef, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import NavBar from '../components/NavBar'
import { useAuth } from '../hooks/useAuth'
import { useFeatureFlags } from '../context/FeatureFlagsContext'
import { useCameraRoll } from '../hooks/useCameraRoll'
import styles from './CameraRoll.module.css'

/**
 * CameraRoll — private per-player photo gallery.
 *
 * Players can take photos or upload from their library throughout the day.
 * Photos are stored in the Supabase `camera_roll` bucket under the user's
 * own folder and are never visible to other players.
 *
 * Route: /camera-roll  (protected)
 */
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
    photos, photosLoading, photosError, refetchPhotos,
  } = useCameraRoll(user?.id)

  const [file, setFile]       = useState(null)
  const [preview, setPreview] = useState(null)
  const [activePhoto, setActivePhoto] = useState(null)

  const cameraRef  = useRef(null)
  const libraryRef = useRef(null)

  // ── Revoke object URL on preview change / unmount ─────────────────────────
  useEffect(() => {
    return () => { if (preview) URL.revokeObjectURL(preview) }
  }, [preview])

  // ── Reset upload form 2s after success (stay on page) ────────────────────
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

  // ── Keyboard handler for lightbox ─────────────────────────────────────────
  const activeIndex = photos.findIndex(p => p.path === activePhoto?.path)

  const closeLightbox = useCallback(() => setActivePhoto(null), [])

  const goPrev = useCallback(() => {
    if (activeIndex > 0) setActivePhoto(photos[activeIndex - 1])
  }, [activeIndex, photos])

  const goNext = useCallback(() => {
    if (activeIndex < photos.length - 1) setActivePhoto(photos[activeIndex + 1])
  }, [activeIndex, photos])

  useEffect(() => {
    if (!activePhoto) return

    function onKey(e) {
      if (e.key === 'Escape')     closeLightbox()
      if (e.key === 'ArrowLeft')  goPrev()
      if (e.key === 'ArrowRight') goNext()
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [activePhoto, closeLightbox, goPrev, goNext])

  // ── Handlers ──────────────────────────────────────────────────────────────
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
          {photos.length > 0 && (
            <span className={styles.photoCount}>{photos.length}</span>
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

        {/* ── Gallery ────────────────────────────────────────────────── */}
        <section className={styles.gallerySection} aria-label="Your photos">

          {photosLoading && (
            <ul className={styles.skeletonGrid} aria-hidden="true">
              {Array.from({ length: 6 }).map((_, i) => (
                <li key={i} className={styles.skeletonTile} />
              ))}
            </ul>
          )}

          {!photosLoading && photosError && (
            <div className={styles.errorBox} role="alert">
              <WarningIcon />
              <span>{photosError}</span>
            </div>
          )}

          {!photosLoading && !photosError && photos.length === 0 && (
            <div className={styles.emptyState}>
              <span className={styles.emptyIcon} aria-hidden="true">📷</span>
              <p className={styles.emptyTitle}>No photos yet</p>
              <p className={styles.emptyText}>Take your first shot above!</p>
            </div>
          )}

          {!photosLoading && photos.length > 0 && (
            <ul className={styles.gallery}>
              {photos.map(photo => (
                <li key={photo.path} className={styles.galleryItem}>
                  <button
                    type="button"
                    className={styles.galleryBtn}
                    onClick={() => setActivePhoto(photo)}
                    aria-label="View photo"
                  >
                    <img
                      src={photo.signedUrl}
                      className={styles.galleryThumb}
                      alt=""
                      loading="lazy"
                    />
                  </button>
                </li>
              ))}
            </ul>
          )}

        </section>

      </main>

      {/* ── Lightbox ────────────────────────────────────────────────── */}
      {activePhoto && (
        <div
          className={styles.overlay}
          role="dialog"
          aria-modal="true"
          aria-label="Photo viewer"
          onClick={closeLightbox}
        >
          {/* Prevent click-through on controls */}
          <button
            type="button"
            className={styles.lightboxClose}
            onClick={closeLightbox}
            aria-label="Close"
          >
            <CloseIcon />
          </button>

          <button
            type="button"
            className={[styles.lightboxNav, styles.lightboxPrev].join(' ')}
            onClick={(e) => { e.stopPropagation(); goPrev() }}
            disabled={activeIndex === 0}
            aria-label="Previous photo"
          >
            <ChevronLeftIcon />
          </button>

          <img
            src={activePhoto.signedUrl}
            className={styles.lightboxImg}
            alt="Your photo"
            onClick={(e) => e.stopPropagation()}
          />

          <button
            type="button"
            className={[styles.lightboxNav, styles.lightboxNext].join(' ')}
            onClick={(e) => { e.stopPropagation(); goNext() }}
            disabled={activeIndex === photos.length - 1}
            aria-label="Next photo"
          >
            <ChevronRightIcon />
          </button>
        </div>
      )}
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

function CloseIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"
      width={18} height={18} aria-hidden="true">
      <line x1={18} y1={6} x2={6} y2={18} />
      <line x1={6} y1={6} x2={18} y2={18} />
    </svg>
  )
}

function ChevronLeftIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"
      width={22} height={22} aria-hidden="true">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  )
}

function ChevronRightIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"
      width={22} height={22} aria-hidden="true">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  )
}
