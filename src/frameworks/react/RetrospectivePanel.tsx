'use client';

import { useState } from 'react';
import type { Retrospective } from '@/use-cases/generate-retrospective';
import styles from './RetrospectivePanel.module.css';

interface RetrospectivePanelProps {
  missionId: string;
  missionCompleted: boolean;
  retrospective: Retrospective | null;
  onGenerate: (missionId: string) => void;
}

export function RetrospectivePanel({
  missionId,
  missionCompleted,
  retrospective,
  onGenerate,
}: RetrospectivePanelProps) {
  const [generating, setGenerating] = useState(false);

  if (!missionCompleted && !retrospective) return null;

  const handleGenerate = () => {
    setGenerating(true);
    onGenerate(missionId);
  };

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <span className={styles.learnerDot} />
        <span className={styles.headerTitle}>Learner Retrospective</span>
      </div>

      <div className={styles.panelBody}>
        {!retrospective && !generating && (
          <button className={styles.generateButton} onClick={handleGenerate}>
            Generate Retrospective
          </button>
        )}

        {generating && !retrospective && (
          <div className={styles.generating}>
            <span className={styles.spinner}>{'\u25E0'}</span>
            Analyzing mission...
          </div>
        )}

        {retrospective && (
          <>
            <p className={styles.summary}>{retrospective.summary}</p>

            {retrospective.wentWell.length > 0 && (
              <div className={styles.section}>
                <div className={styles.sectionTitle}>Went Well</div>
                <ul className={styles.list}>
                  {retrospective.wentWell.map((item, i) => (
                    <li key={i} className={styles.listItem}>
                      <span className={`${styles.listBullet} ${styles.bulletGreen}`}>{'\u2713'}</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {retrospective.toImprove.length > 0 && (
              <div className={styles.section}>
                <div className={styles.sectionTitle}>To Improve</div>
                <ul className={styles.list}>
                  {retrospective.toImprove.map((item, i) => (
                    <li key={i} className={styles.listItem}>
                      <span className={`${styles.listBullet} ${styles.bulletAmber}`}>{'\u25B2'}</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {retrospective.suggestions.length > 0 && (
              <div className={styles.section}>
                <div className={styles.sectionTitle}>Suggestions</div>
                <ul className={styles.list}>
                  {retrospective.suggestions.map((item, i) => (
                    <li key={i} className={styles.listItem}>
                      <span className={`${styles.listBullet} ${styles.bulletBlue}`}>{'\u2192'}</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {retrospective.patterns.length > 0 && (
              <div className={styles.section}>
                <div className={styles.sectionTitle}>Patterns</div>
                <ul className={styles.list}>
                  {retrospective.patterns.map((item, i) => (
                    <li key={i} className={styles.listItem}>
                      <span className={`${styles.listBullet} ${styles.bulletBlue}`}>{'\u25C6'}</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
