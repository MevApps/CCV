'use client';
import styles from './ActionChips.module.css';

interface ActionChip { label: string; onClick: () => void; }
interface ActionChipsProps { chips: ActionChip[]; }

export function ActionChips({ chips }: ActionChipsProps) {
  return (
    <div className={styles.container}>
      {chips.map((chip) => (
        <button key={chip.label} className={styles.chip} onClick={chip.onClick}>{chip.label}</button>
      ))}
    </div>
  );
}
