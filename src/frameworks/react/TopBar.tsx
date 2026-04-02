'use client';

import { useState } from 'react';
import styles from './TopBar.module.css';

interface TopBarProps {
  breadcrumb: string;
  onSearch: (query: string) => void;
  onCreateMission: () => void;
}

export function TopBar({ breadcrumb, onSearch, onCreateMission }: TopBarProps) {
  const [searchValue, setSearchValue] = useState('');

  return (
    <header className={styles.topBar}>
      <div className={styles.breadcrumb}>
        <span>CCV</span>
        <span>/</span>
        <span className={styles.breadcrumbCurrent}>{breadcrumb}</span>
      </div>

      <div className={styles.searchContainer}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Search missions..."
          value={searchValue}
          onChange={(e) => {
            setSearchValue(e.target.value);
            onSearch(e.target.value);
          }}
        />
      </div>

      <div className={styles.actions}>
        <button className={styles.createButton} onClick={onCreateMission}>
          + New Mission
        </button>
      </div>
    </header>
  );
}
