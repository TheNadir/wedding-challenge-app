import NavBar from '../components/NavBar'

/**
 * Challenges — lists all photo challenges.
 *
 * Titles are masked as "???" until the player submits a photo.
 * Full implementation in step 05-challenge-list.md.
 */
export default function Challenges() {
  return (
    <>
      <NavBar />
      <main style={styles.main}>
        <h1 style={styles.heading}>📸 Challenges</h1>
        <p style={styles.placeholder}>
          Challenge list coming in step 5 — each card will show ??? until you
          submit a photo.
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
