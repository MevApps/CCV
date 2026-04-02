'use client';
import styles from './CodeTab.module.css';
export function CodeTab() {
  return (
    <div className={styles.empty}>
      <div className={styles.emptyIcon}>{'\u2B1A'}</div>
      <p className={styles.emptyText}>Click an artifact card in the feed to view its code here.</p>
    </div>
  );
}
