import NavBar from '../components/NavBar'
import { useAuth } from '../hooks/useAuth'
import { useLeaderboard } from '../hooks/useLeaderboard'
import styles from './Leaderboard.module.css'

const RANK_MEDALS = ['🥇', '🥈', '🥉']

function Avatar({ url, displayName }) {
  if (url) {
    return (
      <img
        src={url}
        alt={displayName}
        className={styles.avatar}
        referrerPolicy="no-referrer"
      />
    )
  }
  const initial = (displayName ?? '?')[0].toUpperCase()
  return <div className={styles.avatarFallback} aria-hidden="true">{initial}</div>
}

function RankBadge({ rank }) {
  if (rank <= 3) {
    return <span className={styles.medal} aria-label={`Rank ${rank}`}>{RANK_MEDALS[rank - 1]}</span>
  }
  return (
    <span className={`${styles.rankNumber} ${styles[`rank${rank <= 10 ? rank : 'rest'}`]}`}>
      {rank}
    </span>
  )
}

function formatTime(date) {
  if (!date) return null
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

export default function Leaderboard() {
  const { user } = useAuth()
  const { players, totalChallenges, loading, error, lastUpdated, refetch } = useLeaderboard()

  if (loading) {
    return (
      <>
        <NavBar />
        <main className={styles.main} aria-busy="true" aria-label="Loading leaderboard">
          <div className={styles.header}>
            <h1 className={styles.heading}>Leaderboard</h1>
          </div>
          <ul className={styles.skeletonList} aria-hidden="true">
            {Array.from({ length: 5 }, (_, i) => (
              <li key={i} className={styles.skeleton} />
            ))}
          </ul>
        </main>
      </>
    )
  }

  if (error) {
    return (
      <>
        <NavBar />
        <main className={styles.main}>
          <div className={styles.header}>
            <h1 className={styles.heading}>Leaderboard</h1>
          </div>
          <div className={styles.errorBox} role="alert">
            <span className={styles.errorIcon}>⚠️</span>
            <p className={styles.errorText}>Couldn't load the leaderboard. Check your connection and try again.</p>
            <button className={styles.retryBtn} onClick={refetch} type="button">Try again</button>
          </div>
        </main>
      </>
    )
  }

  const hasPlayers = players.some(p => Number(p.completed_count) > 0)

  return (
    <>
      <NavBar />
      <main className={styles.main}>
        <div className={styles.header}>
          <h1 className={styles.heading}>Leaderboard</h1>
          <div className={styles.meta}>
            {lastUpdated && (
              <span className={styles.timestamp}>Updated {formatTime(lastUpdated)}</span>
            )}
            <button className={styles.refreshBtn} onClick={refetch} type="button">
              Refresh
            </button>
          </div>
        </div>

        {!hasPlayers ? (
          <div className={styles.emptyBox}>
            <span className={styles.emptyIcon} aria-hidden="true">🏆</span>
            <p className={styles.emptyText}>No one has completed a challenge yet — be the first!</p>
          </div>
        ) : (
          <ol className={styles.list} aria-label="Leaderboard rankings">
            {players.map((player, index) => {
              const rank = index + 1
              const count = Number(player.completed_count)
              const pct = totalChallenges > 0 ? (count / totalChallenges) * 100 : 0
              const isMe = player.user_id === user?.id

              return (
                <li
                  key={player.user_id}
                  className={`${styles.row} ${isMe ? styles.rowMe : ''} ${rank === 1 ? styles.rowFirst : ''}`}
                >
                  <div className={styles.rankCell}>
                    <RankBadge rank={rank} />
                  </div>

                  <Avatar url={player.avatar_url} displayName={player.display_name} />

                  <div className={styles.info}>
                    <div className={styles.nameRow}>
                      <span className={styles.playerName}>{player.display_name ?? 'Guest'}</span>
                      {isMe && <span className={styles.youBadge}>You</span>}
                    </div>
                    {player.email && (
                      <span className={styles.email}>{player.email}</span>
                    )}
                    <div className={styles.progressWrap}>
                      <div
                        className={styles.progressTrack}
                        role="progressbar"
                        aria-valuenow={count}
                        aria-valuemin={0}
                        aria-valuemax={totalChallenges}
                        aria-label={`${count} of ${totalChallenges} challenges completed`}
                      >
                        <div className={styles.progressFill} style={{ width: `${pct}%` }} />
                      </div>
                      <span className={styles.countLabel}>{count} / {totalChallenges}</span>
                    </div>
                  </div>
                </li>
              )
            })}
          </ol>
        )}
      </main>
    </>
  )
}
