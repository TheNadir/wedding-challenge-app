import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

/**
 * useAuth — tracks the current Supabase auth session and exposes auth actions.
 *
 * @returns {{
 *   session: Session|null,
 *   user: User|null,
 *   loading: boolean,
 *   signInWithGoogle: () => Promise<void>,
 *   signOut: () => Promise<void>,
 * }}
 *
 * @example
 * const { user, loading, signInWithGoogle, signOut } = useAuth()
 * if (loading) return <Spinner />
 * if (!user) return <Navigate to="/" />
 */
export function useAuth() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    // Grab the initial session from storage.
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    // Subscribe to future auth events (sign-in, sign-out, token refresh).
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  /** Kick off Google OAuth — browser will redirect away and come back via /auth/callback. */
  async function signInWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/auth/callback',
      },
    })
    if (error) console.error('Google sign-in error:', error.message)
  }

  /** Sign out the current user and navigate back to the login page. */
  async function signOut() {
    await supabase.auth.signOut()
    navigate('/', { replace: true })
  }

  return {
    session,
    user: session?.user ?? null,
    loading,
    signInWithGoogle,
    signOut,
  }
}
