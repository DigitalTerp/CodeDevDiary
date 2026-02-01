'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { getEntries, DevDiaryEntry } from '@/lib/entries';

export default function EntriesPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const [entries, setEntries] = useState<DevDiaryEntry[]>([]);
  const [entriesLoading, setEntriesLoading] = useState(true);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;

    const uid = user.uid;
    setEntriesLoading(true);

    getEntries(uid)
      .then(setEntries)
      .finally(() => setEntriesLoading(false));
  }, [user]);

  if (loading || entriesLoading) {
    return <p style={{ padding: '2rem' }}>Loading entries…</p>;
  }

  if (!user) {
    return null;
  }

  return (
    <main style={{ padding: '2rem' }}>
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
        }}
      >
        <h1>Dev Diary</h1>

        <button onClick={() => router.push('/entries/new')}>
          + New Entry
        </button>
      </header>

      {entries.length === 0 ? (
        <p>No entries yet.</p>
      ) : (
        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '1rem',
          }}
        >
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="card"
              style={{ cursor: 'pointer' }}
              onClick={() => router.push(`/entries/${entry.id}`)}
            >
              <strong>{entry.title}</strong>
              <p>{entry.date}</p>

              <div
                style={{
                  display: 'flex',
                  gap: '0.5rem',
                  flexWrap: 'wrap',
                }}
              >
                {entry.tech.map((t) => (
                  <span
                    key={t}
                    style={{
                      fontSize: 12,
                      background: '#eee',
                      padding: '2px 6px',
                      borderRadius: 4,
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>

              <p style={{ marginTop: '0.5rem', fontSize: 14 }}>
                {entry.notes.slice(0, 80)}…
              </p>
            </div>
          ))}
        </section>
      )}
    </main>
  );
}
