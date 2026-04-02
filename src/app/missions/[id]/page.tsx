'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import type { Mission } from '@/domain';
import { useAppStore } from '@/frameworks/react/store';
import { useWebSocket } from '@/frameworks/react/useWebSocket';
import { toStageViewModels } from '@/adapters/presenters/mission-presenter';
import { MissionDetailView } from '@/frameworks/react/MissionDetailView';

export default function MissionPage() {
  const params = useParams<{ id: string }>();
  const [mission, setMission] = useState<Mission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const terminalLines = useAppStore((s) =>
    s.realtime.streamingLines.get(params.id) ?? [],
  );
  const { subscribe, unsubscribe } = useWebSocket();

  useEffect(() => {
    fetch(`/api/missions/${params.id}`)
      .then(async (res) => {
        if (!res.ok) throw new Error('Mission not found');
        const data = await res.json();
        // Rehydrate dates
        data.createdAt = new Date(data.createdAt);
        data.updatedAt = new Date(data.updatedAt);
        if (data.completedAt) data.completedAt = new Date(data.completedAt);
        setMission(data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));

    subscribe(params.id);
    return () => unsubscribe(params.id);
  }, [params.id, subscribe, unsubscribe]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem', color: 'var(--ccv-text-tertiary)', fontFamily: 'var(--ccv-font-mono)' }}>
        Loading mission...
      </div>
    );
  }

  if (error || !mission) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4rem', gap: '1rem' }}>
        <div style={{ fontSize: 'var(--ccv-text-lg)', color: 'var(--ccv-text-primary)' }}>
          Mission not found
        </div>
        <div style={{ fontSize: 'var(--ccv-text-sm)', color: 'var(--ccv-text-tertiary)' }}>
          {error ?? `No mission with ID "${params.id}"`}
        </div>
      </div>
    );
  }

  const stages = toStageViewModels(mission.stages);
  const isStreaming = mission.status === 'active';

  return (
    <MissionDetailView
      mission={mission}
      stages={stages}
      terminalLines={terminalLines}
      isStreaming={isStreaming}
    />
  );
}
