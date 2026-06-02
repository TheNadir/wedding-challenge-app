import NavBar from '../components/NavBar'
import { useAuth } from '../hooks/useAuth'
import { useLeaderboard } from '../hooks/useLeaderboard'
import styles from './Leaderboard.module.css'

const SKELETON_COUNT = 5

function formatTime(date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

function PlayerAvatar({ avatarUrl, displayName }) {
  const initial = (displayName?.[0] ?? '?').toUpperCase()
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={displayName ?? 'Player'}
        className={styles.avatar}
        referrerPolicy="no-referrer"
      />
    )
  }
  return (
    <div className={styles.avatarFallback} aria-hidden="true">
      {initial}
    </div>
  )
}

function PlayerRow({ player, rank, totalChallenges, isMe }) {
  const count = Number(player.completed_count)
  const pct = totalChallenges > 0 ? (count / totalChallenges) * 100 : 0

  const rankClass =
    rank === 1 ? styles.rankGold
    : rank === 2 ? styles.rankSilver
    : rank === 3 ? styles.rankBronze
    : ''

  const rowClass = [styles.row, isMe ? styles.rowMe : ''].filter(Boolean).join(' ')

  return (
    <li className={rowClass} aria-current={isMe ? 'true' : undefined}>
      <div
        className={[styles.rankBadge, rankClass].filter(Boolean).join(' ')}
        aria-label={`Rank ${rank}`}
      >
        {rank}
      </div>

      <PlayerAvatar avatarUrl={player.avatar_url} displayName={player.display_name} />

      <div className={styles.playerInfo}>
        <div className={styles.nameRow}>
          <span className={styles.playerName}>{player.display_name ?? 'Guest'}</span>
          {isMe && <span className={styles.youBadge}>You</span>}
        </div>

        <div className={styles.progressLabel}>
          {count} / {totalChallenges} challenge{totalChallenges !== 1 ? 's' : ''}
        </div>

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
      </div>
    </li>
  )
}

export default function Leaderboard() {
  const { user } = useAuth()
  const { players, totalChallenges, loading, error, lastUpdated, refetch } = useLeaderboard()

  // Only show players who have completed at least one challenge.
  const activePlayers = players.filter(p => Number(p.completed_count) > 0)

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <>
        <NavBar />
        <main className={styles.main} aria-busy="true" aria-label="Loading leaderboard">
          <h1 className={styles.heading}>Leaderboard</h1>
          <ul className={styles.skeletonList} aria-hidden="true">
            {Array.from({ length: SKELETON_COUNT }, (_, i) => (
              <li key={i} className={styles.skeleton} />
            ))}
          </ul>
        </main>
      </>
    )
  }

  // ── Error state ───────────────────────────────────────────────────────────
  if (error) {
    return (
      <>
        <NavBar />
        <main className={styles.main}>
          <h1 className={styles.heading}>Leaderboard</h1>
          <div className={styles.errorBox} role="alert">
            <span className={styles.errorIcon}>⚠️</span>
            <p className={styles.errorText}>
              Couldn't load the leaderboard. Check your connection and try again.
            </p>
            <button className={styles.retryBtn} onClick={refetch} type="button">
              Try again
            </button>
          </div>
        </main>
      </>
    )
  }

  // ── Main view ─────────────────────────────────────────────────────────────
  return (
    <>
      <NavBar />
      <main className={styles.main}>
        <h1 className={styles.heading}>Leaderboard</h1>

        <div className={styles.meta}>
          <span className={styles.timestamp}>
            {lastUpdated ? `Updated at ${formatTime(lastUpdated)}` : ''}
          </span>
          <button
            className={styles.refreshBtn}
            onClick={refetch}
            type="button"
            aria-label="Refresh leaderboard"
          >
            Refresh
          </button>
        </div>

        {activePlayers.length === 0 ? (
          <div className={styles.empty}>
            <span className={styles.emptyIcon} aria-hidden="true">📷</span>
            <p className={styles.emptyTitle}>No completions yet</p>
            <p className={styles.emptyText}>
              No one has completed a challenge yet — be the first!
            </p>
          </div>
        ) : (
          <ul className={styles.list} aria-label="Player rankings">
            {activePlayers.map((player, index) => (
              <PlayerRow
                key={player.user_id}
                player={player}
                rank={index + 1}
                totalChallenges={totalChallenges}
                isMe={player.user_id === user?.id}
              />
            ))}
          </ul>
        )}
      </main>
    </>
  )
}
