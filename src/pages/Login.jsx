import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import styles from './Login.module.css'

/**
 * Login — public landing page.
 *
 * - If auth is still loading, shows a full-screen spinner so there's no flash.
 * - If the user is already signed in, redirects straight to /challenges.
 * - Otherwise shows Google sign-in and email/password options with a sign-up toggle.
 */
export default function Login() {
  const { user, loading, signInWithGoogle, signInWithEmail, signUpWithEmail, resetPassword } = useAuth()
  const navigate = useNavigate()

  const [mode, setMode] = useState('signin') // 'signin' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [emailLoading, setEmailLoading] = useState(false)
  const [emailError, setEmailError] = useState(null)
  const [resetSent, setResetSent] = useState(false)
  const [signUpSuccess, setSignUpSuccess] = useState(false)

  useEffect(() => {
    if (!loading && user) {
      navigate('/challenges', { replace: true })
    }
  }, [user, loading, navigate])

  // Check for an error passed back from the auth callback.
  const errorMsg = new URLSearchParams(window.location.search).get('error')

  function switchMode(newMode) {
    setMode(newMode)
    setEmailError(null)
    setResetSent(false)
    setConfirmPassword('')
  }

  async function handleEmailSignIn(e) {
    e.preventDefault()
    setEmailError(null)
    setEmailLoading(true)
    const { error } = await signInWithEmail(email, password)
    setEmailLoading(false)
    if (error) {
      setEmailError(error.message)
    } else {
      navigate('/challenges', { replace: true })
    }
  }

  async function handleEmailSignUp(e) {
    e.preventDefault()
    setEmailError(null)
    if (password !== confirmPassword) {
      setEmailError('Passwords do not match.')
      return
    }
    if (password.length < 6) {
      setEmailError('Password must be at least 6 characters.')
      return
    }
    setEmailLoading(true)
    const { error } = await signUpWithEmail(email, password)
    setEmailLoading(false)
    if (error) {
      setEmailError(error.message)
    } else {
      setSignUpSuccess(true)
    }
  }

  async function handleForgotPassword() {
    if (!email) {
      setEmailError('Enter your email address above, then click "Forgot password?"')
      return
    }
    setEmailError(null)
    const { error } = await resetPassword(email)
    if (error) {
      setEmailError(error.message)
    } else {
      setResetSent(true)
    }
  }

  if (loading) {
    return (
      <div className={styles.spinnerPage}>
        <div className={styles.spinner} aria-label="Loading…" />
      </div>
    )
  }

  if (signUpSuccess) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <img src="/icons/homescreen_icon.png" alt="" className={styles.logo} aria-hidden="true" />
          <h1 className={styles.coupleNames}>Neha &amp; Sean</h1>
          <h2 className={styles.heading}>Check your email</h2>
          <p className={styles.tagline}>
            We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account, then come back and sign in.
          </p>
          <button
            className={styles.emailBtn}
            type="button"
            onClick={() => { setSignUpSuccess(false); switchMode('signin') }}
          >
            Back to sign in
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <img src="/icons/homescreen_icon.png" alt="" className={styles.logo} aria-hidden="true" />
        <h1 className={styles.coupleNames}>Neha &amp; Sean</h1>
        <h2 className={styles.heading}>Wedding Challenges</h2>
        <p className={styles.tagline}>
          {mode === 'signin' ? 'Sign in to start completing challenges' : 'Create an account to join the fun'}
        </p>

        {errorMsg && (
          <p className={styles.error} role="alert">
            Sign-in failed: {decodeURIComponent(errorMsg)}
          </p>
        )}

        {mode === 'signin' && (
          <button
            className={styles.googleBtn}
            onClick={signInWithGoogle}
            type="button"
          >
            <GoogleIcon />
            Sign in with Google
          </button>
        )}

        <div className={styles.divider}>
          <span>or</span>
        </div>

        <form
          className={styles.emailForm}
          onSubmit={mode === 'signin' ? handleEmailSignIn : handleEmailSignUp}
          noValidate
        >
          <input
            className={styles.input}
            type="email"
            placeholder="Email"
            autoComplete="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input
            className={styles.input}
            type="password"
            placeholder="Password"
            autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          {mode === 'signup' && (
            <input
              className={styles.input}
              type="password"
              placeholder="Confirm password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
            />
          )}
          <button
            className={styles.emailBtn}
            type="submit"
            disabled={emailLoading}
          >
            {emailLoading
              ? (mode === 'signin' ? 'Signing in…' : 'Creating account…')
              : (mode === 'signin' ? 'Sign in with Email' : 'Create Account')}
          </button>
        </form>

        {emailError && (
          <p className={styles.error} role="alert">
            {emailError}
          </p>
        )}

        {mode === 'signin' && (
          resetSent ? (
            <p className={styles.resetSuccess}>
              Check your email for a reset link.
            </p>
          ) : (
            <button
              className={styles.forgotLink}
              type="button"
              onClick={handleForgotPassword}
            >
              Forgot password?
            </button>
          )
        )}

        <p className={styles.toggleRow}>
          {mode === 'signin' ? (
            <>
              Don&apos;t have an account?{' '}
              <button className={styles.toggleLink} type="button" onClick={() => switchMode('signup')}>
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button className={styles.toggleLink} type="button" onClick={() => switchMode('signin')}>
                Sign in
              </button>
            </>
          )}
        </p>
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
