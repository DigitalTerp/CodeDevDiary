'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { createEntry } from '@/lib/entries';
import EntryForm from '@/components/EntryForm';
import styles from './NewEntryPage.module.scss';

function nowForDateTimeLocal() {
  return new Date().toISOString().slice(0, 16);
}

export default function NewEntryPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const [date, setDate] = useState('');
  const [title, setTitle] = useState('');
  const [problem, setProblem] = useState('');
  const [tech, setTech] = useState('');
  const [notes, setNotes] = useState('');
  const [code, setCode] = useState('');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setDate((prev) => prev || nowForDateTimeLocal());
  }, []);

  if (loading) return <p className={styles.loading}>Loading…</p>;
  if (!user) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    setError(null);
    setSaving(true);

    try {
      await createEntry(user.uid, {
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

      router.push('/entries');
    } catch (err: any) {
      setError(err?.message ?? 'Failed to save entry.');
    } finally {
      setSaving(false);
    }
  }

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
              NEW ENTRY <span className={styles.cursor}>▮</span>
            </h1>
            <p className={styles.subtitle}>Log a new coding problem</p>
          </div>

          <div className={styles.headerRight} />
        </div>
      </header>

      <section className={styles.content}>
        {error && <p className={styles.error}>{error}</p>}

        <EntryForm
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
          submitLabel={saving ? 'SAVING…' : 'SAVE ENTRY'}
          disabled={saving}
        />
      </section>
    </main>
  );
}
