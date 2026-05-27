import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

/**
 * Login — public landing page.
 *
 * Redirects to /challenges if the user is already signed in.
 * Real Google OAuth sign-in implemented in step 04-auth-flow.md.
 */
export default function Login() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  // If already authenticated, skip straight to challenges.
  useEffect(() => {
    if (!loading && user) {
      navigate('/challenges', { replace: true })
    }
  }, [user, loading, navigate])

  async function handleGoogleSignIn() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/challenges`,
      },
    })
    if (error) console.error('Sign-in error:', error.message)
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.heading}>💍 Wedding Challenges</h1>
        <p style={styles.sub}>Complete photo challenges throughout the day!</p>

        <button onClick={handleGoogleSignIn} style={styles.googleBtn}>
          Sign in with Google
        </button>
      </div>
    </div>
  )
}

const styles = {
  page: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100dvh',
    background: 'linear-gradient(135deg, #f3e8ff 0%, #ede9fe 100%)',
    padding: '1rem',
  },
  card: {
    background: '#ffffff',
    borderRadius: 16,
    padding: '2.5rem 2rem',
    textAlign: 'center',
    boxShadow: '0 4px 24px rgba(124,58,237,0.12)',
    maxWidth: 360,
    width: '100%',
  },
  heading: {
    margin: '0 0 0.5rem',
    fontSize: '1.75rem',
    color: '#4c1d95',
  },
  sub: {
    color: '#6b7280',
    marginBottom: '2rem',
  },
  googleBtn: {
    width: '100%',
    padding: '0.75rem',
    background: '#7c3aed',
    color: '#ffffff',
    border: 'none',
    borderRadius: 8,
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
  },
}
