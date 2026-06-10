import { NavLink } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useFeatureFlags } from "../context/FeatureFlagsContext";
import styles from "./NavBar.module.css";

/**
 * NavBar — persistent top navigation shown on all protected pages.
 *
 * Left side  : app name / logo
 * Right side : user avatar + display name + sign-out button
 */
export default function NavBar() {
  const { user, signOut } = useAuth();
  const { flags } = useFeatureFlags();

  const avatarUrl = user?.user_metadata?.avatar_url;
  const displayName =
    user?.user_metadata?.full_name ??
    user?.user_metadata?.name ??
    user?.email ??
    "Guest";

  // Show just the first name so it fits on mobile.
  const firstName = displayName.split(" ")[0];

  console.log("flags ==>", flags);

  return (
    <header className={styles.header}>
      {/* ── Brand ─────────────────────────────────────────────────── */}
      <NavLink to="/challenges" className={styles.brand}>
        <span aria-hidden="true">💍</span>
        <span className={styles.brandName}>Wedding Challenges</span>
      </NavLink>

      {/* ── Nav links (hidden on very small screens, shown on ≥ 400px) ── */}
      <nav className={styles.nav} aria-label="Main navigation">
        <NavLink
          to="/challenges"
          className={({ isActive }) =>
            [styles.navLink, isActive ? styles.navLinkActive : ""].join(" ")
          }
        >
          Challenges
        </NavLink>
{flags.camera_roll && (
          <NavLink
            to="/camera-roll"
            className={({ isActive }) =>
              [styles.navLink, isActive ? styles.navLinkActive : ""].join(" ")
            }
          >
            Disposable Camera
          </NavLink>
        )}
      </nav>

      {/* ── User info + sign-out ───────────────────────────────────── */}
      <div className={styles.userArea}>
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={displayName}
            className={styles.avatar}
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className={styles.avatarFallback} aria-hidden="true">
            {firstName[0].toUpperCase()}
          </div>
        )}

        <span className={styles.name}>{firstName}</span>

        <button
          onClick={signOut}
          className={styles.signOutBtn}
          type="button"
          aria-label="Sign out"
        >
          Sign out
        </button>
      </div>
    </header>
  );
}
