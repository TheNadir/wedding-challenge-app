import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import styles from './ProtectedRoute.module.css'

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
      <div className={styles.center}>
        <div className={styles.spinner} aria-label="Loading…" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/" replace />
  }

  return children
}
