'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import type { TerminalLine } from '@/adapters/presenters/view-models';
import type { TeamMemberRole } from '@/domain';
import styles from './TerminalPanel.module.css';

const TEAM_COLORS: Record<TeamMemberRole | 'system', string> = {
  architect: 'var(--ccv-team-architect)',
  developer: 'var(--ccv-team-developer)',
  qa:        'var(--ccv-team-qa)',
  reviewer:  'var(--ccv-team-reviewer)',
  product:   'var(--ccv-team-product)',
  learner:   'var(--ccv-team-learner)',
  system:    'var(--ccv-text-tertiary)',
};

interface TerminalOutputProps {
  lines: TerminalLine[];
  isStreaming: boolean;
  onCopy: (text: string) => void;
}

function formatTimestamp(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function getLineClassName(type: TerminalLine['type']): string {
  switch (type) {
    case 'stderr': return styles.lineStderr;
    case 'info': return styles.lineInfo;
    case 'stage-transition': return styles.lineTransition;
    default: return '';
  }
}

export function TerminalPanel({ lines, isStreaming, onCopy }: TerminalOutputProps) {
  const outputRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  // Auto-scroll to bottom when new lines arrive
  useEffect(() => {
    if (autoScroll && outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [lines.length, autoScroll]);

  // Detect manual scroll to disable auto-scroll
  const handleScroll = useCallback(() => {
    if (!outputRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = outputRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 40;
    setAutoScroll(isAtBottom);
  }, []);

  const handleCopyAll = () => {
    const text = lines.map((l) => l.content).join('\n');
    onCopy(text);
  };

  return (
    <div className={styles.terminal}>
      <div className={styles.terminalHeader}>
        <div className={styles.terminalTitle}>
          {isStreaming && <span className={styles.streamingDot} />}
          Terminal Output
        </div>
        <div className={styles.terminalActions}>
          {!autoScroll && (
            <button
              className={styles.terminalAction}
              onClick={() => {
                setAutoScroll(true);
                if (outputRef.current) {
                  outputRef.current.scrollTop = outputRef.current.scrollHeight;
                }
              }}
            >
              Scroll to bottom
            </button>
          )}
          <button className={styles.terminalAction} onClick={handleCopyAll}>
            Copy
          </button>
        </div>
      </div>

      <div
        ref={outputRef}
        className={styles.terminalOutput}
        onScroll={handleScroll}
      >
        {lines.length === 0 ? (
          <div className={styles.emptyTerminal}>
            Waiting for output...
          </div>
        ) : (
          lines.map((line) => (
            <div key={line.id} className={styles.terminalLine}>
              <span className={styles.lineTimestamp}>
                {formatTimestamp(line.timestamp)}
              </span>
              <span
                className={styles.lineSource}
                style={{ color: TEAM_COLORS[line.source] }}
              >
                {line.source}
              </span>
              <span className={`${styles.lineContent} ${getLineClassName(line.type)}`}>
                {line.content}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
