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

export default function EditEntryPage() {
  const router = useRouter();
  const params = useParams();
  const { user, loading } = useAuth();

  const id = useMemo(() => toStringParam((params as any)?.id), [params]);

  const [date, setDate] = useState('');
  const [title, setTitle] = useState('');
  const [tech, setTech] = useState('');
  const [notes, setNotes] = useState('');
  const [code, setCode] = useState('');

  const [saving, setSaving] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace('/login');
  }, [loading, user, router]);

  useEffect(() => {
    if (loading) return;
    if (!user) return;

    if (!id) {
      setError('Missing entry id in route.');
      return;
    }

    const uid = user.uid;
    setError(null);
    setFetching(true);

    getEntry(uid, id)
      .then((entry) => {
        if (!entry) {
          setError('Entry not found.');
          return;
        }

        const techValue =
          Array.isArray((entry as any).tech)
            ? (entry as any).tech.join(', ')
            : typeof (entry as any).tech === 'string'
            ? (entry as any).tech
            : '';

        setDate((entry as any).date ?? '');
        setTitle((entry as any).title ?? '');
        setTech(techValue);
        setNotes((entry as any).notes ?? '');
        setCode((entry as any).code ?? '');
      })
      .catch((err: any) => {
        setError(err?.message ?? 'Failed to load entry.');
      })
      .finally(() => setFetching(false));
  }, [loading, user, id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !id) return;

    setError(null);
    setSaving(true);

    try {
      const uid = user.uid;

      await updateEntry(uid, id, {
        date,
        title,
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
        <button className={styles.backBtn} onClick={() => router.back()} type="button">
          ← Back
        </button>

        <h1 className={styles.title}>Edit Entry</h1>

        <button
          className={styles.viewBtn}
          onClick={() => id && router.push(`/entries/${id}`)}
          type="button"
        >
          View
        </button>
      </header>

      {error && <p className={styles.error}>{error}</p>}

      <EntryForm
        key={id ?? 'edit'}
        date={date}
        title={title}
        tech={tech}
        notes={notes}
        code={code}
        onDateChange={setDate}
        onTitleChange={setTitle}
        onTechChange={setTech}
        onNotesChange={setNotes}
        onCodeChange={setCode}
        onSubmit={handleSubmit}
        submitLabel={saving ? 'Saving…' : 'Update Entry'}
        disabled={saving}
        error={error}
        onCancel={() => id && router.push(`/entries/${id}`)}
      />
    </main>
  );
}
