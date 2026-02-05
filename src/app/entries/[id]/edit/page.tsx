// src/app/entries/[id]/edit/page.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { getEntry, updateEntry } from '@/lib/entries';
import EntryForm from '@/components/EntryForm';
import styles from './EditEntryPage.module.scss';

function toStringParam(v: string | string[] | undefined): string | null {
  if (!v) return null;
  return Array.isArray(v) ? v[0] : v;
}

function normalizeDateTimeLocal(value: unknown) {
  // target: "YYYY-MM-DDTHH:mm" for datetime-local
  const str = typeof value === 'string' ? value : '';
  if (!str) return '';

  // old format: "YYYY-MM-DD"
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return `${str}T12:00`;

  // ISO with seconds? trim to minutes
  if (str.length >= 16) return str.slice(0, 16);

  return str;
}

export default function EditEntryPage() {
  const router = useRouter();
  const params = useParams();
  const { user, loading } = useAuth();

  const id = useMemo(() => toStringParam((params as any)?.id), [params]);

  const [date, setDate] = useState('');
  const [title, setTitle] = useState('');
  const [problem, setProblem] = useState('');
  const [tech, setTech] = useState('');
  const [notes, setNotes] = useState('');
  const [code, setCode] = useState('');

  const [saving, setSaving] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // auth guard
  useEffect(() => {
    if (loading) return;
    if (!user) router.replace('/login');
  }, [loading, user, router]);

  // load entry
  useEffect(() => {
    if (loading) return;
    if (!user) return;

    if (!id) {
      setError('Missing entry id in route.');
      setFetching(false);
      return;
    }

    setFetching(true);
    setError(null);

    getEntry(user.uid, id)
      .then((entry) => {
        if (!entry) {
          setError('Entry not found.');
          return;
        }

        const raw = entry as any;

        const techValue =
          Array.isArray(raw.tech) ? raw.tech.join(', ') : typeof raw.tech === 'string' ? raw.tech : '';

        setDate(normalizeDateTimeLocal(raw.date));
        setTitle(raw.title ?? '');
        setProblem(raw.problem ?? '');
        setTech(techValue);
        setNotes(raw.notes ?? '');
        setCode(raw.code ?? '');
      })
      .catch((err: any) => setError(err?.message ?? 'Failed to load entry.'))
      .finally(() => setFetching(false));
  }, [loading, user, id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !id) return;

    setError(null);
    setSaving(true);

    try {
      await updateEntry(user.uid, id, {
        date,
        title,
        problem,
        tech: tech
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        notes,
        code,
      });

      router.push(`/entries/${id}`);
    } catch (err: any) {
      setError(err?.message ?? 'Failed to update entry.');
    } finally {
      setSaving(false);
    }
  }

  if (loading || fetching) return <p className={styles.loading}>Loading…</p>;
  if (!user) return null;

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.headerLeft}>
            <button className={styles.backBtn} onClick={() => router.back()} type="button">
              ⟵ BACK
            </button>
          </div>

          <div className={styles.headerCenter}>
            <h1 className={styles.title}>
              EDIT ENTRY <span className={styles.cursor}>▮</span>
            </h1>
            <p className={styles.subtitle}>Refine your solution</p>
          </div>

          <div className={styles.headerRight}>
            {id && (
              <button
                className={styles.viewBtn}
                onClick={() => router.push(`/entries/${id}`)}
                type="button"
              >
                ▣ VIEW
              </button>
            )}
          </div>
        </div>
      </header>

      <section className={styles.content}>
        {error && <p className={styles.error}>{error}</p>}

        <EntryForm
          key={id ?? 'edit'}
          date={date}
          title={title}
          problem={problem}
          tech={tech}
          notes={notes}
          code={code}
          onDateChange={setDate}
          onTitleChange={setTitle}
          onProblemChange={setProblem}
          onTechChange={setTech}
          onNotesChange={setNotes}
          onCodeChange={setCode}
          onSubmit={handleSubmit}
          submitLabel={saving ? 'SAVING…' : 'UPDATE ENTRY'}
          disabled={saving}
        />
      </section>
    </main>
  );
}
