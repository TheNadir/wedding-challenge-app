import NavBar from "../components/NavBar";
import ChallengeCard from "../components/ChallengeCard";
import { useAuth } from "../hooks/useAuth";
import { useChallenges } from "../hooks/useChallenges";
import styles from "./Challenges.module.css";

/** Number of skeleton cards to show while loading. */
const SKELETON_COUNT = 6;

/**
 * Challenges — the main challenge-list page.
 *
 * Shows a progress bar at the top, then a card per challenge.
 * Cards are masked as "???" until the user submits a photo for that challenge.
 */
export default function Challenges() {
  const { user } = useAuth();
  const { challenges, submissions, loading, error, refetch } =
    useChallenges(user);

  // Build challenge_id → submission lookup so card renders are O(1).
  const submissionMap = Object.fromEntries(
    submissions.map((sub) => [sub.challenge_id, sub]),
  );

  const completedCount = submissions.length;
  const totalCount = challenges.length;
  const allDone = totalCount > 0 && completedCount === totalCount;

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <>
        <NavBar />
        <main
          className={styles.main}
          aria-busy="true"
          aria-label="Loading challenges"
        >
          <div className={styles.skeletonProgress} aria-hidden="true" />
          <ul className={styles.skeletonList} aria-hidden="true">
            {Array.from({ length: SKELETON_COUNT }, (_, i) => (
              <li key={i} className={styles.skeleton} />
            ))}
          </ul>
        </main>
      </>
    );
  }

  // ── Error state ───────────────────────────────────────────────────────────
  if (error) {
    return (
      <>
        <NavBar />
        <main className={styles.main}>
          <div className={styles.errorBox} role="alert">
            <span className={styles.errorIcon}>⚠️</span>
            <p className={styles.errorText}>
              Couldn't load the challenges. Check your connection and try again.
            </p>
            <button className={styles.retryBtn} onClick={refetch} type="button">
              Try again
            </button>
          </div>
        </main>
      </>
    );
  }

  // ── Main view ─────────────────────────────────────────────────────────────
  return (
    <>
      <NavBar />
      <main className={styles.main}>
        {/* ── Progress indicator ─────────────────────────────────────── */}
        <div className={styles.progressWrap} aria-label="Challenge progress">
          <div className={styles.progressLabel}>
            <span className={styles.progressCount}>{completedCount}</span>
            <span className={styles.progressText}>
              of {totalCount} challenge{totalCount !== 1 ? "s" : ""} completed
            </span>
          </div>

          <div
            className={styles.progressTrack}
            role="progressbar"
            aria-valuenow={completedCount}
            aria-valuemin={0}
            aria-valuemax={totalCount}
            aria-label={`${completedCount} of ${totalCount} completed`}
          >
            <div
              className={styles.progressFill}
              style={{
                width: totalCount
                  ? `${(completedCount / totalCount) * 100}%`
                  : "0%",
              }}
            />
          </div>

          {allDone && (
            <p className={styles.allDone}>
              🎉 You've completed every challenge!
            </p>
          )}
        </div>

        {/* ── Challenge cards ────────────────────────────────────────── */}
        <ul className={styles.list} aria-label="Challenges">
          {challenges.map((challenge) => {
            const submission = submissionMap[challenge.id] ?? null;
            return (
              <li key={challenge.id} className={styles.item}>
                <ChallengeCard
                  challenge={challenge}
                  isCompleted={submission !== null}
                  submission={submission}
                />
              </li>
            );
          })}
        </ul>
      </main>
    </>
  );
}
