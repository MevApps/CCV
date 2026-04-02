'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import type { Mission } from '@/domain';
import { ActiveMissionView } from '@/frameworks/react/ActiveMissionView';

export default function MissionPage() {
  const params = useParams();
  const id = params.id as string;
  const [mission, setMission] = useState<Mission | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/missions/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Mission not found');
        return res.json();
      })
      .then((data) => {
        data.createdAt = new Date(data.createdAt);
        data.updatedAt = new Date(data.updatedAt);
        if (data.completedAt) data.completedAt = new Date(data.completedAt);
        setMission(data);
      })
      .catch((err) => setError(err.message));
  }, [id]);

  if (error) {
    return (
      <div style={{ padding: 'var(--ccv-space-8)', textAlign: 'center', color: 'var(--ccv-text-tertiary)' }}>
        {error}
      </div>
    );
  }

  if (!mission) {
    return (
      <div style={{ padding: 'var(--ccv-space-8)', textAlign: 'center', color: 'var(--ccv-text-tertiary)' }}>
        Loading...
      </div>
    );
  }

  return <ActiveMissionView mission={mission} />;
}
