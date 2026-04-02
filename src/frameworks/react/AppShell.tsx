'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAppStore } from './store';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import styles from './AppShell.module.css';

const BREADCRUMB_MAP: Record<string, string> = {
  '/': 'Dashboard',
  '/missions/create': 'New Mission',
};

function breadcrumbFor(pathname: string): string {
  if (BREADCRUMB_MAP[pathname]) return BREADCRUMB_MAP[pathname];
  if (pathname.startsWith('/missions/')) return 'Mission Detail';
  return 'Dashboard';
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const missions = useAppStore((s) => s.missions);
  const setSearchQuery = useAppStore((s) => s.setSearchQuery);

  const activeMissions = missions.filter((m) => m.status === 'active');
  const breadcrumb = breadcrumbFor(pathname);

  const handleNavigate = (route: string) => {
    router.push(route);
  };

  return (
    <div className={styles.shell}>
      <Sidebar
        activeMissions={activeMissions}
        currentRoute={pathname}
        onNavigate={handleNavigate}
      />
      <div className={styles.mainArea}>
        <TopBar
          breadcrumb={breadcrumb}
          onSearch={setSearchQuery}
          onCreateMission={() => router.push('/missions/create')}
        />
        <main className={styles.content}>
          {children}
        </main>
      </div>
    </div>
  );
}
