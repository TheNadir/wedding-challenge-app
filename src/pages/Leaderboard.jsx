import NavBar from '../components/NavBar'

/**
 * Leaderboard — shows completion counts per player.
 *
 * Full implementation in step 07-leaderboard.md.
 */
export default function Leaderboard() {
  return (
    <>
      <NavBar />
      <main style={styles.main}>
        <h1 style={styles.heading}>🏆 Leaderboard</h1>
        <p style={styles.placeholder}>
          Player rankings coming in step 7 — will show completion counts per
          guest.
        </p>
      </main>
    </>
  )
}

const styles = {
  main: {
    padding: '1.5rem 1rem',
    maxWidth: 600,
    margin: '0 auto',
  },
  heading: {
    fontSize: '1.5rem',
    color: '#4c1d95',
    marginBottom: '1rem',
  },
  placeholder: {
    color: '#6b7280',
    lineHeight: 1.6,
  },
}
