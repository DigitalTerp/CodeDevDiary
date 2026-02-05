'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { getEntries, DevDiaryEntry } from '@/lib/entries';
import { logOut } from '@/lib/auth';
import AppNavbar from '@/components/AppNavbar/AppNavbar';
import AppDrawer from '@/components/AppDrawer/AppDrawer';
import styles from './EntriesPage.module.scss';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 18) return 'Good Afternoon';
  return 'Good Evening';
}

function formatDateTime(value?: string) {
  if (!value) return '—';

  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(value)) {
    const [d, t] = value.split('T');
    return `${d}  ${t}`;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;

  const parsed = new Date(value);
  if (!isNaN(parsed.getTime())) {
    const yyyy = parsed.getFullYear();
    const mm = String(parsed.getMonth() + 1).padStart(2, '0');
    const dd = String(parsed.getDate()).padStart(2, '0');
    const hh = String(parsed.getHours()).padStart(2, '0');
    const mi = String(parsed.getMinutes()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}  ${hh}:${mi}`;
  }

  return value;
}

export default function EntriesPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const [entries, setEntries] = useState<DevDiaryEntry[]>([]);
  const [entriesLoading, setEntriesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [drawerOpen, setDrawerOpen] = useState(false);

  async function handleLogout() {
    try {
      await logOut();
    } finally {
      router.replace('/');
      router.refresh();
    }
  }

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;

    setEntriesLoading(true);
    setError(null);

    getEntries(user.uid)
      .then(setEntries)
      .catch((err: any) => setError(err?.message ?? 'Failed to load entries.'))
      .finally(() => setEntriesLoading(false));
  }, [user]);

  const latestFive = useMemo(() => entries.slice(0, 5), [entries]);

  if (loading || entriesLoading) return <p className={styles.loading}>Loading entries…</p>;
  if (!user) return null;

  const greeting = getGreeting();

  return (
    <main className={styles.page}>
      <AppNavbar
        userEmail={user.email ?? ''}
        onGoEntries={() => router.push('/entries')}
        onNewEntry={() => router.push('/entries/new')}
        onLogout={handleLogout}
        onOpenMenu={() => setDrawerOpen(true)}
      />

      <AppDrawer
  open={drawerOpen}
  onClose={() => setDrawerOpen(false)}
  greeting={greeting}
  userEmail={user.email ?? ''}
  onGoEntries={() => {
    router.push('/entries');
    setDrawerOpen(false);
  }}
  onNewEntry={() => {
    router.push('/entries/new');
    setDrawerOpen(false);
  }}
  onBrowse={() => {
    router.push('/entries/browse');
    setDrawerOpen(false);
  }}
  onLogout={async () => {
    setDrawerOpen(false);
    await handleLogout();
  }}
/>


      <div className={styles.navSpacer} />

      <header className={styles.topHeader}>
        <div className={styles.titleLine}>
          <h1 className={styles.pageTitle}>Current Entries</h1>
          <span className={styles.count}>({entries.length})</span>
        </div>

        <div className={styles.headerActions}>
          <button
            className={styles.browseBtn}
            onClick={() => router.push('/entries/browse')}
            type="button">
            <span className={styles.browseIcon}>⌕</span>
            <span>Browse</span>
            <span className={styles.cursor}>▮</span>
          </button>
        </div>
      </header>

      <p className={styles.subLine}>
        Showing latest <span className={styles.kbd}>5</span> entries.
      </p>

      {error && <p className={styles.error}>{error}</p>}

      {entries.length === 0 ? (
        <p className={styles.empty}>No entries yet. Click “New Entry” to start logging.</p>
      ) : (
        <section className={styles.list}>
          {latestFive.map((entry) => (
            <article key={entry.id} className={styles.card}>
              <div className={styles.metaRow}>
                <span className={styles.dateTime}>{formatDateTime(entry.date)}</span>
              </div>

              <h2 className={styles.title}>{entry.title}</h2>

              {(entry.tech ?? []).length > 0 && (
                <div className={styles.chips}>
                  {(entry.tech ?? []).slice(0, 6).map((t) => (
                    <span key={t} className={styles.chip}>
                      {t}
                    </span>
                  ))}
                </div>
              )}

              <p className={styles.problem}>
                {(entry as any).problem
                  ? (entry as any).problem.length > 140
                    ? `${(entry as any).problem.slice(0, 140)}…`
                    : (entry as any).problem
                  : '—'}
              </p>

              <div className={styles.actions}>
                <button
                  className={styles.viewBtn}
                  type="button"
                  onClick={() => router.push(`/entries/${entry.id}`)}
                  aria-label="View entry"
                  title="View"
                >
                  🔍 <span className={styles.btnText}>View</span>
                </button>

                <button
                  className={styles.editBtn}
                  type="button"
                  onClick={() => router.push(`/entries/${entry.id}/edit`)}
                  aria-label="Edit entry"
                  title="Edit"
                >
                  ✏️ <span className={styles.btnText}>Edit</span>
                </button>
              </div>
            </article>
          ))}
        </section>
      )}

      {entries.length > 5 && (
        <div className={styles.moreRow}>
          <button className={styles.ghostBtn} type="button" onClick={() => router.push('/entries/browse')}>
            View all entries →
          </button>
        </div>
      )}
    </main>
  );
}
