import { useNavigate } from 'react-router-dom'
import styles from './ChallengeCard.module.css'

/**
 * ChallengeCard — a single challenge entry in the list.
 *
 * When the challenge is NOT yet completed, the title is hidden ("???") and the
 * whole card is tappable, navigating the user to the upload page.
 *
 * When completed, the card reveals the real title + description + submitted
 * photo thumbnail and is no longer tappable.
 *
 * @param {{ challenge: Challenge, isCompleted: boolean, submission: Submission|null }} props
 */
export default function ChallengeCard({ challenge, isCompleted, submission }) {
  const navigate = useNavigate()

  function handleTap() {
    navigate(`/upload/${challenge.id}`)
  }

  // Shared sort-order badge rendered in both states
  const orderBadge = (
    <span className={styles.orderBadge} aria-label={`Challenge ${challenge.sort_order}`}>
      {challenge.sort_order}
    </span>
  )

  if (isCompleted) {
    return (
      <article className={[styles.card, styles.cardComplete].join(' ')}>
        {orderBadge}

        {/* Green checkmark — top-right */}
        <span className={styles.checkBadge} aria-label="Completed">
          <CheckIcon />
        </span>

        {/* Photo thumbnail */}
        {submission?.photo_url && (
          <img
            src={submission.photo_url}
            alt={`Your photo for: ${challenge.title}`}
            className={styles.thumbnail}
          />
        )}

        <div className={styles.textContent}>
          <h2 className={styles.title}>{challenge.title}</h2>
          {challenge.description && (
            <p className={styles.description}>{challenge.description}</p>
          )}
        </div>
      </article>
    )
  }

  // ── Incomplete state ────────────────────────────────────────────────────
  return (
    <article
      className={[styles.card, styles.cardIncomplete].join(' ')}
      onClick={handleTap}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleTap()
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`Challenge ${challenge.sort_order} — tap to complete`}
    >
      {orderBadge}

      <div className={styles.textContent}>
        <h2 className={styles.mysteryTitle} aria-hidden="true">???</h2>
        <p className={styles.srOnly}>Mystery challenge — complete it to reveal the title</p>

        <div className={styles.cta}>
          <CameraIcon />
          <span>Tap to complete this challenge</span>
        </div>
      </div>
    </article>
  )
}

// ── Icon components ─────────────────────────────────────────────────────────

function CameraIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      width={20}
      height={20}
      aria-hidden="true"
      className={styles.cameraIcon}
    >
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx={12} cy={13} r={4} />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      width={14}
      height={14}
      aria-hidden="true"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}
