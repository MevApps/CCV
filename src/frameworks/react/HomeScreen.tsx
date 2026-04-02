'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { MissionType } from '@/domain';
import { Composer } from './Composer';
import { MissionTypePills } from './MissionTypePills';
import styles from './HomeScreen.module.css';

export function HomeScreen() {
  const router = useRouter();
  const [selectedModel] = useState('Claude Sonnet 4.6');

  const handleSubmit = async (message: string) => {
    try {
      const res = await fetch('/api/missions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: message.slice(0, 80),
          description: message,
          type: 'task' as MissionType,
        }),
      });
      if (res.ok) {
        const mission = await res.json();
        router.push(`/missions/${mission.id}`);
      }
    } catch (err) {
      console.error('Failed to create mission:', err);
    }
  };

  const handlePillSelect = (prompt: string, type: MissionType) => {
    handleSubmit(prompt);
  };

  return (
    <div className={styles.home}>
      <div className={styles.content}>
        <h1 className={styles.greeting}>What should your team build?</h1>
        <Composer placeholder="Describe your mission..." onSubmit={handleSubmit} variant="home" />
        <div className={styles.modelPicker}>
          <button className={styles.modelBtn}>{selectedModel} {'\u25BE'}</button>
        </div>
        <div className={styles.pillsWrapper}>
          <MissionTypePills onSelect={handlePillSelect} />
        </div>
        <p className={styles.disclaimer}>
          CCV orchestrates AI agents to complete software missions. Costs apply per token usage.
        </p>
      </div>
    </div>
  );
}
