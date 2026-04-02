'use client';

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

  const isMissionRoute = pathname.startsWith('/missions/') && pathname !== '/missions/create';

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
