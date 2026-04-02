'use client';
import type { StageName } from '@/domain';
import styles from './StageBanner.module.css';

const STAGE_NAMES: Record<StageName, string> = {
  analysis: 'Analysis', design: 'Design', implementation: 'Implementation',
  review: 'Review', complete: 'Complete',
};

interface StageBannerProps { fromStage: StageName; toStage: StageName; duration: string; }

export function StageBanner({ fromStage, toStage, duration }: StageBannerProps) {
  return (
    <div className={styles.banner}>
      <span className={styles.stageFrom}>{STAGE_NAMES[fromStage]}</span>
      <span className={styles.arrow}>{'\u2192'}</span>
      <span className={styles.stageTo}>{STAGE_NAMES[toStage]}</span>
      <span className={styles.duration}>{duration}</span>
    </div>
  );
}

interface CompletionPipelineProps {
  stages: Array<{ name: StageName; status: 'completed' | 'skipped' }>;
  totalDuration: string;
}

export function CompletionPipeline({ stages, totalDuration }: CompletionPipelineProps) {
  return (
    <div className={styles.pipeline}>
      {stages.map((stage, i) => (
        <span key={stage.name}>
          <span className={stage.status === 'completed' ? styles.stageCompleted : styles.stageSkipped}>
            {STAGE_NAMES[stage.name]}
          </span>
          {i < stages.length - 1 && <span className={styles.arrow}>{'\u2192'}</span>}
        </span>
      ))}
      <span className={styles.duration}>{totalDuration}</span>
    </div>
  );
}
