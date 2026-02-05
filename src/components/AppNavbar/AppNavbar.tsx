'use client';

import styles from './AppNavbar.module.scss';

type AppNavbarProps = {
  userEmail: string;
  onGoEntries: () => void;
  onNewEntry: () => void;
  onLogout: () => void;
  onOpenMenu?: () => void;
};

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 18) return 'Good Afternoon';
  return 'Good Evening';
}

export default function AppNavbar({
  userEmail,
  onGoEntries,
  onNewEntry,
  onLogout,
  onOpenMenu,
}: AppNavbarProps) {
  const greeting = getGreeting();

  return (
    <nav className={styles.navbar}>
      <button
        className={styles.hamburger}
        onClick={onOpenMenu}
        aria-label="Open menu"
        type="button"
      >
        ☰
      </button>

      <div className={styles.left}>
        <div className={styles.greeting}>{greeting},</div>
        <div className={styles.email}>{userEmail}</div>
      </div>

      <button className={styles.center} onClick={onGoEntries} type="button">
        <span className={styles.title}>Code Dev. Diary</span>
        <span className={styles.cursor}>▮</span>
      </button>

      <div className={styles.right}>
        <button className={styles.primaryBtn} onClick={onNewEntry} type="button">
          <span className={styles.btnIcon}>＋</span>
          New Entry
        </button>

        <button className={styles.linkBtn} onClick={onGoEntries} type="button">
          <span className={styles.btnIcon}>⟡</span>
          Entries
        </button>

        <button className={styles.dangerBtn} onClick={onLogout} type="button">
          <span className={styles.btnIcon}>⨯</span>
          Logout
        </button>
      </div>
    </nav>
  );
}
