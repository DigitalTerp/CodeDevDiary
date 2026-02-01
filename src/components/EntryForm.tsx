'use client';

import Editor from '@monaco-editor/react';
import styles from './EntryForm.module.scss';

type EntryFormProps = {
  date: string;
  title: string;
  tech: string; 
  notes: string;
  code: string;

  onDateChange: (v: string) => void;
  onTitleChange: (v: string) => void;
  onTechChange: (v: string) => void;
  onNotesChange: (v: string) => void;
  onCodeChange: (v: string) => void;

  onSubmit: (e: React.FormEvent) => void;
  submitLabel: string;
  disabled?: boolean;

  onCancel?: () => void;
  error?: string | null;
};

export default function EntryForm({
  date,
  title,
  tech,
  notes,
  code,
  onDateChange,
  onTitleChange,
  onTechChange,
  onNotesChange,
  onCodeChange,
  onSubmit,
  submitLabel,
  disabled,
  onCancel,
  error,
}: EntryFormProps) {
  return (
    <form onSubmit={onSubmit} className={styles.form}>
      <div className={styles.row}>
        <label className={styles.label}>
          Date
          <input
            className={styles.input}
            type="date"
            value={date}
            onChange={(e) => onDateChange(e.target.value)}
            required
          />
        </label>

        <label className={styles.label}>
          Title
          <input
            className={styles.input}
            placeholder="What did you build/learn?"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            required
          />
        </label>
      </div>

      <label className={styles.label}>
        Tech (comma separated)
        <input
          className={styles.input}
          placeholder="TypeScript, Next.js, Firebase, CSS..."
          value={tech}
          onChange={(e) => onTechChange(e.target.value)}
        />
      </label>

      <label className={styles.label}>
        Notes
        <textarea
          className={styles.textarea}
          placeholder="What happened? what worked? what broke? what did you learn?"
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
        />
      </label>

      <div className={styles.editorWrap}>
        <div className={styles.editorHeader}>
          <span className={styles.editorTitle}>Code / Syntax</span>
          <span className={styles.editorHint}>Monaco (TypeScript)</span>
        </div>

        <div className={styles.editorFrame}>
          <Editor
            height="320px"
            defaultLanguage="typescript"
            theme="vs-dark"
            value={code}
            onChange={(v) => onCodeChange(v || '')}
            options={{
              minimap: { enabled: false },
              fontSize: 13,
              tabSize: 2,
              wordWrap: 'on',
              scrollBeyondLastLine: false,
              automaticLayout: true,
            }}
          />
        </div>
      </div>

      {error ? <p className={styles.error}>{error}</p> : null}

      <div className={styles.actions}>
        {onCancel ? (
          <button
            type="button"
            className={styles.ghostBtn}
            onClick={onCancel}
            disabled={disabled}
          >
            Cancel
          </button>
        ) : null}

        <button className={styles.primaryBtn} disabled={disabled}>
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
