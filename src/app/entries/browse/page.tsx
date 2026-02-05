'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { getEntries, DevDiaryEntry } from '@/lib/entries';
import { logOut } from '@/lib/auth';
import AppNavbar from '@/components/AppNavbar/AppNavbar';
import AppDrawer from '@/components/AppDrawer/AppDrawer';
import styles from './BrowseEntriesPage.module.scss';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 18) return 'Good Afternoon';
  return 'Good Evening';
}

function parseEntryDate(dateStr: string) {
  const d = new Date(dateStr.includes('T') ? dateStr : `${dateStr}T00:00:00`);
  return isNaN(d.getTime()) ? null : d;
}

function startOfToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function isWithinLastNDays(d: Date, n: number) {
  const today = startOfToday();
  const cutoff = new Date(today);
  cutoff.setDate(today.getDate() - (n - 1));
  return d >= cutoff && d <= new Date(today.getTime() + 24 * 60 * 60 * 1000);
}

function escapeRegExp(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function highlight(text: string, query: string) {
  const q = query.trim();
  if (!q) return text;

  const tokens = q
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length >= 2);

  if (tokens.length === 0) return text;

  const pattern = new RegExp(`(${tokens.map(escapeRegExp).join('|')})`, 'ig');
  const parts = text.split(pattern);

  return parts.map((part, idx) => {
    if (pattern.test(part)) {
      pattern.lastIndex = 0;
      return (
        <mark key={idx} className={styles.hl}>
          {part}
        </mark>
      );
    }
    return <span key={idx}>{part}</span>;
  });
}

function clampText(s: string, max = 160) {
  const t = (s ?? '').trim();
  if (!t) return '—';
  return t.length > max ? `${t.slice(0, max)}…` : t;
}

export default function BrowseEntriesPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const [entries, setEntries] = useState<DevDiaryEntry[]>([]);
  const [entriesLoading, setEntriesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [activeId, setActiveId] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);

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
      .then((data) => {
        setEntries(data);
        setActiveId(data[0]?.id ?? null);
      })
      .catch((err: any) => setError(err?.message ?? 'Failed to load entries.'))
      .finally(() => setEntriesLoading(false));
  }, [user]);

  const filteredEntries = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return entries;

    return entries.filter((e) => {
      const title = (e.title ?? '').toLowerCase();
      const notes = (e.notes ?? '').toLowerCase();
      const code = ((e as any).code ?? '').toLowerCase();
      const problem = (((e as any).problem ?? '') as string).toLowerCase();
      return title.includes(q) || notes.includes(q) || code.includes(q) || problem.includes(q);
    });
  }, [entries, search]);

  const grouped = useMemo(() => {
    const today = startOfToday();

    const buckets: Record<'today' | 'week' | 'older', DevDiaryEntry[]> = {
      today: [],
      week: [],
      older: [],
    };

    for (const entry of filteredEntries) {
      const d = parseEntryDate(entry.date);
      if (!d) {
        buckets.older.push(entry);
        continue;
      }

      if (isSameDay(d, today)) buckets.today.push(entry);
      else if (isWithinLastNDays(d, 7)) buckets.week.push(entry);
      else buckets.older.push(entry);
    }

    return buckets;
  }, [filteredEntries]);

  useEffect(() => {
    if (filteredEntries.length === 0) {
      setActiveId(null);
      return;
    }
    if (!activeId || !filteredEntries.some((e) => e.id === activeId)) {
      setActiveId(filteredEntries[0].id ?? null);
    }
  }, [filteredEntries, activeId]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      const isTypingInField = tag === 'input' || tag === 'textarea' || (target as any)?.isContentEditable;

      if (e.key === '/' && !isTypingInField) {
        e.preventDefault();
        searchRef.current?.focus();
        return;
      }

      if (e.key === 'Escape') {
        if (document.activeElement === searchRef.current) {
          if (search) setSearch('');
          else searchRef.current?.blur();
        }
        return;
      }

      if (isTypingInField) return;
      if (filteredEntries.length === 0) return;

      const idx = activeId ? filteredEntries.findIndex((x) => x.id === activeId) : 0;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const next = Math.min(filteredEntries.length - 1, Math.max(0, idx) + 1);
        setActiveId(filteredEntries[next].id ?? null);
        return;
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        const prev = Math.max(0, Math.max(0, idx) - 1);
        setActiveId(filteredEntries[prev].id ?? null);
        return;
      }

      if (e.key === 'Enter' && activeId) {
        e.preventDefault();
        router.push(`/entries/${activeId}`);
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [filteredEntries, activeId, router, search]);

  if (loading || entriesLoading) return <p className={styles.loading}>Loading entries…</p>;
  if (!user) return null;

  const greeting = getGreeting();

  function Card({ entry }: { entry: DevDiaryEntry }) {
    const selected = entry.id === activeId;
    const tech = Array.isArray(entry.tech) ? entry.tech : [];
    const codePreview = clampText((entry as any).code ?? '', 220);

    return (
      <article
        className={selected ? styles.cardActive : styles.card}
        onMouseEnter={() => setActiveId(entry.id ?? null)}
      >
        <div className={styles.metaRow}>
          <span className={styles.dateTime}>{entry.date}</span>
        </div>

        <h2 className={styles.title}>{highlight(entry.title ?? '', search)}</h2>

        {tech.length > 0 && (
          <div className={styles.chips}>
            {tech.slice(0, 6).map((t) => (
              <span key={t} className={styles.chip}>
                {t}
              </span>
            ))}
          </div>
        )}

        <div className={styles.syntaxBlock}>
          <div className={styles.syntaxLabel}>Syntax</div>
          <pre className={styles.syntax}>
            <code>{codePreview}</code>
          </pre>
        </div>

        <div className={styles.actions}>
          <button className={styles.viewBtn} onClick={() => router.push(`/entries/${entry.id}`)} type="button">
            🔍 View
          </button>
          <button className={styles.editBtn} onClick={() => router.push(`/entries/${entry.id}/edit`)} type="button">
            ✏️ Edit
          </button>
        </div>
      </article>
    );
  }

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

      <header className={styles.header}>
        <div>
          <h1 className={styles.pageTitle}>Browse Entries</h1>
          <p className={styles.pageSubTitle}>
            Tip: press <span className={styles.kbd}>/</span> to search,{' '}
            <span className={styles.kbd}>↑</span>/<span className={styles.kbd}>↓</span> to move,{' '}
            <span className={styles.kbd}>Enter</span> to view.
          </p>
        </div>

        <input
          ref={searchRef}
          className={styles.search}
          placeholder="Search title, notes, syntax…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </header>

      {error && <p className={styles.error}>{error}</p>}

      {filteredEntries.length === 0 ? (
        <p className={styles.empty}>No matching entries.</p>
      ) : (
        <section className={styles.list}>
          {grouped.today.length > 0 && (
            <>
              <h3 className={styles.groupTitle}>Today</h3>
              <div className={styles.group}>{grouped.today.map((e) => <Card key={e.id} entry={e} />)}</div>
            </>
          )}

          {grouped.week.length > 0 && (
            <>
              <h3 className={styles.groupTitle}>Last 7 Days</h3>
              <div className={styles.group}>{grouped.week.map((e) => <Card key={e.id} entry={e} />)}</div>
            </>
          )}

          {grouped.older.length > 0 && (
            <>
              <h3 className={styles.groupTitle}>Older</h3>
              <div className={styles.group}>{grouped.older.map((e) => <Card key={e.id} entry={e} />)}</div>
            </>
          )}
        </section>
      )}
    </main>
  );
}
