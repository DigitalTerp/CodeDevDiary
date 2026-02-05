'use client';

import Editor from '@monaco-editor/react';
import styles from './EntryForm.module.scss';

type EntryFormProps = {
  date: string;            
  title: string;
  problem: string;         
  tech: string;          
  notes: string;
  code: string;

  onDateChange: (v: string) => void;
  onTitleChange: (v: string) => void;
  onProblemChange: (v: string) => void; 
  onTechChange: (v: string) => void;
  onNotesChange: (v: string) => void;
  onCodeChange: (v: string) => void;

  onSubmit: (e: React.FormEvent) => void;
  submitLabel: string;
  disabled?: boolean;
};

export default function EntryForm({
  date,
  title,
  problem,
  tech,
  notes,
  code,
  onDateChange,
  onTitleChange,
  onProblemChange,
  onTechChange,
  onNotesChange,
  onCodeChange,
  onSubmit,
  submitLabel,
  disabled,
}: EntryFormProps) {
  return (
    <form onSubmit={onSubmit} className={styles.form}>
      <div className={styles.grid}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="entry-date">
            Date & Time
          </label>
          <input
            id="entry-date"
            type="datetime-local"
            className={styles.input}
            value={date}
            onChange={(e) => onDateChange(e.target.value)}
            required
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="entry-title">
            Title
          </label>
          <input
            id="entry-title"
            className={styles.input}
            placeholder="Short title for this entry…"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            required
          />
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="entry-problem">
          Problem / What you were working on
        </label>
        <textarea
          id="entry-problem"
          className={styles.textarea}
          placeholder="Describe the problem, bug, feature, or goal…"
          value={problem}
          onChange={(e) => onProblemChange(e.target.value)}
          rows={4}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="entry-tech">
          Tech Used
        </label>
        <input
          id="entry-tech"
          className={styles.input}
          placeholder="TypeScript, Next.js, Firebase, SCSS (comma separated)…"
          value={tech}
          onChange={(e) => onTechChange(e.target.value)}
        />
        <p className={styles.help}>
          Tip: Separate tech with commas (Ex: <span>TypeScript, SCSS, Firebase</span>)
        </p>
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="entry-notes">
          Notes
        </label>
        <textarea
          id="entry-notes"
          className={styles.textarea}
          placeholder="What did you learn? What was tricky? What would you do differently?"
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          rows={6}
        />
      </div>

      <div className={styles.field}>
        <div className={styles.labelRow}>
          <label className={styles.label}>Syntax / Code</label>
          <span className={styles.miniHint}>Paste code snippets here</span>
        </div>

        <div className={styles.editorWrap}>
          <Editor
            height="320px"
            defaultLanguage="typescript"
            theme="vs-dark"
            value={code}
            onChange={(v) => onCodeChange(v || '')}
            options={{
              minimap: { enabled: false },
              fontSize: 13,
              scrollBeyondLastLine: false,
              wordWrap: 'on',
            }}
          />
        </div>
      </div>

      <div className={styles.actions}>
        <button className={styles.primaryBtn} disabled={disabled} type="submit">
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
