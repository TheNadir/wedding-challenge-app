import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

/**
 * useAuth — tracks the current Supabase auth session.
 *
 * @returns {{ session: Session|null, user: User|null, loading: boolean }}
 *
 * @example
 * const { user, loading } = useAuth()
 * if (loading) return <Spinner />
 * if (!user) return <Navigate to="/" />
 */
export function useAuth() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

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

  return {
    session,
    user: session?.user ?? null,
    loading,
  }
}
