import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import styles from './AuthCallback.module.css'

/**
 * AuthCallback — handles the OAuth redirect from Google.
 *
 * Supabase sends users here with a `code` query parameter after they
 * approve the Google consent screen. We exchange that code for a
 * real session, then redirect to the app.
 *
 * Route: /auth/callback
 */
export default function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    async function exchange() {
      const code = new URLSearchParams(window.location.search).get('code')

      if (!code) {
        // No code means something went wrong before we even got here.
        navigate('/?error=missing_code', { replace: true })
        return
      }

      const { error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        console.error('Auth callback error:', error.message)
        navigate(
          `/?error=${encodeURIComponent(error.message)}`,
          { replace: true },
        )
      } else {
        navigate('/challenges', { replace: true })
      }
    }

    exchange()
  }, [navigate])

  return (
    <div className={styles.page}>
      <div className={styles.spinner} aria-label="Completing sign-in…" />
      <p className={styles.text}>Signing you in…</p>
    </div>
  )
}
