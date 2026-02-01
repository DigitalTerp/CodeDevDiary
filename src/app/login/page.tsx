'use client';

import { useState } from 'react';
import { signIn, signUp } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import styles from './LoginPage.module.scss';

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isSignUp) {
        await signUp(email, password);
      } else {
        await signIn(email, password);
      }

      router.push('/entries');
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <div className={styles.titleWrap}>
          <h1 className={styles.title}>Code Dev Diary</h1>
          <span className={styles.cursor}>▮</span>
        </div>

        <p className={styles.subtitle}>
          {isSignUp ? 'Create your developer log' : 'Access your Developer Log'}
        </p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            className={styles.input}
            type="email"
            placeholder="Email"
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            className={styles.input}
            type="password"
            placeholder="Password"
            value={password}
            required
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && <p className={styles.error}>{error}</p>}

          <button className={styles.primaryBtn} type="submit" disabled={loading}>
            {loading
              ? 'Please wait…'
              : isSignUp
              ? 'Create Account'
              : 'Login'}
          </button>

          <button
            type="button"
            className={styles.toggleBtn}
            onClick={() => setIsSignUp(!isSignUp)}
          >
            {isSignUp
              ? 'Already have an account? Login'
              : 'Need an account? Sign up'}
          </button>
        </form>
      </div>
    </main>
  );
}
