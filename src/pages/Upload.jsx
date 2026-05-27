import { useParams } from 'react-router-dom'
import NavBar from '../components/NavBar'

/**
 * Upload — camera / photo-library upload for a specific challenge.
 *
 * challengeId is pulled from the URL via useParams().
 * Full implementation in step 06-photo-upload.md.
 */
export default function Upload() {
  const { challengeId } = useParams()

  return (
    <>
      <NavBar />
      <main style={styles.main}>
        <h1 style={styles.heading}>📷 Upload Photo</h1>
        <p style={styles.placeholder}>
          Challenge ID: <code>{challengeId}</code>
        </p>
        <p style={styles.placeholder}>
          Photo upload UI coming in step 6 — will open the camera on mobile.
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
