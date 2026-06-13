import { useMemo } from 'react'
import NavBar from '../components/NavBar'
import { useAdminData } from '../hooks/useAdminData'
import styles from './Admin.module.css'

export default function Admin() {
  const { leaderboard, challenges, submissions, profileMap, loading, error, refetch } =
    useAdminData()

  const challengeSubmissionsMap = useMemo(() => {
    const map = {}
    for (const sub of submissions) {
      if (!map[sub.challenge_id]) map[sub.challenge_id] = []
      map[sub.challenge_id].push({
        ...sub,
        display_name: profileMap[sub.user_id]?.display_name ?? sub.user_id,
      })
    }
    return map
  }, [submissions, profileMap])

  if (loading) {
    return (
      <>
        <NavBar />
        <main className={styles.main}>
          <div className={styles.skeletonWrap}>
            <div className={styles.skeleton} />
            <div className={styles.skeleton} />
            <div className={styles.skeleton} />
            <div className={styles.skeleton} />
          </div>
        </main>
      </>
    )
  }

  if (error) {
    return (
      <>
        <NavBar />
        <main className={styles.main}>
          <div className={styles.errorBox}>
            <span className={styles.errorIcon}>⚠️</span>
            <p className={styles.errorText}>{error.message ?? 'Failed to load admin data.'}</p>
            <button className={styles.retryBtn} onClick={refetch} type="button">
              Try again
            </button>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <NavBar />
      <main className={styles.main}>
        <h1 className={styles.pageTitle}>Admin Console</h1>

        {/* ── Section 1: Leaderboard ── */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Leaderboard</h2>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>#</th>
                <th>Guest</th>
                <th style={{ textAlign: 'right' }}>Completed</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((row, i) => {
                const initial = (row.display_name ?? '?')[0].toUpperCase()
                return (
                  <tr key={row.user_id}>
                    <td className={styles.rank}>{i + 1}</td>
                    <td>
                      <div className={styles.nameCell}>
                        {row.avatar_url ? (
                          <img
                            src={row.avatar_url}
                            alt={row.display_name}
                            className={styles.avatar}
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className={styles.avatarFallback} aria-hidden="true">
                            {initial}
                          </div>
                        )}
                        {row.display_name ?? 'Unknown'}
                      </div>
                    </td>
                    <td className={styles.completedCell}>
                      {row.completed_count} / {challenges.length}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </section>

        {/* ── Section 2: Per-Challenge Breakdown ── */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Per-Challenge Breakdown</h2>
          {challenges.map(challenge => {
            const subs = challengeSubmissionsMap[challenge.id] ?? []
            return (
              <div key={challenge.id} className={styles.challengeGroup}>
                <div className={styles.challengeHeader}>
                  <span className={styles.orderBadge}>{challenge.sort_order}</span>
                  <h3 className={styles.challengeTitle}>{challenge.title}</h3>
                  <span className={styles.submissionCount}>
                    {subs.length} {subs.length === 1 ? 'submission' : 'submissions'}
                  </span>
                </div>
                {subs.length === 0 ? (
                  <p className={styles.noSubmissions}>No submissions yet.</p>
                ) : (
                  <ul className={styles.submitterList}>
                    {subs.map(sub => (
                      <li key={sub.id} className={styles.submitterRow}>
                        <span className={styles.submitterName}>{sub.display_name}</span>
                        <a
                          href={sub.photo_url}
                          target="_blank"
                          rel="noreferrer"
                          className={styles.photoLink}
                        >
                          View photo
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )
          })}
        </section>
      </main>
    </>
  )
}
