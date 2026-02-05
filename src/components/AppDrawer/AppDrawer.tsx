'use client';

import styles from './AppDrawer.module.scss';

type Props = {
  open: boolean;
  onClose: () => void;

  greeting: string;
  userEmail: string;

  onGoEntries: () => void;
  onNewEntry: () => void;

  onBrowse: () => void;

  onLogout: () => void;
};

export default function AppDrawer({
  open,
  onClose,
  greeting,
  userEmail,
  onGoEntries,
  onNewEntry,
  onBrowse,
  onLogout,
}: Props) {
  if (!open) return null;

  return (
    <>
      <div className={styles.overlay} onClick={onClose} />

      <aside className={styles.drawer} role="dialog" aria-modal="true" aria-label="Menu">
        <div className={styles.header}>
          <div className={styles.headerTitle}>
            Menu <span className={styles.cursor}>▮</span>
          </div>

          <button
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close menu"
            type="button"
          >
            ✕
          </button>
        </div>

        <div className={styles.userBlock}>
          <div className={styles.greeting}>{greeting},</div>
          <div className={styles.email}>{userEmail}</div>
        </div>

        <div className={styles.actions}>
          <button className={styles.linkBtn} onClick={onGoEntries} type="button">
            ⌁ Log Entries
          </button>

          <button className={styles.primaryBtn} onClick={onNewEntry} type="button">
            ⊕ New Entry
          </button>

          <button className={styles.ghostBtn} onClick={onBrowse} type="button">
            ⧉ Browse + Search
          </button>
        </div>

        <button className={styles.logoutBtn} onClick={onLogout} type="button">
          ⛔ Logout
        </button>
      </aside>
    </>
  );
}
