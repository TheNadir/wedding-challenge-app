import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import styles from './AuthCallback.module.css'

/**
 * AuthCallback — lands here after Google redirects back from OAuth.
 *
 * WHY we don't call exchangeCodeForSession manually:
 *
 * The Supabase client (detectSessionInUrl: true by default) runs _initialize()
 * synchronously during module import. By the time React renders this component,
 * _initialize() has already:
 *   1. Detected the PKCE ?code= query param
 *   2. Called _exchangeCodeForSession() internally
 *   3. Wiped the code from the URL via history.replaceState()
 *   4. Scheduled a SIGNED_IN event via onAuthStateChange
 *
 * Calling exchangeCodeForSession ourselves would fail ("code already used")
 * and, worse, reading window.location.search here finds it empty → missing_code.
 *
 * The correct pattern: just subscribe to onAuthStateChange and let Supabase
 * tell us when the session is ready.
 *
 * Route: /auth/callback
 */
export default function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    // Guard: only navigate once even if multiple events arrive.
    let done = false
    function go(path) {
      if (done) return
      done = true
      navigate(path, { replace: true })
    }

    // onAuthStateChange fires immediately with the current state
    // (INITIAL_SESSION event) and then again whenever it changes.
    //
    //  • INITIAL_SESSION + session  → exchange already complete, go to app
    //  • INITIAL_SESSION + null     → exchange in flight, wait for SIGNED_IN
    //  • SIGNED_IN                  → exchange just finished, go to app
    //  • anything else with session → treat as signed-in (defensive)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        go('/challenges')
      } else if (event !== 'INITIAL_SESSION') {
        // A non-initial event with no session means something went wrong
        // (e.g., the code was invalid or already consumed).
        go('/?error=auth_failed')
      }
      // INITIAL_SESSION with null session = exchange still in flight; stay put.
    })

    // Safety net: if Supabase never fires (network timeout, bad code, etc.),
    // redirect after 10 s rather than leaving the spinner running forever.
    const fallback = setTimeout(() => go('/?error=timeout'), 10_000)

    return () => {
      subscription.unsubscribe()
      clearTimeout(fallback)
    }
  }, [navigate])

  return (
    <div className={styles.page}>
      <div className={styles.spinner} aria-label="Completing sign-in…" />
      <p className={styles.text}>Signing you in…</p>
    </div>
  )
}
