'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAppStore } from './store';
import styles from './Sidebar.module.css';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  currentRoute: string;
  onNavigate: (route: string) => void;
}

export function Sidebar({ collapsed, onToggleCollapse, currentRoute, onNavigate }: SidebarProps) {
  const missions = useAppStore((s) => s.missions);
  const searchQuery = useAppStore((s) => s.ui.searchQuery);
  const setSearchQuery = useAppStore((s) => s.setSearchQuery);

  const [localSearch, setLocalSearch] = useState(searchQuery);
  const searchRef = useRef<HTMLInputElement>(null);

  // Sync local search to store with debounce
  useEffect(() => {
    const timer = setTimeout(() => setSearchQuery(localSearch), 150);
    return () => clearTimeout(timer);
  }, [localSearch, setSearchQuery]);

  // Cmd+K shortcut focuses search
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      searchRef.current?.focus();
    }
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const filtered = localSearch.trim()
    ? missions.filter((m) =>
        m.title.toLowerCase().includes(localSearch.toLowerCase()),
      )
    : missions;

  const running = filtered.filter((m) => m.status === 'active' || m.status === 'paused');
  const today = filtered.filter((m) => m.status === 'completed' || m.status === 'failed' || m.status === 'cancelled');

  return (
    <aside role="navigation" className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.logoIcon}>C</div>
        <span className={styles.logoText}>CCV</span>
        <button
          className={styles.collapseBtn}
          onClick={onToggleCollapse}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            {collapsed
              ? <path d="M5 2L10 7L5 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              : <path d="M9 2L4 7L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            }
          </svg>
        </button>
      </div>

      {/* Search */}
      <div className={styles.searchWrapper}>
        <svg className={styles.searchIcon} width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.25" />
          <path d="M10 10L12.5 12.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
        </svg>
        <input
          ref={searchRef}
          className={styles.searchInput}
          type="text"
          placeholder="Search missions…"
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          aria-label="Search missions"
        />
        <kbd className={styles.searchKbd}>⌘K</kbd>
      </div>

      {/* New Mission button */}
      <div className={styles.newMissionWrapper}>
        <button
          className={styles.newMissionBtn}
          onClick={() => onNavigate('/')}
          aria-label="Create new mission"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M7 2V12M2 7H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <span className={styles.newMissionLabel}>New Mission</span>
        </button>
      </div>

      {/* Mission list */}
      <div role="listbox" className={styles.missionList}>
        {running.length > 0 && (
          <section className={styles.group}>
            <h2 className={styles.groupLabel}>Running</h2>
            {running.map((m) => (
              <button
                key={m.id}
                className={`${styles.missionItem} ${currentRoute === `/missions/${m.id}` ? styles.missionItemActive : ''}`}
                onClick={() => onNavigate(`/missions/${m.id}`)}
              >
                <span className={`${styles.statusDot} ${styles.statusDotRunning}`} aria-label="Running" />
                <span className={styles.missionTitle}>{m.title}</span>
                {m.status === 'paused' && (
                  <span className={styles.missionBadge}>paused</span>
                )}
              </button>
            ))}
          </section>
        )}

        {today.length > 0 && (
          <section className={styles.group}>
            <h2 className={styles.groupLabel}>Today</h2>
            {today.map((m) => (
              <button
                key={m.id}
                className={`${styles.missionItem} ${currentRoute === `/missions/${m.id}` ? styles.missionItemActive : ''}`}
                onClick={() => onNavigate(`/missions/${m.id}`)}
              >
                <span className={`${styles.statusDot} ${styles.statusDotDone}`} aria-label="Completed" />
                <span className={styles.missionTitle}>{m.title}</span>
                <span className={styles.missionDuration}>{m.duration}</span>
              </button>
            ))}
          </section>
        )}

        {filtered.length === 0 && (
          <p className={styles.emptyState}>
            {localSearch.trim() ? 'No matches' : 'No missions yet'}
          </p>
        )}
      </div>

      {/* User footer */}
      <div className={styles.footer}>
        <div className={styles.footerAvatar}>U</div>
        <div className={styles.footerInfo}>
          <div className={styles.footerName}>User</div>
          <div className={styles.footerTokens}>
            {missions.reduce((acc, m) => acc + m.tokenCount, 0).toLocaleString()} tokens
          </div>
        </div>
      </div>
    </aside>
  );
}
