'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAppStore } from './store';
import { Sidebar } from './Sidebar';
import { RightPanel } from './RightPanel';
import styles from './AppShell.module.css';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const sidebarCollapsed = useAppStore((s) => s.ui.sidebarCollapsed);
  const rightPanelOpen = useAppStore((s) => s.ui.rightPanelOpen);
  const setSidebarCollapsed = useAppStore((s) => s.setSidebarCollapsed);

  const isMissionRoute = pathname.startsWith('/missions/');

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Cmd+Shift+O: New mission (navigate home)
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'O') {
        e.preventDefault();
        router.push('/');
      }
      // Cmd+Shift+S: Toggle sidebar
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'S') {
        e.preventDefault();
        setSidebarCollapsed(!sidebarCollapsed);
      }
      // / to focus composer (when not already in an input)
      if (e.key === '/' && !(e.target instanceof HTMLTextAreaElement) && !(e.target instanceof HTMLInputElement)) {
        e.preventDefault();
        const composer = document.querySelector('textarea');
        composer?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [router, setSidebarCollapsed, sidebarCollapsed]);

  return (
    <div className={styles.shell}>
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        currentRoute={pathname}
        onNavigate={(route) => router.push(route)}
      />

      <main className={styles.mainArea}>
        {children}
      </main>

      {isMissionRoute && rightPanelOpen && <RightPanel />}
    </div>
  );
}
