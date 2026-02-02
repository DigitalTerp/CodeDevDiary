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

    const uid = user.uid;
    setEntriesLoading(true);
    setError(null);

    getEntries(uid)
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
        search={''}
        onSearchChange={() => {}}
        techOptions={[]}
        techFilter={''}
        onTechFilterChange={() => {}}
        onGoEntries={() => {
          router.push('/entries');
          setDrawerOpen(false);
        }}
        onNewEntry={() => {
          router.push('/entries/new');
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
            className={styles.ghostBtn}
            onClick={() => router.push('/entries/browse')}
            type="button"
          >
            Browse + Search
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
            <article key={entry.id} className={styles.listCard}>
              <div className={styles.listMain}>
                <div className={styles.listHeader}>
                  <span className={styles.listDate}>{entry.date}</span>

                  <div className={styles.listTitleRow}>
                    <h2 className={styles.listTitle}>{entry.title}</h2>
                  </div>
                </div>

                <div className={styles.chips}>
                  {(entry.tech ?? []).slice(0, 6).map((t) => (
                    <span key={t} className={styles.chip}>
                      {t}
                    </span>
                  ))}
                </div>

                <p className={styles.listNotes}>
                  {entry.notes?.length > 140 ? `${entry.notes.slice(0, 140)}…` : entry.notes}
                </p>
              </div>

              <div className={styles.listActions}>
                <button
                  className={styles.viewBtn}
                  type="button"
                  onClick={() => router.push(`/entries/${entry.id}`)}
                >
                  View
                </button>

                <button
                  className={styles.editBtn}
                  type="button"
                  onClick={() => router.push(`/entries/${entry.id}/edit`)}
                >
                  Edit
                </button>
              </div>
            </article>
          ))}
        </section>
      )}

      {entries.length > 5 && (
        <div className={styles.moreRow}>
          <button
            className={styles.ghostBtn}
            type="button"
            onClick={() => router.push('/entries/browse')}
          >
            View all entries →
          </button>
        </div>
      )}
    </main>
  );
}
