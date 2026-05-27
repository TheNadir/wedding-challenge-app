import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import styles from './Login.module.css'

/**
 * Login — public landing page.
 *
 * - If auth is still loading, shows a full-screen spinner so there's no flash.
 * - If the user is already signed in, redirects straight to /challenges.
 * - Otherwise shows the Google sign-in card.
 */
export default function Login() {
  const { user, loading, signInWithGoogle } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && user) {
      navigate('/challenges', { replace: true })
    }
  }, [user, loading, navigate])

  // Check for an error passed back from the auth callback.
  const errorMsg = new URLSearchParams(window.location.search).get('error')

  if (loading) {
    return (
      <div className={styles.spinnerPage}>
        <div className={styles.spinner} aria-label="Loading…" />
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.emoji} aria-hidden="true">💍</div>
        <h1 className={styles.heading}>Wedding Challenges</h1>
        <p className={styles.tagline}>
          Sign in to start completing challenges
        </p>

        {errorMsg && (
          <p className={styles.error} role="alert">
            Sign-in failed: {decodeURIComponent(errorMsg)}
          </p>
        )}

        <button
          className={styles.googleBtn}
          onClick={signInWithGoogle}
          type="button"
        >
          <GoogleIcon />
          Sign in with Google
        </button>
      </div>
    </div>
  )
}

/** Inline Google "G" logo so there's no extra dependency. */
function GoogleIcon() {
  return (
    <svg
      className={styles.googleIcon}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      aria-hidden="true"
    >
      <path fill="#EA4335" d="M24 9.5c3.14 0 5.95 1.08 8.17 2.86l6.08-6.08C34.5 3.19 29.57 1 24 1 14.82 1 7.07 6.52 3.64 14.27l7.07 5.49C12.42 13.56 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.5 24.5c0-1.56-.14-3.07-.4-4.5H24v8.52h12.69c-.55 2.94-2.2 5.43-4.67 7.1l7.17 5.57C43.27 37.27 46.5 31.39 46.5 24.5z"/>
      <path fill="#FBBC05" d="M10.71 28.24A14.6 14.6 0 0 1 9.5 24c0-1.48.25-2.9.71-4.24L3.14 14.27A23.43 23.43 0 0 0 .5 24c0 3.77.9 7.34 2.64 10.46l7.57-6.22z"/>
      <path fill="#34A853" d="M24 47c5.57 0 10.25-1.84 13.67-5l-7.17-5.57c-1.85 1.25-4.21 1.98-6.5 1.98-6.26 0-11.58-4.06-13.29-9.76l-7.57 6.22C7.07 41.48 14.82 47 24 47z"/>
    </svg>
  )
}
