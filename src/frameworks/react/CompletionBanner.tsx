'use client';
import styles from './CompletionBanner.module.css';

interface CompletionBannerProps {
  tasksCompleted: number;
  totalTasks: number;
  totalDuration: string;
  totalTokens: string;
  estimatedCost: string;
  filesChanged: number;
  onViewRetro: () => void;
  onNewMission: () => void;
  onViewFiles: () => void;
}

export function CompletionBanner({
  tasksCompleted, totalTasks, totalDuration, totalTokens, estimatedCost, filesChanged,
  onViewRetro, onNewMission, onViewFiles,
}: CompletionBannerProps) {
  return (
    <div className={styles.banner}>
      <div className={styles.checkmark}>{'\u2714'}</div>
      <h2 className={styles.heading}>Mission Completed Successfully</h2>
      <p className={styles.summary}>{tasksCompleted}/{totalTasks} tasks completed in {totalDuration}</p>
      <div className={styles.stats}>
        <div className={styles.stat}><span className={styles.statValue}>{tasksCompleted}</span><span className={styles.statLabel}>Tasks</span></div>
        <div className={styles.stat}><span className={styles.statValue}>{totalTokens}</span><span className={styles.statLabel}>Tokens</span></div>
        <div className={styles.stat}><span className={styles.statValue}>{estimatedCost}</span><span className={styles.statLabel}>Cost</span></div>
        <div className={styles.stat}><span className={styles.statValue}>{filesChanged}</span><span className={styles.statLabel}>Files</span></div>
      </div>
      <div className={styles.actions}>
        <button className={styles.retroBtn} onClick={onViewRetro}>View Retrospective</button>
        <button className={styles.newBtn} onClick={onNewMission}>New Mission</button>
        <button className={styles.filesBtn} onClick={onViewFiles}>View all files</button>
      </div>
    </div>
  );
}
