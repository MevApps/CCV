'use client';
import styles from './ErrorRecoveryCard.module.css';

interface ErrorRecoveryCardProps {
  errorTitle: string;
  codeSnippet: string;
  fileLocation: string;
  onRetry: () => void;
  onSkip: () => void;
  onFullTrace: () => void;
}

export function ErrorRecoveryCard({ errorTitle, codeSnippet, fileLocation, onRetry, onSkip, onFullTrace }: ErrorRecoveryCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.icon}>{'\u26A0'}</span>
        <span className={styles.title}>{errorTitle}</span>
      </div>
      <div className={styles.location}>{fileLocation}</div>
      <pre className={styles.snippet}><code>{codeSnippet}</code></pre>
      <div className={styles.actions}>
        <button className={styles.retryBtn} onClick={onRetry}>Retry with fix</button>
        <button className={styles.secondaryBtn} onClick={onSkip}>Skip task</button>
        <button className={styles.secondaryBtn} onClick={onFullTrace}>Full trace</button>
      </div>
    </div>
  );
}
