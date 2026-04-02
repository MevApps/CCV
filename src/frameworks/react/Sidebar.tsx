'use client';

import { useState } from 'react';
import { AccountPopup } from './AccountPopup';
import styles from './Sidebar.module.css';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  currentRoute: string;
  onNavigate: (route: string) => void;
}

const NAV_ITEMS = [
  { route: '/', label: 'Home', icon: '\u2302' },
  { route: '/missions/active', label: 'Active Missions', icon: '\u25B6' },
  { route: '/missions/history', label: 'History', icon: '\u25F7' },
] as const;

export function Sidebar({ collapsed, onToggleCollapse, currentRoute, onNavigate }: SidebarProps) {
  const [accountOpen, setAccountOpen] = useState(false);

  return (
    <>
      <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>C</div>
          <span className={styles.logoText}>CCV</span>
        </div>

        <nav className={styles.nav}>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.route}
              className={`${styles.navLink} ${currentRoute === item.route ? styles.active : ''}`}
              onClick={() => onNavigate(item.route)}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              <span className={styles.navLabel}>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className={styles.bottomSection}>
          <button
            className={styles.accountTrigger}
            onClick={() => setAccountOpen(true)}
          >
            <div className={styles.accountAvatar}>U</div>
            <div className={styles.accountInfo}>
              <div className={styles.accountName}>Settings</div>
              <div className={styles.accountPlan}>Configure CCV</div>
            </div>
          </button>
          <button
            className={styles.collapseToggle}
            onClick={onToggleCollapse}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? '\u2192' : '\u2190'}
          </button>
        </div>
      </aside>

      <AccountPopup isOpen={accountOpen} onClose={() => setAccountOpen(false)} />
    </>
  );
}
