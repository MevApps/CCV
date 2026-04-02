'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import styles from './Composer.module.css';

interface ComposerProps {
  placeholder?: string;
  onSubmit: (message: string) => void;
  disabled?: boolean;
  variant?: 'home' | 'mission';
}

export function Composer({
  placeholder = 'What should your team build?',
  onSubmit,
  disabled = false,
  variant = 'home',
}: ComposerProps) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = 'auto';
    const maxHeight = 8 * 24; // 8 rows * ~24px line height
    textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`;
  }, []);

  useEffect(() => {
    adjustHeight();
  }, [value, adjustHeight]);

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSubmit(trimmed);
    setValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className={`${styles.composer} ${styles[variant]}`}>
      <div className={styles.inputWrapper}>
        <textarea
          ref={textareaRef}
          className={styles.textarea}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
        />
        <div className={styles.toolbar}>
          <div className={styles.toolbarLeft}>
            <button className={styles.toolBtn} aria-label="Attach file" type="button">+</button>
          </div>
          <div className={styles.toolbarRight}>
            {value.trim() && (
              <button
                className={styles.sendBtn}
                onClick={handleSubmit}
                disabled={disabled}
                aria-label="Send message"
                type="button"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 13V3l10 5-10 5z" fill="currentColor" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
