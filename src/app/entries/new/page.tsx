'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { createEntry } from '@/lib/entries';
import EntryForm from '@/components/EntryForm';
import styles from './NewEntryPage.module.scss';

export default function NewEntryPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const [date, setDate] = useState('');
  const [title, setTitle] = useState('');
  const [tech, setTech] = useState('');
  const [notes, setNotes] = useState('');
  const [code, setCode] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (loading) return <p className={styles.loading}>Loading…</p>;
  if (!user) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    setError(null);
    setSaving(true);

    try {
      const uid = user.uid;

      await createEntry(uid, {
        date,
        title,
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
        <button className={styles.backBtn} onClick={() => router.back()}>
          ← Back
        </button>
        <h1 className={styles.title}>New Dev Diary Entry</h1>
      </header>

      {error && <p className={styles.error}>{error}</p>}

      <EntryForm
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
        submitLabel={saving ? 'Saving…' : 'Save Entry'}
        disabled={saving}
      />
    </main>
  );
}
