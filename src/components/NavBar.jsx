import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

/**
 * NavBar — persistent top navigation shown on all protected pages.
 * Placeholder — styled in a later step.
 */
export default function NavBar() {
  const navigate = useNavigate()

  async function handleSignOut() {
    await supabase.auth.signOut()
    navigate('/')
  }

  return (
    <nav style={styles.nav}>
      <Link to="/challenges" style={styles.link}>
        Challenges
      </Link>
      <Link to="/leaderboard" style={styles.link}>
        Leaderboard
      </Link>
      <button onClick={handleSignOut} style={styles.button}>
        Sign out
      </button>
    </nav>
  )
}

const styles = {
  nav: {
    display: 'flex',
    gap: '1rem',
    padding: '0.75rem 1rem',
    background: '#7c3aed',
    alignItems: 'center',
  },
  link: {
    color: '#ffffff',
    textDecoration: 'none',
    fontWeight: 600,
  },
  button: {
    marginLeft: 'auto',
    background: 'transparent',
    border: '1px solid #ffffff',
    color: '#ffffff',
    padding: '0.25rem 0.75rem',
    borderRadius: 4,
    cursor: 'pointer',
  },
}
