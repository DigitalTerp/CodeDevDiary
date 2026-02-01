'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { getEntryById } from '@/lib/entries';
import styles from './EntryDetailPage.module.scss';

type Entry = {
  id: string;
  date: string;
  title: string;
  tech: string[];
  notes: string;
  code: string;
};

export default function EntryDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { user, loading } = useAuth();

  const [entry, setEntry] = useState<Entry | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const entryId = params?.id;

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (!user || !entryId) return;

    setPageLoading(true);
    setError(null);

    getEntryById(user.uid, entryId)
      .then((data: any) => {
        // make sure id is present for typing
        setEntry({ id: entryId, ...data });
      })
      .catch((err: any) => setError(err?.message ?? 'Failed to load entry.'))
      .finally(() => setPageLoading(false));
  }, [user, entryId]);

  if (loading || pageLoading) return <p className={styles.loading}>Loading entry…</p>;
  if (!user) return null;

  return (
    <main className={styles.page}>
      <header className={styles.topBar}>
        <button className={styles.ghostBtn} onClick={() => router.push('/entries')}>
          ← Back
        </button>

        <div className={styles.titleWrap}>
          <h1 className={styles.title}>Entry</h1>
          <span className={styles.cursor}>▮</span>
        </div>

        <div className={styles.actions}>
          <button
            className={styles.primaryBtn}
            onClick={() => router.push(`/entries/${entryId}/edit`)}
          >
            Edit
          </button>
        </div>
      </header>

      {error && <p className={styles.error}>{error}</p>}

      {!error && entry && (
        <section className={styles.card}>
          <div className={styles.headerRow}>
            <div>
              <h2 className={styles.entryTitle}>{entry.title}</h2>
              <p className={styles.meta}>{entry.date}</p>
            </div>
          </div>

          <div className={styles.chips}>
            {(entry.tech ?? []).map((t) => (
              <span key={t} className={styles.chip}>
                {t}
              </span>
            ))}
          </div>

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Notes</h3>
            <p className={styles.notes}>{entry.notes || '—'}</p>
          </div>

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Syntax</h3>
            <pre className={styles.codeBlock}>
              <code>{entry.code || ''}</code>
            </pre>
          </div>
        </section>
      )}
    </main>
  );
}
