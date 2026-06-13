import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useIsAdmin } from '../hooks/useIsAdmin'
import styles from './ProtectedRoute.module.css'

export default function AdminRoute({ children }) {
  const { user, loading: authLoading } = useAuth()
  const { isAdmin, loading: adminLoading } = useIsAdmin(user)

  if (authLoading || adminLoading) {
    return (
      <div className={styles.center}>
        <div className={styles.spinner} aria-label="Loading…" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/" replace />
  }

  if (!isAdmin) {
    return <Navigate to="/challenges" replace />
  }

  return children
}
