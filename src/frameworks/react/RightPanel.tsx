'use client';
import { useAppStore } from './store';
import { CodeTab } from './CodeTab';
import { StagesTab } from './StagesTab';
import { MetricsTab } from './MetricsTab';
import { TeamTab } from './TeamTab';
import styles from './RightPanel.module.css';

const TABS = [
  { id: 'code' as const, label: 'Code' },
  { id: 'stages' as const, label: 'Stages' },
  { id: 'metrics' as const, label: 'Metrics' },
  { id: 'team' as const, label: 'Team' },
];

export function RightPanel() {
  const activeTab = useAppStore((s) => s.ui.rightPanelTab);
  const setTab = useAppStore((s) => s.setRightPanelTab);
  const setOpen = useAppStore((s) => s.setRightPanelOpen);
  const mission = useAppStore((s) => s.activeMission);

  return (
    <aside className={styles.panel} role="complementary">
      <div className={styles.header}>
        <div className={styles.tabs}>
          {TABS.map((tab) => (
            <button key={tab.id} className={`${styles.tab} ${activeTab === tab.id ? styles.activeTab : ''}`} onClick={() => setTab(tab.id)}>
              {tab.label}
            </button>
          ))}
        </div>
        <button className={styles.closeBtn} onClick={() => setOpen(false)} aria-label="Close panel">{'\u2715'}</button>
      </div>
      <div className={styles.content}>
        {activeTab === 'code' && <CodeTab />}
        {activeTab === 'stages' && <StagesTab mission={mission} />}
        {activeTab === 'metrics' && <MetricsTab mission={mission} />}
        {activeTab === 'team' && <TeamTab mission={mission} />}
      </div>
    </aside>
  );
}
