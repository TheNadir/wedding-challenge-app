import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useIsAdmin(user) {
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user?.id) {
      setIsAdmin(false)
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)

    supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()
      .then(({ data, error }) => {
        if (cancelled) return
        setIsAdmin(!error && data?.is_admin === true)
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [user?.id])

  return { isAdmin, loading }
}
