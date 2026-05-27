import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

/**
 * ProtectedRoute — wraps a page component and redirects unauthenticated
 * users to the login screen.
 *
 * While the auth state is still loading we render a full-screen spinner so
 * there's no flash of the redirect on page refresh.
 *
 * @param {{ children: React.ReactNode }} props
 */
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div style={styles.center}>
        <div style={styles.spinner} aria-label="Loading…" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/" replace />
  }

  return children
}

const styles = {
  center: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100dvh',
    background: '#ffffff',
  },
  spinner: {
    width: 40,
    height: 40,
    border: '4px solid #e9d5ff',
    borderTopColor: '#7c3aed',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
}
