'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { getEntry } from '@/lib/entries';
import styles from './EntryDetailPage.module.scss';

type Entry = {
  id: string;
  date: string;          
  title: string;
  problem: string;       
  tech: string[];
  notes: string;
  code: string;
};

function toStringParam(v: string | string[] | undefined): string | null {
  if (!v) return null;
  return Array.isArray(v) ? v[0] : v;
}

function formatDateTime(value: string) {

  if (!value) return '—';

  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(value)) {
    const [d, t] = value.split('T');
    return `${d} @ ${t}`;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;

  const parsed = new Date(value);
  if (!isNaN(parsed.getTime())) {
    const yyyy = parsed.getFullYear();
    const mm = String(parsed.getMonth() + 1).padStart(2, '0');
    const dd = String(parsed.getDate()).padStart(2, '0');
    const hh = String(parsed.getHours()).padStart(2, '0');
    const mi = String(parsed.getMinutes()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd} @ ${hh}:${mi}`;
  }

  return value;
}

export default function EntryDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user, loading } = useAuth();

  const entryId = useMemo(() => toStringParam((params as any)?.id), [params]);

  const [entry, setEntry] = useState<Entry | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (!user || !entryId) return;

    setPageLoading(true);
    setError(null);

    getEntry(user.uid, entryId)
      .then((data: any) => {
        if (!data) {
          setEntry(null);
          setError('Entry not found.');
          return;
        }

        const techArray =
          Array.isArray(data.tech) ? data.tech : typeof data.tech === 'string' ? data.tech.split(',') : [];

        setEntry({
          id: entryId,
          date: data.date ?? '',
          title: data.title ?? '',
          problem: data.problem ?? '',
          tech: techArray.map((t: string) => t.trim()).filter(Boolean),
          notes: data.notes ?? '',
          code: data.code ?? '',
        });
      })
      .catch((err: any) => setError(err?.message ?? 'Failed to load entry.'))
      .finally(() => setPageLoading(false));
  }, [user, entryId]);

  if (loading || pageLoading) return <p className={styles.loading}>Loading entry…</p>;
  if (!user) return null;

  return (
    <main className={styles.page}>
      <header className={styles.topBar}>
        <button className={styles.ghostBtn} onClick={() => router.push('/entries')} type="button">
          ⟵ BACK
        </button>

        <div className={styles.titleWrap}>
          <h1 className={styles.title}>ENTRY</h1>
          <span className={styles.cursor}>▮</span>
        </div>

        <div className={styles.actions}>
          {entryId && (
            <button
              className={styles.primaryBtn}
              onClick={() => router.push(`/entries/${entryId}/edit`)}
              type="button"
            >
              ✎ EDIT
            </button>
          )}
        </div>
      </header>

      {error && <p className={styles.error}>{error}</p>}

      {!error && entry && (
        <section className={styles.card}>
          <div className={styles.headerRow}>
            <div className={styles.headerText}>
              <p className={styles.metaTop}>{formatDateTime(entry.date)}</p>

              <div className={styles.titleRow}>
                <h2 className={styles.entryTitle}>{entry.title}</h2>
              </div>
            </div>
          </div>

          {entry.tech?.length > 0 && (
            <div className={styles.chips}>
              {entry.tech.map((t) => (
                <span key={t} className={styles.chip}>
                  {t}
                </span>
              ))}
            </div>
          )}

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Problem:</h3>
            <p className={styles.problem}>{entry.problem || '—'}</p>
          </div>

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Notes:</h3>
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
