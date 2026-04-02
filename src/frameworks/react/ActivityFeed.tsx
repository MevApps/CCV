'use client';
import { useEffect, useRef } from 'react';
import styles from './ActivityFeed.module.css';

interface ActivityFeedProps {
  children: React.ReactNode;
  isStreaming?: boolean;
}

export function ActivityFeed({ children, isStreaming = false }: ActivityFeedProps) {
  const feedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isStreaming && feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [children, isStreaming]);

  return (
    <div ref={feedRef} className={styles.feed} role="log" aria-live="polite">
      <div className={styles.feedContent}>
        {children}
      </div>
    </div>
  );
}
