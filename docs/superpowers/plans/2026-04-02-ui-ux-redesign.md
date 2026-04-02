# CCV UI/UX Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restructure CCV from a dashboard/kanban paradigm to a claude.ai-inspired layout: sidebar mission list + activity feed + context panel, with three app states (home, active, completed).

**Architecture:** Replace the current TopBar+Sidebar+content layout with a three-column layout (252px sidebar, flex main, 360px right panel). Replace kanban/table views with a chat-style activity feed. Replace the create-mission wizard with a centered composer on the home screen. Add light mode support via CSS custom properties. Existing clean architecture (domain, use-cases, adapters, frameworks) stays intact — changes are confined to the frameworks/react layer, presenters, and globals.css.

**Tech Stack:** Next.js 16 (App Router), React 19, Zustand 5, CSS Modules, CSS Custom Properties (theming), Inter + JetBrains Mono fonts.

**Spec:** `docs/superpowers/specs/2026-04-02-ui-ux-redesign-design.md`

---

## File Structure

### New Files

| Path | Responsibility |
|------|----------------|
| `src/frameworks/react/ThemeProvider.tsx` | Dark/light theme toggle, applies `data-theme` attribute |
| `src/frameworks/react/ThemeProvider.module.css` | Theme provider styles |
| `src/frameworks/react/Composer.tsx` | Claude.ai-style auto-growing textarea + toolbar |
| `src/frameworks/react/Composer.module.css` | Composer styles |
| `src/frameworks/react/MissionTypePills.tsx` | Horizontal pill row for mission types with sub-suggestions |
| `src/frameworks/react/MissionTypePills.module.css` | Pill styles |
| `src/frameworks/react/HomeScreen.tsx` | State 1: greeting + composer + pills + disclaimer |
| `src/frameworks/react/HomeScreen.module.css` | Home screen styles |
| `src/frameworks/react/ActivityFeed.tsx` | Scrollable feed container for messages/banners |
| `src/frameworks/react/ActivityFeed.module.css` | Feed styles |
| `src/frameworks/react/FeedMessage.tsx` | Agent + user message bubbles |
| `src/frameworks/react/FeedMessage.module.css` | Message bubble styles |
| `src/frameworks/react/StageBanner.tsx` | Stage transition banners |
| `src/frameworks/react/StageBanner.module.css` | Banner styles |
| `src/frameworks/react/ErrorRecoveryCard.tsx` | Actionable error cards |
| `src/frameworks/react/ErrorRecoveryCard.module.css` | Error card styles |
| `src/frameworks/react/ActionChips.tsx` | Contextual action chips above composer |
| `src/frameworks/react/ActionChips.module.css` | Chip styles |
| `src/frameworks/react/RightPanel.tsx` | Closable right panel with tabs |
| `src/frameworks/react/RightPanel.module.css` | Right panel styles |
| `src/frameworks/react/CodeTab.tsx` | Syntax-highlighted file viewer tab |
| `src/frameworks/react/CodeTab.module.css` | Code tab styles |
| `src/frameworks/react/StagesTab.tsx` | Vertical stage list tab |
| `src/frameworks/react/StagesTab.module.css` | Stages tab styles |
| `src/frameworks/react/MetricsTab.tsx` | Metrics cards tab |
| `src/frameworks/react/MetricsTab.module.css` | Metrics tab styles |
| `src/frameworks/react/TeamTab.tsx` | Agent roster + retrospective tab |
| `src/frameworks/react/TeamTab.module.css` | Team tab styles |
| `src/frameworks/react/CompletionBanner.tsx` | Mission completed card |
| `src/frameworks/react/CompletionBanner.module.css` | Completion banner styles |
| `src/frameworks/react/MissionTopbar.tsx` | Active mission topbar (type badge, title, controls) |
| `src/frameworks/react/MissionTopbar.module.css` | Mission topbar styles |
| `src/frameworks/react/ActiveMissionView.tsx` | State 2+3: topbar + feed + composer + right panel |
| `src/frameworks/react/ActiveMissionView.module.css` | Active mission layout styles |
| `src/adapters/presenters/feed-view-models.ts` | View model types for feed messages, stage banners, etc. |

### Modified Files

| Path | Changes |
|------|---------|
| `src/app/globals.css` | Complete rewrite: new color tokens (dark + light), typography (Inter), spacing, radii, transitions, shadows, elevation |
| `src/app/layout.tsx` | Switch fonts from Geist to Inter, wrap with ThemeProvider |
| `src/frameworks/react/store.ts` | Add: theme, rightPanelOpen, rightPanelTab, feedMessages, selectedFileId; rename missionDetailView |
| `src/frameworks/react/AppShell.tsx` | Rewrite: three-column layout (sidebar + main + right panel) |
| `src/frameworks/react/AppShell.module.css` | Rewrite: three-column flex layout with responsive breakpoints |
| `src/frameworks/react/Sidebar.tsx` | Rewrite: search, new mission button, temporal mission groups, user footer |
| `src/frameworks/react/Sidebar.module.css` | Rewrite: 252px width, collapsible, new item styles |
| `src/frameworks/react/Providers.tsx` | Wrap children with ThemeProvider |
| `src/app/page.tsx` | Switch from DashboardView to HomeScreen or ActiveMissionView based on store state |
| `src/app/missions/[id]/page.tsx` | Switch to ActiveMissionView |
| `src/adapters/presenters/view-models.ts` | Add FeedMessageViewModel, export new interfaces |
| `src/adapters/presenters/mission-presenter.ts` | Add toFeedMessages(), toSidebarMissionItem() formatters |

### Removed Files (after migration)

| Path | Reason |
|------|--------|
| `src/frameworks/react/DashboardView.tsx` | Replaced by HomeScreen |
| `src/frameworks/react/DashboardView.module.css` | Replaced by HomeScreen |
| `src/frameworks/react/TopBar.tsx` | Replaced by MissionTopbar (embedded in ActiveMissionView) |
| `src/frameworks/react/TopBar.module.css` | Replaced |
| `src/frameworks/react/KanbanBoard.tsx` | Replaced by ActivityFeed |
| `src/frameworks/react/KanbanBoard.module.css` | Replaced |
| `src/frameworks/react/TableView.tsx` | Replaced by ActivityFeed |
| `src/frameworks/react/TableView.module.css` | Replaced |
| `src/frameworks/react/MissionDetailView.tsx` | Replaced by ActiveMissionView |
| `src/frameworks/react/MissionDetailView.module.css` | Replaced |
| `src/frameworks/react/MetricsSidebar.tsx` | Replaced by MetricsTab in RightPanel |
| `src/frameworks/react/MetricsSidebar.module.css` | Replaced |
| `src/frameworks/react/CreateMissionView.tsx` | Replaced by Composer on HomeScreen |
| `src/frameworks/react/CreateMissionView.module.css` | Replaced |
| `src/app/missions/create/page.tsx` | Route removed; creation via home screen composer |

---

## Task 1: Design Tokens — Rewrite globals.css

**Files:**
- Modify: `src/app/globals.css` (complete rewrite)

This task replaces the current "terminal-luxe" color system with the spec's warm-tinted neutrals, adds light mode support, and updates all typography, spacing, radius, transition, shadow, and elevation tokens.

- [ ] **Step 1: Rewrite globals.css with dark mode tokens**

Replace the entire `:root` block and add a `[data-theme="light"]` block. Keep the base reset and component patterns sections, but update all token values to match the spec.

```css
/* ============================================================
   Claude Code Visualizer — Design Tokens & Base Styles
   Warm-tinted neutrals with refined blue accent.
   ============================================================ */

:root {
  /* --- Surfaces --- */
  --ccv-bg-base:       #111214;
  --ccv-bg-primary:    #1A1B1E;
  --ccv-bg-secondary:  #222328;
  --ccv-bg-tertiary:   #2A2C32;
  --ccv-bg-elevated:   #32343B;
  --ccv-bg-sunken:     #131417;

  /* --- Text --- */
  --ccv-text-primary:    #EAEDF2;
  --ccv-text-secondary:  #9199A8;
  --ccv-text-tertiary:   #5C6478;
  --ccv-text-disabled:   #3A3E4A;

  /* --- Accent --- */
  --ccv-accent-primary:  #4B8DF8;
  --ccv-accent-hover:    #3A7AE6;
  --ccv-accent-pressed:  #2D6AD4;
  --ccv-accent-subtle:   rgba(75,141,248,0.12);
  --ccv-accent-ghost:    rgba(75,141,248,0.06);

  /* --- Borders --- */
  --ccv-border-default:  #2A2D35;
  --ccv-border-hover:    #363940;
  --ccv-border-focus:    #4B8DF8;

  /* --- Semantic Status --- */
  --ccv-status-active:    #22C55E;
  --ccv-status-complete:  #4B8DF8;
  --ccv-status-blocked:   #EF4444;
  --ccv-status-paused:    #F59E0B;
  --ccv-status-pending:   #6B7280;

  /* --- Team Member Colors --- */
  --ccv-team-architect:   #A78BFA;
  --ccv-team-developer:   #34D399;
  --ccv-team-qa:          #FBBF24;
  --ccv-team-reviewer:    #60A5FA;
  --ccv-team-product:     #F472B6;
  --ccv-team-learner:     #FB923C;

  /* --- Mission Type Colors --- */
  --ccv-type-brainstorm:  #C084FC;
  --ccv-type-spec:        #67E8F9;
  --ccv-type-plan:        #86EFAC;
  --ccv-type-task:        #60A5FA;
  --ccv-type-epic:        #F472B6;
  --ccv-type-review:      #FDE047;
  --ccv-type-bug:         #FCA5A5;
  --ccv-type-profiling:   #FDBA74;

  /* --- Typography --- */
  --ccv-font-sans:   'Inter', var(--font-inter), system-ui, -apple-system, sans-serif;
  --ccv-font-mono:   'JetBrains Mono', var(--font-jetbrains-mono), 'Fira Code', 'SF Mono', monospace;

  --ccv-heading-xl:  1.75rem;   /* 28px */
  --ccv-heading-lg:  1.375rem;  /* 22px */
  --ccv-heading-md:  1.125rem;  /* 18px */
  --ccv-body-lg:     1rem;      /* 16px */
  --ccv-body-md:     0.9375rem; /* 15px */
  --ccv-body-sm:     0.8125rem; /* 13px */
  --ccv-caption:     0.75rem;   /* 12px */
  --ccv-label:       0.6875rem; /* 11px */
  --ccv-code:        0.75rem;   /* 12px */
  --ccv-terminal:    0.6875rem; /* 11px */

  /* --- Spacing (4px base) --- */
  --ccv-space-0:  0;
  --ccv-space-1:  0.25rem;   /* 4px */
  --ccv-space-2:  0.5rem;    /* 8px */
  --ccv-space-3:  0.75rem;   /* 12px */
  --ccv-space-4:  1rem;      /* 16px */
  --ccv-space-5:  1.25rem;   /* 20px */
  --ccv-space-6:  1.5rem;    /* 24px */
  --ccv-space-8:  2rem;      /* 32px */
  --ccv-space-10: 2.5rem;    /* 40px */
  --ccv-space-12: 3rem;      /* 48px */
  --ccv-space-16: 4rem;      /* 64px */
  --ccv-space-20: 5rem;      /* 80px */

  /* --- Border Radii --- */
  --ccv-radius-sm:     4px;
  --ccv-radius-md:     6px;
  --ccv-radius-lg:     8px;
  --ccv-radius-xl:     20px;
  --ccv-radius-pill:   9999px;
  --ccv-radius-circle: 50%;

  /* --- Transitions --- */
  --ccv-transition-fast:    120ms ease;
  --ccv-transition-default: 200ms ease;
  --ccv-transition-slow:    300ms ease-out;
  --ccv-transition-spring:  300ms cubic-bezier(0.34,1.56,0.64,1);

  /* --- Shadows (Dark) --- */
  --ccv-shadow-sm:     0 1px 2px rgba(0,0,0,0.2);
  --ccv-shadow-md:     0 4px 12px rgba(0,0,0,0.25);
  --ccv-shadow-lg:     0 8px 24px rgba(0,0,0,0.3);
  --ccv-focus-ring:    0 0 0 2px rgba(75,141,248,0.2);

  /* --- Overlays --- */
  --ccv-overlay-dim:   rgba(0,0,0,0.5);
  --ccv-overlay-light: rgba(0,0,0,0.3);
}

/* --- Light Mode --- */
[data-theme="light"] {
  --ccv-bg-base:       #F5F6F8;
  --ccv-bg-primary:    #FFFFFF;
  --ccv-bg-secondary:  #F0F1F4;
  --ccv-bg-tertiary:   #E4E6EB;
  --ccv-bg-elevated:   #FFFFFF;
  --ccv-bg-sunken:     #1E1F23;

  --ccv-text-primary:    #1A1D24;
  --ccv-text-secondary:  #5C6478;
  --ccv-text-tertiary:   #8B91A0;
  --ccv-text-disabled:   #B8BCC8;

  --ccv-accent-primary:  #3B7CF5;
  --ccv-accent-hover:    #2D6AE0;
  --ccv-accent-pressed:  #1F5ACB;
  --ccv-accent-subtle:   rgba(59,124,245,0.10);
  --ccv-accent-ghost:    rgba(59,124,245,0.05);

  --ccv-border-default:  #D8DBE2;
  --ccv-border-hover:    #C5C9D2;
  --ccv-border-focus:    #4B8DF8;

  /* Light mode team colors */
  --ccv-team-architect:  #7C3AED;
  --ccv-team-developer:  #059669;
  --ccv-team-qa:         #D97706;
  --ccv-team-reviewer:   #2563EB;
  --ccv-team-product:    #DB2777;
  --ccv-team-learner:    #D97706;

  /* Light mode mission type colors */
  --ccv-type-brainstorm: #7C3AED;
  --ccv-type-spec:       #0891B2;
  --ccv-type-plan:       #16A34A;
  --ccv-type-task:       #2563EB;
  --ccv-type-epic:       #DB2777;
  --ccv-type-review:     #CA8A04;
  --ccv-type-bug:        #DC2626;
  --ccv-type-profiling:  #EA580C;

  /* Light mode shadows */
  --ccv-shadow-sm:     0 1px 2px rgba(0,0,0,0.05);
  --ccv-shadow-md:     0 4px 12px rgba(0,0,0,0.08);
  --ccv-shadow-lg:     0 8px 24px rgba(0,0,0,0.12);
  --ccv-focus-ring:    0 0 0 2px rgba(75,141,248,0.15);

  color-scheme: light;
}
```

- [ ] **Step 2: Update base reset section**

Keep the reset but update `html` to use `--ccv-bg-base` and remove hardcoded `color-scheme: dark`:

```css
* {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}

html {
  height: 100%;
  color-scheme: dark;
}

html, body {
  max-width: 100vw;
  overflow-x: hidden;
}

body {
  min-height: 100%;
  display: flex;
  flex-direction: column;
  color: var(--ccv-text-primary);
  background: var(--ccv-bg-base);
  font-family: var(--ccv-font-sans);
  font-size: var(--ccv-body-md);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

a {
  color: inherit;
  text-decoration: none;
}
```

- [ ] **Step 3: Update component patterns to use new tokens**

```css
.ccv-card {
  background: var(--ccv-bg-secondary);
  border: 1px solid var(--ccv-border-default);
  border-radius: var(--ccv-radius-lg);
  padding: var(--ccv-space-4);
  transition: border-color var(--ccv-transition-fast), box-shadow var(--ccv-transition-fast);
}

.ccv-card:hover {
  border-color: var(--ccv-border-hover);
}

.ccv-input {
  background: var(--ccv-bg-tertiary);
  border: 1px solid var(--ccv-border-default);
  border-radius: var(--ccv-radius-md);
  color: var(--ccv-text-primary);
  font-family: var(--ccv-font-sans);
  padding: var(--ccv-space-3) var(--ccv-space-4);
  font-size: var(--ccv-body-md);
  width: 100%;
  transition: border-color var(--ccv-transition-fast), box-shadow var(--ccv-transition-fast);
}

.ccv-input:focus {
  border-color: var(--ccv-accent-primary);
  outline: none;
  box-shadow: var(--ccv-focus-ring);
}

.ccv-input::placeholder {
  color: var(--ccv-text-tertiary);
}

.ccv-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--ccv-space-1);
  padding: 2px var(--ccv-space-2);
  border-radius: var(--ccv-radius-sm);
  font-size: var(--ccv-label);
  font-family: var(--ccv-font-mono);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: color-mix(in srgb, var(--badge-color) 15%, transparent);
  color: var(--badge-color);
}

.ccv-button-primary {
  background: var(--ccv-accent-primary);
  color: white;
  font-family: var(--ccv-font-sans);
  font-weight: 600;
  padding: var(--ccv-space-3) var(--ccv-space-6);
  border-radius: var(--ccv-radius-md);
  border: none;
  cursor: pointer;
  font-size: var(--ccv-body-sm);
  transition: background var(--ccv-transition-fast), transform 100ms ease;
}

.ccv-button-primary:hover {
  background: var(--ccv-accent-hover);
}

.ccv-button-primary:active {
  background: var(--ccv-accent-pressed);
  transform: scale(0.98);
}

.ccv-button-secondary {
  background: transparent;
  color: var(--ccv-text-secondary);
  font-family: var(--ccv-font-sans);
  font-weight: 500;
  padding: var(--ccv-space-3) var(--ccv-space-6);
  border-radius: var(--ccv-radius-md);
  border: 1px solid var(--ccv-border-default);
  cursor: pointer;
  font-size: var(--ccv-body-sm);
  transition: border-color var(--ccv-transition-fast), color var(--ccv-transition-fast);
}

.ccv-button-secondary:hover {
  border-color: var(--ccv-border-hover);
  color: var(--ccv-text-primary);
}

/* --- Reduced Motion --- */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

- [ ] **Step 4: Verify the app builds with new tokens**

Run: `cd /Users/mevapps/StudioProjects/CCV && npx next build 2>&1 | tail -20`
Expected: Build succeeds (CSS compilation passes)

- [ ] **Step 5: Commit**

```bash
git add src/app/globals.css
git commit -m "feat: rewrite design tokens with warm neutrals + light mode support"
```

---

## Task 2: Fonts and ThemeProvider

**Files:**
- Modify: `src/app/layout.tsx`
- Create: `src/frameworks/react/ThemeProvider.tsx`
- Create: `src/frameworks/react/ThemeProvider.module.css`
- Modify: `src/frameworks/react/Providers.tsx`
- Modify: `src/frameworks/react/store.ts`

- [ ] **Step 1: Add theme state to the Zustand store**

Add a `theme` field and `setTheme` action to `UiState` in `src/frameworks/react/store.ts`:

```typescript
interface UiState {
  sidebarCollapsed: boolean;
  missionDetailView: 'kanban' | 'table';
  searchQuery: string;
  theme: 'dark' | 'light' | 'system';
  rightPanelOpen: boolean;
  rightPanelTab: 'code' | 'stages' | 'metrics' | 'team';
}
```

Update the initial state:

```typescript
ui: {
  sidebarCollapsed: false,
  missionDetailView: 'kanban',
  searchQuery: '',
  theme: 'dark',
  rightPanelOpen: true,
  rightPanelTab: 'stages',
},
```

Add actions:

```typescript
setTheme: (theme) =>
  set((state) => ({ ui: { ...state.ui, theme } })),
setRightPanelOpen: (open) =>
  set((state) => ({ ui: { ...state.ui, rightPanelOpen: open } })),
setRightPanelTab: (tab) =>
  set((state) => ({ ui: { ...state.ui, rightPanelTab: tab } })),
```

Add their types to the AppState interface:

```typescript
setTheme: (theme: 'dark' | 'light' | 'system') => void;
setRightPanelOpen: (open: boolean) => void;
setRightPanelTab: (tab: 'code' | 'stages' | 'metrics' | 'team') => void;
```

- [ ] **Step 2: Create ThemeProvider component**

Create `src/frameworks/react/ThemeProvider.tsx`:

```tsx
'use client';

import { useEffect } from 'react';
import { useAppStore } from './store';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useAppStore((s) => s.ui.theme);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.setAttribute('data-theme', prefersDark ? 'dark' : 'light');

      const handler = (e: MediaQueryListEvent) => {
        root.setAttribute('data-theme', e.matches ? 'dark' : 'light');
      };
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    }
    root.setAttribute('data-theme', theme);
  }, [theme]);

  return <>{children}</>;
}
```

- [ ] **Step 3: Update layout.tsx to use Inter font**

Modify `src/app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { JetBrains_Mono } from "next/font/google";
import { AppShell } from "@/frameworks/react/AppShell";
import { Providers } from "@/frameworks/react/Providers";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Claude Code Visualizer",
  description: "Visual project management interface for Claude Code CLI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body>
        <Providers>
          <AppShell>
            {children}
          </AppShell>
        </Providers>
      </body>
    </html>
  );
}
```

- [ ] **Step 4: Wrap Providers with ThemeProvider**

Modify `src/frameworks/react/Providers.tsx`:

```tsx
'use client';

import { useWebSocket } from './useWebSocket';
import { ThemeProvider } from './ThemeProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  useWebSocket();
  return <ThemeProvider>{children}</ThemeProvider>;
}
```

- [ ] **Step 5: Verify build**

Run: `cd /Users/mevapps/StudioProjects/CCV && npx next build 2>&1 | tail -20`
Expected: Build succeeds

- [ ] **Step 6: Commit**

```bash
git add src/app/layout.tsx src/frameworks/react/ThemeProvider.tsx src/frameworks/react/Providers.tsx src/frameworks/react/store.ts
git commit -m "feat: add ThemeProvider, Inter font, and theme/panel state to store"
```

---

## Task 3: Three-Column AppShell Layout

**Files:**
- Modify: `src/frameworks/react/AppShell.tsx`
- Modify: `src/frameworks/react/AppShell.module.css`

- [ ] **Step 1: Rewrite AppShell.tsx**

Replace the current AppShell with a three-column layout. The shell no longer renders TopBar — mission topbar is embedded in the main content area by each view.

```tsx
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
```

- [ ] **Step 2: Rewrite AppShell.module.css**

```css
.shell {
  display: flex;
  min-height: 100vh;
  background: var(--ccv-bg-base);
}

.mainArea {
  flex: 1;
  min-width: 400px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Tablet: sidebar overlays */
@media (max-width: 1024px) and (min-width: 641px) {
  .mainArea {
    min-width: 0;
  }
}

/* Mobile: single column */
@media (max-width: 640px) {
  .shell {
    flex-direction: column;
  }

  .mainArea {
    min-width: 0;
    flex: 1;
  }
}
```

- [ ] **Step 3: Verify build**

Run: `cd /Users/mevapps/StudioProjects/CCV && npx next build 2>&1 | tail -20`
Expected: Build may fail due to missing RightPanel import — that's expected at this stage. Create a stub:

Create `src/frameworks/react/RightPanel.tsx` as a placeholder:

```tsx
'use client';

export function RightPanel() {
  return <aside style={{ width: 360, background: 'var(--ccv-bg-secondary)' }} />;
}
```

Re-run build. Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/frameworks/react/AppShell.tsx src/frameworks/react/AppShell.module.css src/frameworks/react/RightPanel.tsx
git commit -m "feat: three-column AppShell layout with sidebar + main + right panel"
```

---

## Task 4: Sidebar Redesign

**Files:**
- Modify: `src/frameworks/react/Sidebar.tsx`
- Modify: `src/frameworks/react/Sidebar.module.css`
- Modify: `src/adapters/presenters/view-models.ts` (add SidebarMissionItem)
- Modify: `src/adapters/presenters/mission-presenter.ts` (add toSidebarMissionItem)

- [ ] **Step 1: Add SidebarMissionItem view model**

Add to `src/adapters/presenters/view-models.ts`:

```typescript
export interface SidebarMissionItem {
  id: string;
  title: string;
  type: MissionType;
  status: MissionStatus;
  progress: number;
  activeAgentCount: number;
  teamColors: string[];
  tokenCount: string;
  duration: string;
  elapsedTime: string;
}
```

- [ ] **Step 2: Add toSidebarMissionItem presenter**

Add to `src/adapters/presenters/mission-presenter.ts`:

```typescript
import type { SidebarMissionItem } from './view-models';

export function toSidebarMissionItem(mission: Mission): SidebarMissionItem {
  const activeMembers = mission.teamMembers.filter((tm) => tm.status === 'working');
  const memberColors = mission.teamMembers.map((tm) => TEAM_COLORS[tm.member.role]);

  return {
    id: mission.id,
    title: mission.title,
    type: mission.type,
    status: mission.status,
    progress: mission.metrics.taskCount > 0
      ? Math.round((mission.metrics.completedTaskCount / mission.metrics.taskCount) * 100)
      : 0,
    activeAgentCount: activeMembers.length,
    teamColors: memberColors,
    tokenCount: formatTokens(mission.metrics.totalTokens),
    duration: formatDuration(mission.metrics.totalDurationMs),
    elapsedTime: formatDuration(Date.now() - mission.createdAt.getTime()),
  };
}
```

- [ ] **Step 3: Rewrite Sidebar.tsx**

```tsx
'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from './store';
import { AccountPopup } from './AccountPopup';
import styles from './Sidebar.module.css';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  currentRoute: string;
  onNavigate: (route: string) => void;
}

function groupMissionsByDate(missions: Array<{ id: string; title: string; status: string; updatedAt: string }>) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86400000);

  const running: typeof missions = [];
  const todayGroup: typeof missions = [];
  const yesterdayGroup: typeof missions = [];
  const olderGroup: typeof missions = [];

  for (const m of missions) {
    if (m.status === 'active') {
      running.push(m);
    } else {
      // updatedAt is a relative string like "2h ago" — for grouping we'd need actual dates
      // For now, put all non-active in "today" — real grouping uses actual timestamps from store
      todayGroup.push(m);
    }
  }

  return { running, today: todayGroup, yesterday: yesterdayGroup, older: olderGroup };
}

export function Sidebar({ collapsed, onToggleCollapse, currentRoute, onNavigate }: SidebarProps) {
  const [accountOpen, setAccountOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const missions = useAppStore((s) => s.missions);
  const setGlobalSearch = useAppStore((s) => s.setSearchQuery);

  const filtered = searchQuery
    ? missions.filter((m) => m.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : missions;

  const groups = groupMissionsByDate(filtered);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setGlobalSearch(value);
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('sidebar-search')?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <>
      <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
        {/* Logo */}
        <div className={styles.header}>
          <div className={styles.logoIcon}>C</div>
          {!collapsed && <span className={styles.logoText}>CCV</span>}
          <button className={styles.collapseBtn} onClick={onToggleCollapse} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
            {collapsed ? '\u2261' : '\u2039'}
          </button>
        </div>

        {!collapsed && (
          <>
            {/* Search */}
            <div className={styles.searchWrapper}>
              <input
                id="sidebar-search"
                className={styles.searchInput}
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
              />
              <span className={styles.searchShortcut}>\u2318K</span>
            </div>

            {/* New Mission */}
            <button
              className={styles.newMissionBtn}
              onClick={() => onNavigate('/')}
            >
              + New Mission
            </button>

            {/* Mission List */}
            <nav className={styles.missionList} role="listbox" aria-label="Missions">
              {groups.running.length > 0 && (
                <div className={styles.group}>
                  <div className={styles.groupLabel}>Running</div>
                  {groups.running.map((m) => (
                    <button
                      key={m.id}
                      role="option"
                      aria-selected={currentRoute === `/missions/${m.id}`}
                      className={`${styles.missionItem} ${currentRoute === `/missions/${m.id}` ? styles.active : ''}`}
                      onClick={() => onNavigate(`/missions/${m.id}`)}
                    >
                      <span className={`${styles.statusDot} ${styles.dotRunning}`} />
                      <span className={styles.missionTitle}>{m.title}</span>
                    </button>
                  ))}
                </div>
              )}

              {groups.today.length > 0 && (
                <div className={styles.group}>
                  <div className={styles.groupLabel}>Today</div>
                  {groups.today.map((m) => (
                    <button
                      key={m.id}
                      role="option"
                      aria-selected={currentRoute === `/missions/${m.id}`}
                      className={`${styles.missionItem} ${currentRoute === `/missions/${m.id}` ? styles.active : ''}`}
                      onClick={() => onNavigate(`/missions/${m.id}`)}
                    >
                      <span className={`${styles.statusDot} ${styles.dotCompleted}`} />
                      <span className={styles.missionTitle}>{m.title}</span>
                      <span className={styles.missionMeta}>{m.duration}</span>
                    </button>
                  ))}
                </div>
              )}
            </nav>
          </>
        )}

        {/* Footer */}
        <div className={styles.footer}>
          <button className={styles.userBtn} onClick={() => setAccountOpen(true)}>
            <div className={styles.userAvatar}>U</div>
            {!collapsed && (
              <div className={styles.userInfo}>
                <div className={styles.userName}>User</div>
                <div className={styles.userTokens}>0 tokens today</div>
              </div>
            )}
          </button>
        </div>
      </aside>

      <AccountPopup isOpen={accountOpen} onClose={() => setAccountOpen(false)} />
    </>
  );
}
```

- [ ] **Step 4: Rewrite Sidebar.module.css**

```css
.sidebar {
  width: 252px;
  background: var(--ccv-bg-secondary);
  border-right: 1px solid var(--ccv-border-default);
  display: flex;
  flex-direction: column;
  transition: width var(--ccv-transition-slow);
  overflow: hidden;
  flex-shrink: 0;
}

.collapsed {
  width: 52px;
}

.header {
  display: flex;
  align-items: center;
  gap: var(--ccv-space-2);
  padding: var(--ccv-space-4);
  min-height: 56px;
}

.logoIcon {
  width: 28px;
  height: 28px;
  background: var(--ccv-accent-primary);
  border-radius: var(--ccv-radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: var(--ccv-body-sm);
  flex-shrink: 0;
}

.logoText {
  font-weight: 700;
  font-size: var(--ccv-body-lg);
  color: var(--ccv-text-primary);
}

.collapseBtn {
  margin-left: auto;
  background: none;
  border: none;
  color: var(--ccv-text-tertiary);
  cursor: pointer;
  font-size: var(--ccv-body-lg);
  padding: var(--ccv-space-1);
  border-radius: var(--ccv-radius-sm);
}

.collapseBtn:hover {
  color: var(--ccv-text-secondary);
  background: var(--ccv-bg-tertiary);
}

.searchWrapper {
  position: relative;
  padding: 0 var(--ccv-space-4);
  margin-bottom: var(--ccv-space-3);
}

.searchInput {
  width: 100%;
  background: var(--ccv-bg-tertiary);
  border: 1px solid var(--ccv-border-default);
  border-radius: var(--ccv-radius-md);
  color: var(--ccv-text-primary);
  font-family: var(--ccv-font-sans);
  font-size: var(--ccv-body-sm);
  padding: var(--ccv-space-2) var(--ccv-space-3);
  padding-right: var(--ccv-space-10);
}

.searchInput:focus {
  outline: none;
  border-color: var(--ccv-accent-primary);
  box-shadow: var(--ccv-focus-ring);
}

.searchInput::placeholder {
  color: var(--ccv-text-tertiary);
}

.searchShortcut {
  position: absolute;
  right: calc(var(--ccv-space-4) + var(--ccv-space-2));
  top: 50%;
  transform: translateY(-50%);
  font-size: var(--ccv-caption);
  color: var(--ccv-text-tertiary);
  background: var(--ccv-bg-secondary);
  padding: 1px var(--ccv-space-1);
  border-radius: var(--ccv-radius-sm);
  border: 1px solid var(--ccv-border-default);
  font-family: var(--ccv-font-sans);
}

.newMissionBtn {
  margin: 0 var(--ccv-space-4) var(--ccv-space-3);
  background: var(--ccv-accent-primary);
  color: white;
  border: none;
  border-radius: var(--ccv-radius-md);
  padding: var(--ccv-space-2) var(--ccv-space-4);
  font-family: var(--ccv-font-sans);
  font-weight: 600;
  font-size: var(--ccv-body-sm);
  cursor: pointer;
  transition: background var(--ccv-transition-fast);
}

.newMissionBtn:hover {
  background: var(--ccv-accent-hover);
}

.missionList {
  flex: 1;
  overflow-y: auto;
  padding: 0 var(--ccv-space-2);
}

.group {
  margin-bottom: var(--ccv-space-3);
}

.groupLabel {
  font-size: var(--ccv-label);
  font-weight: 600;
  color: var(--ccv-text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: var(--ccv-space-2) var(--ccv-space-2);
}

.missionItem {
  display: flex;
  align-items: center;
  gap: var(--ccv-space-2);
  width: 100%;
  padding: var(--ccv-space-2);
  border: none;
  background: none;
  color: var(--ccv-text-primary);
  cursor: pointer;
  border-radius: var(--ccv-radius-md);
  font-family: var(--ccv-font-sans);
  font-size: var(--ccv-body-sm);
  text-align: left;
  transition: background var(--ccv-transition-fast);
}

.missionItem:hover {
  background: var(--ccv-bg-tertiary);
}

.missionItem.active {
  background: var(--ccv-bg-tertiary);
}

.statusDot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.dotRunning {
  background: var(--ccv-status-active);
  animation: pulse 2s ease-in-out infinite;
}

.dotCompleted {
  background: var(--ccv-status-complete);
}

.dotBlocked {
  background: var(--ccv-status-blocked);
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.missionTitle {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.missionMeta {
  font-size: var(--ccv-caption);
  color: var(--ccv-text-tertiary);
  font-family: var(--ccv-font-mono);
  flex-shrink: 0;
}

.footer {
  border-top: 1px solid var(--ccv-border-default);
  padding: var(--ccv-space-3) var(--ccv-space-4);
  margin-top: auto;
}

.userBtn {
  display: flex;
  align-items: center;
  gap: var(--ccv-space-2);
  width: 100%;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--ccv-text-primary);
  padding: var(--ccv-space-2);
  border-radius: var(--ccv-radius-md);
}

.userBtn:hover {
  background: var(--ccv-bg-tertiary);
}

.userAvatar {
  width: 28px;
  height: 28px;
  border-radius: var(--ccv-radius-circle);
  background: var(--ccv-bg-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--ccv-body-sm);
  font-weight: 600;
  color: var(--ccv-text-secondary);
  flex-shrink: 0;
}

.userName {
  font-size: var(--ccv-body-sm);
  font-weight: 500;
}

.userInfo {
  text-align: left;
}

.userTokens {
  font-size: var(--ccv-caption);
  color: var(--ccv-text-tertiary);
}

/* Tablet */
@media (max-width: 1024px) and (min-width: 641px) {
  .sidebar:not(.collapsed) {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    z-index: 50;
    box-shadow: var(--ccv-shadow-lg);
  }
}

/* Mobile */
@media (max-width: 640px) {
  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    z-index: 50;
    box-shadow: var(--ccv-shadow-lg);
    transform: translateX(-100%);
    transition: transform var(--ccv-transition-slow);
  }

  .sidebar:not(.collapsed) {
    transform: translateX(0);
  }
}
```

- [ ] **Step 5: Verify build**

Run: `cd /Users/mevapps/StudioProjects/CCV && npx next build 2>&1 | tail -20`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/frameworks/react/Sidebar.tsx src/frameworks/react/Sidebar.module.css src/adapters/presenters/view-models.ts src/adapters/presenters/mission-presenter.ts
git commit -m "feat: redesign sidebar with search, temporal groups, mission list"
```

---

## Task 5: Composer Component

**Files:**
- Create: `src/frameworks/react/Composer.tsx`
- Create: `src/frameworks/react/Composer.module.css`

- [ ] **Step 1: Create Composer.tsx**

```tsx
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
```

- [ ] **Step 2: Create Composer.module.css**

```css
.composer {
  width: 100%;
  max-width: 660px;
}

.home {
  max-width: 640px;
}

.inputWrapper {
  background: var(--ccv-bg-secondary);
  border: 1px solid var(--ccv-border-default);
  border-radius: var(--ccv-radius-xl);
  overflow: hidden;
  transition: border-color var(--ccv-transition-fast), box-shadow var(--ccv-transition-fast);
}

.inputWrapper:focus-within {
  border-color: var(--ccv-accent-primary);
  box-shadow: 0 0 0 2px rgba(75,141,248,0.15);
}

.textarea {
  width: 100%;
  background: transparent;
  border: none;
  color: var(--ccv-text-primary);
  font-family: var(--ccv-font-sans);
  font-size: var(--ccv-body-lg);
  line-height: 1.6;
  padding: var(--ccv-space-4) var(--ccv-space-5);
  padding-bottom: 0;
  resize: none;
  outline: none;
  min-height: 28px;
  max-height: 192px;
}

.textarea::placeholder {
  color: var(--ccv-text-tertiary);
}

.textarea:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--ccv-space-2) var(--ccv-space-3);
}

.toolbarLeft, .toolbarRight {
  display: flex;
  align-items: center;
  gap: var(--ccv-space-1);
}

.toolBtn {
  width: 32px;
  height: 32px;
  border-radius: var(--ccv-radius-circle);
  border: none;
  background: var(--ccv-bg-tertiary);
  color: var(--ccv-text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--ccv-body-lg);
  transition: background var(--ccv-transition-fast), color var(--ccv-transition-fast);
}

.toolBtn:hover {
  background: var(--ccv-bg-elevated);
  color: var(--ccv-text-primary);
}

.sendBtn {
  width: 32px;
  height: 32px;
  border-radius: var(--ccv-radius-circle);
  border: none;
  background: var(--ccv-accent-primary);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: popIn var(--ccv-transition-spring);
  transition: background var(--ccv-transition-fast);
}

.sendBtn:hover {
  background: var(--ccv-accent-hover);
}

.sendBtn:disabled {
  background: var(--ccv-bg-tertiary);
  color: var(--ccv-text-disabled);
  cursor: not-allowed;
}

@keyframes popIn {
  0% { transform: scale(0.5); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}
```

- [ ] **Step 3: Verify build**

Run: `cd /Users/mevapps/StudioProjects/CCV && npx next build 2>&1 | tail -20`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/frameworks/react/Composer.tsx src/frameworks/react/Composer.module.css
git commit -m "feat: add claude.ai-style Composer component with auto-resize"
```

---

## Task 6: MissionTypePills Component

**Files:**
- Create: `src/frameworks/react/MissionTypePills.tsx`
- Create: `src/frameworks/react/MissionTypePills.module.css`

- [ ] **Step 1: Create MissionTypePills.tsx**

```tsx
'use client';

import { useState } from 'react';
import type { MissionType } from '@/domain';
import styles from './MissionTypePills.module.css';

const TYPE_CONFIG: Array<{
  type: MissionType;
  label: string;
  team: string;
  color: string;
  subSuggestions: string[];
}> = [
  { type: 'brainstorm', label: 'Brainstorm', team: 'Arch \u00B7 Dev', color: 'var(--ccv-type-brainstorm)',
    subSuggestions: ['Explore architecture options', 'Compare frameworks', 'Design data model', 'Evaluate trade-offs'] },
  { type: 'spec', label: 'Spec', team: 'Arch \u00B7 Prod', color: 'var(--ccv-type-spec)',
    subSuggestions: ['Write API spec', 'Define requirements', 'Create user stories', 'Document interfaces'] },
  { type: 'task', label: 'Task', team: 'Dev \u00B7 QA', color: 'var(--ccv-type-task)',
    subSuggestions: ['Implement endpoint', 'Refactor module', 'Add tests', 'Migration'] },
  { type: 'bug', label: 'Bug fix', team: 'Dev \u00B7 QA', color: 'var(--ccv-type-bug)',
    subSuggestions: ['Fix crash', 'Debug performance issue', 'Resolve data inconsistency', 'Fix UI regression'] },
  { type: 'epic', label: 'Epic', team: 'Arch \u00B7 Dev \u00B7 QA', color: 'var(--ccv-type-epic)',
    subSuggestions: ['Build feature end-to-end', 'Migrate system', 'Platform integration', 'New module'] },
  { type: 'review', label: 'Review', team: 'Rev \u00B7 QA', color: 'var(--ccv-type-review)',
    subSuggestions: ['Code review', 'Architecture review', 'Security audit', 'Performance review'] },
  { type: 'plan', label: 'Plan', team: 'Arch \u00B7 Prod', color: 'var(--ccv-type-plan)',
    subSuggestions: ['Sprint planning', 'Roadmap item', 'Technical design', 'Migration plan'] },
  { type: 'profiling', label: 'Profile', team: 'Dev', color: 'var(--ccv-type-profiling)',
    subSuggestions: ['Profile API latency', 'Memory usage analysis', 'Bundle size audit', 'Query optimization'] },
];

interface MissionTypePillsProps {
  onSelect: (prompt: string, type: MissionType) => void;
}

export function MissionTypePills({ onSelect }: MissionTypePillsProps) {
  const [expandedType, setExpandedType] = useState<MissionType | null>(null);

  const expanded = expandedType ? TYPE_CONFIG.find((c) => c.type === expandedType) : null;

  if (expanded) {
    return (
      <div className={styles.container}>
        <button className={styles.backBtn} onClick={() => setExpandedType(null)}>
          \u2190 Back
        </button>
        <div className={styles.subSuggestions}>
          {expanded.subSuggestions.map((suggestion) => (
            <button
              key={suggestion}
              className={styles.subPill}
              style={{ '--pill-color': expanded.color } as React.CSSProperties}
              onClick={() => onSelect(suggestion, expanded.type)}
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.pills}>
        {TYPE_CONFIG.map((config) => (
          <button
            key={config.type}
            className={styles.pill}
            style={{ '--pill-color': config.color } as React.CSSProperties}
            onClick={() => setExpandedType(config.type)}
          >
            <span className={styles.pillDot} />
            <span className={styles.pillLabel}>{config.label}</span>
            <span className={styles.pillTeam}>{config.team}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create MissionTypePills.module.css**

```css
.container {
  display: flex;
  flex-direction: column;
  gap: var(--ccv-space-2);
}

.pills {
  display: flex;
  flex-wrap: wrap;
  gap: var(--ccv-space-2);
}

.pill {
  display: inline-flex;
  align-items: center;
  gap: var(--ccv-space-2);
  padding: var(--ccv-space-2) var(--ccv-space-3);
  border-radius: var(--ccv-radius-pill);
  border: 1px solid var(--ccv-border-default);
  background: transparent;
  color: var(--ccv-text-primary);
  font-family: var(--ccv-font-sans);
  font-size: var(--ccv-body-sm);
  cursor: pointer;
  transition: border-color var(--ccv-transition-fast), transform var(--ccv-transition-fast), box-shadow var(--ccv-transition-fast);
}

.pill:hover {
  border-color: var(--ccv-border-hover);
  transform: translateY(-1px);
  box-shadow: var(--ccv-shadow-sm);
}

.pillDot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--pill-color);
}

.pillLabel {
  font-weight: 500;
}

.pillTeam {
  font-size: var(--ccv-caption);
  color: var(--ccv-text-tertiary);
}

.backBtn {
  align-self: flex-start;
  background: none;
  border: none;
  color: var(--ccv-text-secondary);
  font-family: var(--ccv-font-sans);
  font-size: var(--ccv-body-sm);
  cursor: pointer;
  padding: var(--ccv-space-1) 0;
}

.backBtn:hover {
  color: var(--ccv-text-primary);
}

.subSuggestions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--ccv-space-2);
}

.subPill {
  padding: var(--ccv-space-2) var(--ccv-space-4);
  border-radius: var(--ccv-radius-pill);
  border: 1px solid var(--ccv-border-default);
  background: transparent;
  color: var(--ccv-text-primary);
  font-family: var(--ccv-font-sans);
  font-size: var(--ccv-body-sm);
  cursor: pointer;
  transition: background var(--ccv-transition-fast), border-color var(--ccv-transition-fast);
}

.subPill:hover {
  background: var(--ccv-accent-ghost);
  border-color: var(--pill-color);
}
```

- [ ] **Step 3: Commit**

```bash
git add src/frameworks/react/MissionTypePills.tsx src/frameworks/react/MissionTypePills.module.css
git commit -m "feat: add MissionTypePills with sub-suggestions"
```

---

## Task 7: HomeScreen (State 1)

**Files:**
- Create: `src/frameworks/react/HomeScreen.tsx`
- Create: `src/frameworks/react/HomeScreen.module.css`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Create HomeScreen.tsx**

```tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { MissionType } from '@/domain';
import { Composer } from './Composer';
import { MissionTypePills } from './MissionTypePills';
import styles from './HomeScreen.module.css';

export function HomeScreen() {
  const router = useRouter();
  const [selectedModel] = useState('Claude Sonnet 4.6');

  const handleSubmit = async (message: string) => {
    try {
      const res = await fetch('/api/missions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: message.slice(0, 80),
          description: message,
          type: 'task' as MissionType,
        }),
      });
      if (res.ok) {
        const mission = await res.json();
        router.push(`/missions/${mission.id}`);
      }
    } catch (err) {
      console.error('Failed to create mission:', err);
    }
  };

  const handlePillSelect = (prompt: string, type: MissionType) => {
    handleSubmit(prompt);
  };

  return (
    <div className={styles.home}>
      <div className={styles.content}>
        <h1 className={styles.greeting}>What should your team build?</h1>

        <Composer
          placeholder="Describe your mission..."
          onSubmit={handleSubmit}
          variant="home"
        />

        <div className={styles.modelPicker}>
          <button className={styles.modelBtn}>
            {selectedModel} \u25BE
          </button>
        </div>

        <div className={styles.pillsWrapper}>
          <MissionTypePills onSelect={handlePillSelect} />
        </div>

        <p className={styles.disclaimer}>
          CCV orchestrates AI agents to complete software missions. Costs apply per token usage.
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create HomeScreen.module.css**

```css
.home {
  flex: 1;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 30vh;
  overflow-y: auto;
}

.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 640px;
  width: 100%;
  padding: 0 var(--ccv-space-6);
}

.greeting {
  font-size: var(--ccv-heading-xl);
  font-weight: 700;
  color: var(--ccv-text-primary);
  text-align: center;
  margin-bottom: var(--ccv-space-8);
  line-height: 1.3;
}

.modelPicker {
  width: 100%;
  margin-top: var(--ccv-space-3);
}

.modelBtn {
  background: none;
  border: none;
  color: var(--ccv-text-secondary);
  font-family: var(--ccv-font-sans);
  font-size: var(--ccv-body-sm);
  cursor: pointer;
  padding: var(--ccv-space-1) var(--ccv-space-2);
  border-radius: var(--ccv-radius-md);
}

.modelBtn:hover {
  color: var(--ccv-text-primary);
  background: var(--ccv-bg-tertiary);
}

.pillsWrapper {
  width: 100%;
  margin-top: var(--ccv-space-6);
}

.disclaimer {
  margin-top: var(--ccv-space-8);
  font-size: var(--ccv-caption);
  color: var(--ccv-text-tertiary);
  text-align: center;
}

@media (max-width: 640px) {
  .home {
    padding-top: 15vh;
  }

  .content {
    padding: 0 var(--ccv-space-4);
  }

  .greeting {
    font-size: var(--ccv-heading-lg);
  }
}
```

- [ ] **Step 3: Update page.tsx**

Replace `src/app/page.tsx`:

```tsx
import { HomeScreen } from '@/frameworks/react/HomeScreen';

export default function Home() {
  return <HomeScreen />;
}
```

- [ ] **Step 4: Verify build**

Run: `cd /Users/mevapps/StudioProjects/CCV && npx next build 2>&1 | tail -20`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/frameworks/react/HomeScreen.tsx src/frameworks/react/HomeScreen.module.css src/app/page.tsx
git commit -m "feat: add HomeScreen with composer, pills, and greeting"
```

---

## Task 8: Feed View Models and Presenter

**Files:**
- Create: `src/adapters/presenters/feed-view-models.ts`
- Modify: `src/adapters/presenters/mission-presenter.ts`

- [ ] **Step 1: Create feed-view-models.ts**

```typescript
import type { TeamMemberRole, StageName, MissionType } from '@/domain';

export type FeedItemType =
  | 'user-message'
  | 'agent-message'
  | 'stage-transition'
  | 'error-recovery'
  | 'completion';

export interface FeedItem {
  id: string;
  type: FeedItemType;
  timestamp: Date;
}

export interface UserMessageFeedItem extends FeedItem {
  type: 'user-message';
  content: string;
}

export interface AgentMessageFeedItem extends FeedItem {
  type: 'agent-message';
  role: TeamMemberRole;
  roleColor: string;
  roleInitial: string;
  status: 'working' | 'done' | 'idle';
  content: string;
  artifacts: ArtifactCard[];
  terminalLines: string[];
}

export interface ArtifactCard {
  id: string;
  filename: string;
  filePath: string;
  lineCount: number;
  fileType: string;
}

export interface StageTransitionFeedItem extends FeedItem {
  type: 'stage-transition';
  fromStage: StageName;
  toStage: StageName;
  duration: string;
}

export interface ErrorRecoveryFeedItem extends FeedItem {
  type: 'error-recovery';
  errorTitle: string;
  codeSnippet: string;
  fileLocation: string;
}

export interface CompletionFeedItem extends FeedItem {
  type: 'completion';
  tasksCompleted: number;
  totalTasks: number;
  totalDuration: string;
  totalTokens: string;
  estimatedCost: string;
  filesChanged: number;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/adapters/presenters/feed-view-models.ts
git commit -m "feat: add feed view model types for activity feed"
```

---

## Task 9: MissionTopbar Component

**Files:**
- Create: `src/frameworks/react/MissionTopbar.tsx`
- Create: `src/frameworks/react/MissionTopbar.module.css`

- [ ] **Step 1: Create MissionTopbar.tsx**

```tsx
'use client';

import { useEffect, useState } from 'react';
import type { MissionType, MissionStatus } from '@/domain';
import styles from './MissionTopbar.module.css';

interface MissionTopbarProps {
  type: MissionType;
  title: string;
  status: MissionStatus;
  startTime: number;
  onPause?: () => void;
  onCancel?: () => void;
  onRetry?: () => void;
}

const TYPE_COLORS: Record<MissionType, string> = {
  brainstorm: 'var(--ccv-type-brainstorm)',
  spec: 'var(--ccv-type-spec)',
  plan: 'var(--ccv-type-plan)',
  task: 'var(--ccv-type-task)',
  epic: 'var(--ccv-type-epic)',
  review: 'var(--ccv-type-review)',
  bug: 'var(--ccv-type-bug)',
  profiling: 'var(--ccv-type-profiling)',
};

function formatElapsed(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  if (hours > 0) return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}

export function MissionTopbar({
  type,
  title,
  status,
  startTime,
  onPause,
  onCancel,
  onRetry,
}: MissionTopbarProps) {
  const [elapsed, setElapsed] = useState(Date.now() - startTime);
  const isLive = status === 'active';

  useEffect(() => {
    if (!isLive) return;
    const interval = setInterval(() => setElapsed(Date.now() - startTime), 1000);
    return () => clearInterval(interval);
  }, [isLive, startTime]);

  return (
    <div className={styles.topbar}>
      <div className={styles.left}>
        <span
          className={styles.typeBadge}
          style={{ '--badge-color': TYPE_COLORS[type] } as React.CSSProperties}
        >
          {type}
        </span>
      </div>

      <div className={styles.center}>
        <span className={styles.title}>{title}</span>
        <span className={styles.statusGroup}>
          {isLive && <span className={styles.liveDot} />}
          <span className={styles.statusText}>
            {status === 'completed' ? 'Completed' : status === 'active' ? 'Running' : status}
          </span>
          <span className={styles.elapsed}>{formatElapsed(elapsed)}</span>
        </span>
      </div>

      <div className={styles.right}>
        {isLive && (
          <>
            {onPause && (
              <button className={`${styles.controlBtn} ${styles.pauseBtn}`} onClick={onPause}>
                Pause
              </button>
            )}
            {onCancel && (
              <button className={`${styles.controlBtn} ${styles.cancelBtn}`} onClick={onCancel}>
                Cancel
              </button>
            )}
          </>
        )}
        {(status === 'completed' || status === 'failed') && onRetry && (
          <button className={`${styles.controlBtn} ${styles.retryBtn}`} onClick={onRetry}>
            Retry
          </button>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create MissionTopbar.module.css**

```css
.topbar {
  display: flex;
  align-items: center;
  padding: var(--ccv-space-3) var(--ccv-space-5);
  border-bottom: 1px solid var(--ccv-border-default);
  background: var(--ccv-bg-primary);
  min-height: 48px;
  gap: var(--ccv-space-4);
}

.left {
  flex-shrink: 0;
}

.typeBadge {
  display: inline-flex;
  align-items: center;
  padding: 2px var(--ccv-space-2);
  border-radius: var(--ccv-radius-sm);
  font-size: var(--ccv-label);
  font-family: var(--ccv-font-mono);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: color-mix(in srgb, var(--badge-color) 15%, transparent);
  color: var(--badge-color);
}

.center {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--ccv-space-3);
  min-width: 0;
}

.title {
  font-size: var(--ccv-body-md);
  font-weight: 600;
  color: var(--ccv-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.statusGroup {
  display: flex;
  align-items: center;
  gap: var(--ccv-space-2);
  flex-shrink: 0;
}

.liveDot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--ccv-status-active);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.statusText {
  font-size: var(--ccv-caption);
  color: var(--ccv-text-secondary);
  font-family: var(--ccv-font-mono);
  text-transform: uppercase;
}

.elapsed {
  font-size: var(--ccv-caption);
  color: var(--ccv-text-tertiary);
  font-family: var(--ccv-font-mono);
}

.right {
  display: flex;
  gap: var(--ccv-space-2);
  flex-shrink: 0;
}

.controlBtn {
  font-family: var(--ccv-font-sans);
  font-size: var(--ccv-body-sm);
  font-weight: 500;
  padding: var(--ccv-space-1) var(--ccv-space-3);
  border-radius: var(--ccv-radius-md);
  border: 1px solid;
  cursor: pointer;
  transition: background var(--ccv-transition-fast);
}

.pauseBtn {
  border-color: var(--ccv-status-paused);
  color: var(--ccv-status-paused);
  background: transparent;
}

.pauseBtn:hover {
  background: rgba(245,158,11,0.1);
}

.cancelBtn {
  border-color: var(--ccv-status-blocked);
  color: var(--ccv-status-blocked);
  background: transparent;
}

.cancelBtn:hover {
  background: rgba(239,68,68,0.1);
}

.retryBtn {
  border-color: var(--ccv-accent-primary);
  color: var(--ccv-accent-primary);
  background: transparent;
}

.retryBtn:hover {
  background: var(--ccv-accent-ghost);
}
```

- [ ] **Step 3: Commit**

```bash
git add src/frameworks/react/MissionTopbar.tsx src/frameworks/react/MissionTopbar.module.css
git commit -m "feat: add MissionTopbar with live elapsed timer and controls"
```

---

## Task 10: Activity Feed Components

**Files:**
- Create: `src/frameworks/react/ActivityFeed.tsx`
- Create: `src/frameworks/react/ActivityFeed.module.css`
- Create: `src/frameworks/react/FeedMessage.tsx`
- Create: `src/frameworks/react/FeedMessage.module.css`
- Create: `src/frameworks/react/StageBanner.tsx`
- Create: `src/frameworks/react/StageBanner.module.css`

- [ ] **Step 1: Create ActivityFeed.tsx**

```tsx
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
```

- [ ] **Step 2: Create ActivityFeed.module.css**

```css
.feed {
  flex: 1;
  overflow-y: auto;
  padding: var(--ccv-space-6) var(--ccv-space-4);
  display: flex;
  justify-content: center;
}

.feedContent {
  max-width: 660px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--ccv-space-4);
}
```

- [ ] **Step 3: Create FeedMessage.tsx**

```tsx
'use client';

import type { TeamMemberRole } from '@/domain';
import styles from './FeedMessage.module.css';

const ROLE_COLORS: Record<TeamMemberRole, string> = {
  architect: 'var(--ccv-team-architect)',
  developer: 'var(--ccv-team-developer)',
  qa: 'var(--ccv-team-qa)',
  reviewer: 'var(--ccv-team-reviewer)',
  product: 'var(--ccv-team-product)',
  learner: 'var(--ccv-team-learner)',
};

interface UserMessageProps {
  content: string;
}

export function UserMessage({ content }: UserMessageProps) {
  return (
    <div className={styles.userRow}>
      <div className={styles.userBubble} role="article">
        {content}
      </div>
    </div>
  );
}

interface AgentMessageProps {
  role: TeamMemberRole;
  status: 'working' | 'done' | 'idle';
  content: string;
  timestamp?: string;
  artifacts?: Array<{ id: string; filename: string; lineCount: number; fileType: string }>;
  terminalOutput?: string[];
  onArtifactClick?: (id: string) => void;
}

export function AgentMessage({
  role,
  status,
  content,
  timestamp,
  artifacts = [],
  terminalOutput = [],
  onArtifactClick,
}: AgentMessageProps) {
  const color = ROLE_COLORS[role];
  const initial = role.charAt(0).toUpperCase();

  return (
    <div className={styles.agentRow} role="article">
      <div className={styles.avatar} style={{ background: `linear-gradient(135deg, ${color}, color-mix(in srgb, ${color} 60%, transparent))` }}>
        <span className={styles.avatarLetter}>{initial}</span>
        <span className={`${styles.avatarStatus} ${styles[`status-${status}`]}`} />
      </div>

      <div className={styles.agentBody}>
        <div className={styles.agentHeader}>
          <span className={styles.roleLabel} style={{ color }}>{role.toUpperCase()}</span>
          {timestamp && <span className={styles.timestamp}>{timestamp}</span>}
        </div>

        <div className={styles.agentContent}>{content}</div>

        {artifacts.length > 0 && (
          <div className={styles.artifacts}>
            {artifacts.map((a) => (
              <button
                key={a.id}
                className={styles.artifactCard}
                onClick={() => onArtifactClick?.(a.id)}
              >
                <span className={styles.artifactIcon}>\u2B1A</span>
                <span className={styles.artifactName}>{a.filename}</span>
                <span className={styles.artifactMeta}>{a.lineCount} lines \u00B7 {a.fileType}</span>
                <span className={styles.artifactArrow}>\u2192</span>
              </button>
            ))}
          </div>
        )}

        {terminalOutput.length > 0 && (
          <div className={styles.terminalEmbed}>
            {terminalOutput.map((line, i) => (
              <div key={i} className={styles.terminalLine}>{line}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create FeedMessage.module.css**

```css
/* User message */
.userRow {
  display: flex;
  justify-content: flex-end;
}

.userBubble {
  max-width: 80%;
  background: var(--ccv-bg-tertiary);
  border-radius: var(--ccv-radius-lg) var(--ccv-radius-lg) var(--ccv-radius-sm) var(--ccv-radius-lg);
  padding: var(--ccv-space-3) var(--ccv-space-4);
  font-size: var(--ccv-body-md);
  color: var(--ccv-text-primary);
  line-height: 1.6;
}

/* Agent message */
.agentRow {
  display: flex;
  gap: var(--ccv-space-3);
  align-items: flex-start;
}

.avatar {
  width: 30px;
  height: 30px;
  border-radius: var(--ccv-radius-circle);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
}

.avatarLetter {
  color: white;
  font-weight: 700;
  font-size: var(--ccv-caption);
}

.avatarStatus {
  position: absolute;
  bottom: -1px;
  right: -1px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 2px solid var(--ccv-bg-primary);
}

.status-working {
  background: var(--ccv-status-active);
  animation: pulse 2s ease-in-out infinite;
}

.status-done {
  background: var(--ccv-status-complete);
}

.status-idle {
  background: var(--ccv-status-pending);
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.agentBody {
  flex: 1;
  min-width: 0;
}

.agentHeader {
  display: flex;
  align-items: center;
  gap: var(--ccv-space-2);
  margin-bottom: var(--ccv-space-1);
}

.roleLabel {
  font-size: var(--ccv-label);
  font-weight: 600;
  letter-spacing: 0.05em;
}

.timestamp {
  font-size: var(--ccv-caption);
  color: var(--ccv-text-tertiary);
}

.agentContent {
  font-size: var(--ccv-body-md);
  color: var(--ccv-text-primary);
  line-height: 1.6;
}

/* Artifacts */
.artifacts {
  display: flex;
  flex-direction: column;
  gap: var(--ccv-space-2);
  margin-top: var(--ccv-space-3);
}

.artifactCard {
  display: flex;
  align-items: center;
  gap: var(--ccv-space-2);
  padding: var(--ccv-space-2) var(--ccv-space-3);
  background: var(--ccv-bg-secondary);
  border: 1px solid var(--ccv-border-default);
  border-radius: var(--ccv-radius-md);
  cursor: pointer;
  transition: border-color var(--ccv-transition-fast);
  color: var(--ccv-text-primary);
  font-family: var(--ccv-font-sans);
  font-size: var(--ccv-body-sm);
  text-align: left;
}

.artifactCard:hover {
  border-color: var(--ccv-border-hover);
}

.artifactCard:hover .artifactArrow {
  transform: translateX(2px);
}

.artifactIcon {
  color: var(--ccv-text-tertiary);
}

.artifactName {
  font-family: var(--ccv-font-mono);
  font-size: var(--ccv-code);
  flex: 1;
}

.artifactMeta {
  font-size: var(--ccv-caption);
  color: var(--ccv-text-tertiary);
}

.artifactArrow {
  color: var(--ccv-text-tertiary);
  transition: transform var(--ccv-transition-fast);
}

/* Terminal embed */
.terminalEmbed {
  margin-top: var(--ccv-space-3);
  background: var(--ccv-bg-sunken);
  border-radius: var(--ccv-radius-md);
  padding: var(--ccv-space-3);
  max-height: 200px;
  overflow-y: auto;
}

.terminalLine {
  font-family: var(--ccv-font-mono);
  font-size: var(--ccv-terminal);
  color: var(--ccv-text-secondary);
  line-height: 1.7;
  white-space: pre-wrap;
  word-break: break-all;
}
```

- [ ] **Step 5: Create StageBanner.tsx**

```tsx
'use client';

import type { StageName } from '@/domain';
import styles from './StageBanner.module.css';

const STAGE_NAMES: Record<StageName, string> = {
  analysis: 'Analysis',
  design: 'Design',
  implementation: 'Implementation',
  review: 'Review',
  complete: 'Complete',
};

interface StageBannerProps {
  fromStage: StageName;
  toStage: StageName;
  duration: string;
}

export function StageBanner({ fromStage, toStage, duration }: StageBannerProps) {
  return (
    <div className={styles.banner}>
      <span className={styles.stageFrom}>{STAGE_NAMES[fromStage]}</span>
      <span className={styles.arrow}>\u2192</span>
      <span className={styles.stageTo}>{STAGE_NAMES[toStage]}</span>
      <span className={styles.duration}>{duration}</span>
    </div>
  );
}

interface CompletionPipelineProps {
  stages: Array<{ name: StageName; status: 'completed' | 'skipped' }>;
  totalDuration: string;
}

export function CompletionPipeline({ stages, totalDuration }: CompletionPipelineProps) {
  return (
    <div className={styles.pipeline}>
      {stages.map((stage, i) => (
        <span key={stage.name}>
          <span className={stage.status === 'completed' ? styles.stageCompleted : styles.stageSkipped}>
            {STAGE_NAMES[stage.name]}
          </span>
          {i < stages.length - 1 && <span className={styles.arrow}>\u2192</span>}
        </span>
      ))}
      <span className={styles.duration}>{totalDuration}</span>
    </div>
  );
}
```

- [ ] **Step 6: Create StageBanner.module.css**

```css
.banner {
  display: flex;
  align-items: center;
  gap: var(--ccv-space-3);
  padding: var(--ccv-space-2) var(--ccv-space-4);
  background: rgba(245,158,11,0.06);
  border-radius: var(--ccv-radius-md);
  border: 1px solid rgba(245,158,11,0.15);
}

.pipeline {
  display: flex;
  align-items: center;
  gap: var(--ccv-space-2);
  padding: var(--ccv-space-3) var(--ccv-space-4);
  background: rgba(75,141,248,0.06);
  border-radius: var(--ccv-radius-md);
  border: 1px solid rgba(75,141,248,0.15);
  flex-wrap: wrap;
}

.stageFrom, .stageTo, .stageCompleted {
  font-size: var(--ccv-body-sm);
  font-weight: 500;
  color: var(--ccv-text-primary);
}

.stageSkipped {
  font-size: var(--ccv-body-sm);
  color: var(--ccv-text-tertiary);
  text-decoration: line-through;
}

.arrow {
  color: var(--ccv-text-tertiary);
  font-size: var(--ccv-body-sm);
}

.duration {
  margin-left: auto;
  font-size: var(--ccv-caption);
  color: var(--ccv-text-tertiary);
  font-family: var(--ccv-font-mono);
}
```

- [ ] **Step 7: Commit**

```bash
git add src/frameworks/react/ActivityFeed.tsx src/frameworks/react/ActivityFeed.module.css src/frameworks/react/FeedMessage.tsx src/frameworks/react/FeedMessage.module.css src/frameworks/react/StageBanner.tsx src/frameworks/react/StageBanner.module.css
git commit -m "feat: add ActivityFeed, FeedMessage, and StageBanner components"
```

---

## Task 11: ErrorRecoveryCard and ActionChips

**Files:**
- Create: `src/frameworks/react/ErrorRecoveryCard.tsx`
- Create: `src/frameworks/react/ErrorRecoveryCard.module.css`
- Create: `src/frameworks/react/ActionChips.tsx`
- Create: `src/frameworks/react/ActionChips.module.css`

- [ ] **Step 1: Create ErrorRecoveryCard.tsx**

```tsx
'use client';

import styles from './ErrorRecoveryCard.module.css';

interface ErrorRecoveryCardProps {
  errorTitle: string;
  codeSnippet: string;
  fileLocation: string;
  onRetry: () => void;
  onSkip: () => void;
  onFullTrace: () => void;
}

export function ErrorRecoveryCard({
  errorTitle,
  codeSnippet,
  fileLocation,
  onRetry,
  onSkip,
  onFullTrace,
}: ErrorRecoveryCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.icon}>\u26A0</span>
        <span className={styles.title}>{errorTitle}</span>
      </div>

      <div className={styles.location}>{fileLocation}</div>

      <pre className={styles.snippet}><code>{codeSnippet}</code></pre>

      <div className={styles.actions}>
        <button className={styles.retryBtn} onClick={onRetry}>Retry with fix</button>
        <button className={styles.secondaryBtn} onClick={onSkip}>Skip task</button>
        <button className={styles.secondaryBtn} onClick={onFullTrace}>Full trace</button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create ErrorRecoveryCard.module.css**

```css
.card {
  background: rgba(239,68,68,0.06);
  border: 1px solid rgba(239,68,68,0.15);
  border-radius: var(--ccv-radius-lg);
  padding: var(--ccv-space-4);
}

.header {
  display: flex;
  align-items: center;
  gap: var(--ccv-space-2);
  margin-bottom: var(--ccv-space-2);
}

.icon {
  color: var(--ccv-status-blocked);
  font-size: var(--ccv-body-lg);
}

.title {
  font-size: var(--ccv-body-md);
  font-weight: 600;
  color: var(--ccv-status-blocked);
}

.location {
  font-size: var(--ccv-caption);
  color: var(--ccv-text-tertiary);
  font-family: var(--ccv-font-mono);
  margin-bottom: var(--ccv-space-3);
}

.snippet {
  background: var(--ccv-bg-sunken);
  border-radius: var(--ccv-radius-md);
  padding: var(--ccv-space-3);
  margin-bottom: var(--ccv-space-4);
  overflow-x: auto;
}

.snippet code {
  font-family: var(--ccv-font-mono);
  font-size: var(--ccv-code);
  color: var(--ccv-text-secondary);
  line-height: 1.8;
}

.actions {
  display: flex;
  gap: var(--ccv-space-2);
}

.retryBtn {
  background: var(--ccv-status-blocked);
  color: white;
  border: none;
  border-radius: var(--ccv-radius-md);
  padding: var(--ccv-space-2) var(--ccv-space-4);
  font-family: var(--ccv-font-sans);
  font-size: var(--ccv-body-sm);
  font-weight: 500;
  cursor: pointer;
  transition: opacity var(--ccv-transition-fast);
}

.retryBtn:hover {
  opacity: 0.9;
}

.secondaryBtn {
  background: transparent;
  color: var(--ccv-text-secondary);
  border: 1px solid var(--ccv-border-default);
  border-radius: var(--ccv-radius-md);
  padding: var(--ccv-space-2) var(--ccv-space-4);
  font-family: var(--ccv-font-sans);
  font-size: var(--ccv-body-sm);
  cursor: pointer;
  transition: border-color var(--ccv-transition-fast);
}

.secondaryBtn:hover {
  border-color: var(--ccv-border-hover);
  color: var(--ccv-text-primary);
}
```

- [ ] **Step 3: Create ActionChips.tsx**

```tsx
'use client';

import styles from './ActionChips.module.css';

interface ActionChip {
  label: string;
  onClick: () => void;
}

interface ActionChipsProps {
  chips: ActionChip[];
}

const DEFAULT_MISSION_CHIPS: ActionChip[] = [
  { label: 'Skip stage', onClick: () => {} },
  { label: 'Add constraint', onClick: () => {} },
  { label: 'Change model', onClick: () => {} },
  { label: 'Attach file', onClick: () => {} },
];

export function ActionChips({ chips = DEFAULT_MISSION_CHIPS }: ActionChipsProps) {
  return (
    <div className={styles.container}>
      {chips.map((chip) => (
        <button key={chip.label} className={styles.chip} onClick={chip.onClick}>
          {chip.label}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Create ActionChips.module.css**

```css
.container {
  display: flex;
  flex-wrap: wrap;
  gap: var(--ccv-space-2);
  padding: var(--ccv-space-2) 0;
}

.chip {
  display: inline-flex;
  align-items: center;
  padding: var(--ccv-space-1) var(--ccv-space-3);
  border-radius: var(--ccv-radius-pill);
  border: 1px solid var(--ccv-border-default);
  background: transparent;
  color: var(--ccv-text-secondary);
  font-family: var(--ccv-font-sans);
  font-size: var(--ccv-body-sm);
  cursor: pointer;
  transition: transform var(--ccv-transition-fast), box-shadow var(--ccv-transition-fast), border-color var(--ccv-transition-fast);
}

.chip:hover {
  border-color: var(--ccv-border-hover);
  color: var(--ccv-text-primary);
  transform: translateY(-1px);
  box-shadow: var(--ccv-shadow-sm);
}
```

- [ ] **Step 5: Commit**

```bash
git add src/frameworks/react/ErrorRecoveryCard.tsx src/frameworks/react/ErrorRecoveryCard.module.css src/frameworks/react/ActionChips.tsx src/frameworks/react/ActionChips.module.css
git commit -m "feat: add ErrorRecoveryCard and ActionChips components"
```

---

## Task 12: Right Panel with Tabs

**Files:**
- Modify: `src/frameworks/react/RightPanel.tsx` (replace stub)
- Create: `src/frameworks/react/RightPanel.module.css`
- Create: `src/frameworks/react/CodeTab.tsx`
- Create: `src/frameworks/react/CodeTab.module.css`
- Create: `src/frameworks/react/StagesTab.tsx`
- Create: `src/frameworks/react/StagesTab.module.css`
- Create: `src/frameworks/react/MetricsTab.tsx`
- Create: `src/frameworks/react/MetricsTab.module.css`
- Create: `src/frameworks/react/TeamTab.tsx`
- Create: `src/frameworks/react/TeamTab.module.css`

- [ ] **Step 1: Rewrite RightPanel.tsx**

```tsx
'use client';

import { useAppStore } from './store';
import { CodeTab } from './CodeTab';
import { StagesTab } from './StagesTab';
import { MetricsTab } from './MetricsTab';
import { TeamTab } from './TeamTab';
import styles from './RightPanel.module.css';

const TABS = [
  { id: 'code' as const, label: 'Code' },
  { id: 'stages' as const, label: 'Stages' },
  { id: 'metrics' as const, label: 'Metrics' },
  { id: 'team' as const, label: 'Team' },
];

export function RightPanel() {
  const activeTab = useAppStore((s) => s.ui.rightPanelTab);
  const setTab = useAppStore((s) => s.setRightPanelTab);
  const setOpen = useAppStore((s) => s.setRightPanelOpen);
  const mission = useAppStore((s) => s.activeMission);

  return (
    <aside className={styles.panel} role="complementary">
      <div className={styles.header}>
        <div className={styles.tabs}>
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className={`${styles.tab} ${activeTab === tab.id ? styles.activeTab : ''}`}
              onClick={() => setTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <button className={styles.closeBtn} onClick={() => setOpen(false)} aria-label="Close panel">
          \u2715
        </button>
      </div>

      <div className={styles.content}>
        {activeTab === 'code' && <CodeTab />}
        {activeTab === 'stages' && <StagesTab mission={mission} />}
        {activeTab === 'metrics' && <MetricsTab mission={mission} />}
        {activeTab === 'team' && <TeamTab mission={mission} />}
      </div>
    </aside>
  );
}
```

- [ ] **Step 2: Create RightPanel.module.css**

```css
.panel {
  width: 360px;
  background: var(--ccv-bg-secondary);
  border-left: 1px solid var(--ccv-border-default);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  overflow: hidden;
}

.header {
  display: flex;
  align-items: center;
  border-bottom: 1px solid var(--ccv-border-default);
  padding: 0 var(--ccv-space-2);
  min-height: 44px;
}

.tabs {
  display: flex;
  flex: 1;
  gap: 0;
}

.tab {
  padding: var(--ccv-space-3) var(--ccv-space-3);
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  color: var(--ccv-text-tertiary);
  font-family: var(--ccv-font-sans);
  font-size: var(--ccv-body-sm);
  font-weight: 500;
  cursor: pointer;
  transition: color var(--ccv-transition-fast), border-color var(--ccv-transition-fast);
}

.tab:hover {
  color: var(--ccv-text-secondary);
}

.activeTab {
  color: var(--ccv-accent-primary);
  border-bottom-color: var(--ccv-accent-primary);
}

.closeBtn {
  background: none;
  border: none;
  color: var(--ccv-text-tertiary);
  cursor: pointer;
  padding: var(--ccv-space-2);
  font-size: var(--ccv-body-sm);
  border-radius: var(--ccv-radius-sm);
}

.closeBtn:hover {
  background: var(--ccv-bg-tertiary);
  color: var(--ccv-text-secondary);
}

.content {
  flex: 1;
  overflow-y: auto;
  padding: var(--ccv-space-4);
}

/* Tablet */
@media (max-width: 1024px) and (min-width: 641px) {
  .panel {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    width: 70%;
    z-index: 40;
    box-shadow: var(--ccv-shadow-lg);
  }
}

/* Mobile */
@media (max-width: 640px) {
  .panel {
    position: fixed;
    inset: 0;
    width: 100%;
    z-index: 40;
  }
}
```

- [ ] **Step 3: Create CodeTab.tsx**

```tsx
'use client';

import styles from './CodeTab.module.css';

export function CodeTab() {
  // Placeholder — will show selected file content when artifact is clicked
  return (
    <div className={styles.empty}>
      <div className={styles.emptyIcon}>\u2B1A</div>
      <p className={styles.emptyText}>Click an artifact card in the feed to view its code here.</p>
    </div>
  );
}
```

- [ ] **Step 4: Create CodeTab.module.css**

```css
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  text-align: center;
}

.emptyIcon {
  font-size: 2rem;
  color: var(--ccv-text-tertiary);
  margin-bottom: var(--ccv-space-3);
}

.emptyText {
  font-size: var(--ccv-body-sm);
  color: var(--ccv-text-tertiary);
  max-width: 240px;
}
```

- [ ] **Step 5: Create StagesTab.tsx**

```tsx
'use client';

import type { Mission, StageName, StageStatus } from '@/domain';
import styles from './StagesTab.module.css';

const STATUS_ICONS: Record<StageStatus, string> = {
  completed: '\u2714',
  in_progress: '\u25CF',
  pending: '\u25CB',
  blocked: '\u26A0',
  skipped: '\u2014',
};

const STAGE_NAMES: Record<StageName, string> = {
  analysis: 'Analysis',
  design: 'Design',
  implementation: 'Implementation',
  review: 'Review',
  complete: 'Complete',
};

interface StagesTabProps {
  mission: Mission | null;
}

export function StagesTab({ mission }: StagesTabProps) {
  if (!mission) {
    return <div className={styles.empty}>No mission selected</div>;
  }

  return (
    <div className={styles.stageList}>
      {mission.stages.map((stage) => (
        <div key={stage.name} className={`${styles.stageItem} ${styles[stage.status]}`}>
          <span className={styles.statusIcon}>{STATUS_ICONS[stage.status]}</span>
          <div className={styles.stageInfo}>
            <div className={styles.stageName}>{STAGE_NAMES[stage.name]}</div>
            <div className={styles.stageMeta}>
              {stage.tasks.length} tasks
              {stage.assignedMembers.length > 0 && (
                <span className={styles.assignees}>
                  {stage.assignedMembers.map((role) => (
                    <span key={role} className={styles.memberDot} style={{ background: `var(--ccv-team-${role})` }} />
                  ))}
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 6: Create StagesTab.module.css**

```css
.stageList {
  display: flex;
  flex-direction: column;
  gap: var(--ccv-space-1);
}

.stageItem {
  display: flex;
  align-items: center;
  gap: var(--ccv-space-3);
  padding: var(--ccv-space-3);
  border-radius: var(--ccv-radius-md);
}

.in_progress {
  background: var(--ccv-accent-ghost);
}

.statusIcon {
  font-size: var(--ccv-body-md);
  width: 20px;
  text-align: center;
  flex-shrink: 0;
}

.completed .statusIcon {
  color: var(--ccv-status-active);
}

.in_progress .statusIcon {
  color: var(--ccv-accent-primary);
}

.pending .statusIcon {
  color: var(--ccv-text-tertiary);
}

.blocked .statusIcon {
  color: var(--ccv-status-blocked);
}

.stageInfo {
  flex: 1;
}

.stageName {
  font-size: var(--ccv-body-sm);
  font-weight: 500;
  color: var(--ccv-text-primary);
}

.stageMeta {
  font-size: var(--ccv-caption);
  color: var(--ccv-text-tertiary);
  display: flex;
  align-items: center;
  gap: var(--ccv-space-2);
}

.assignees {
  display: flex;
  gap: 2px;
}

.memberDot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}

.empty {
  padding: var(--ccv-space-8);
  text-align: center;
  color: var(--ccv-text-tertiary);
  font-size: var(--ccv-body-sm);
}
```

- [ ] **Step 7: Create MetricsTab.tsx**

```tsx
'use client';

import type { Mission } from '@/domain';
import styles from './MetricsTab.module.css';

interface MetricsTabProps {
  mission: Mission | null;
}

function formatTokens(count: number): string {
  if (count < 1000) return count.toString();
  if (count < 1_000_000) return `${(count / 1000).toFixed(1)}k`;
  return `${(count / 1_000_000).toFixed(1)}M`;
}

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}

export function MetricsTab({ mission }: MetricsTabProps) {
  if (!mission) {
    return <div className={styles.empty}>No mission selected</div>;
  }

  const { metrics } = mission;
  const budgetPercent = metrics.totalTokens > 0 ? Math.min(100, (metrics.totalTokens / 100000) * 100) : 0;

  return (
    <div className={styles.metrics}>
      <div className={styles.card}>
        <div className={styles.cardLabel}>Elapsed Time</div>
        <div className={styles.cardValue}>{formatDuration(metrics.totalDurationMs)}</div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardLabel}>Tokens Used</div>
        <div className={styles.cardValue}>{formatTokens(metrics.totalTokens)}</div>
        <div className={styles.budgetBar}>
          <div className={styles.budgetFill} style={{ width: `${budgetPercent}%` }} />
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardLabel}>Task Progress</div>
        <div className={styles.cardValue}>
          {metrics.completedTaskCount}/{metrics.taskCount}
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardLabel}>Estimated Cost</div>
        <div className={styles.cardValue}>${metrics.estimatedCostUsd.toFixed(2)}</div>
      </div>
    </div>
  );
}
```

- [ ] **Step 8: Create MetricsTab.module.css**

```css
.metrics {
  display: flex;
  flex-direction: column;
  gap: var(--ccv-space-3);
}

.card {
  background: var(--ccv-bg-tertiary);
  border-radius: var(--ccv-radius-md);
  padding: var(--ccv-space-3);
}

.cardLabel {
  font-size: var(--ccv-caption);
  color: var(--ccv-text-tertiary);
  margin-bottom: var(--ccv-space-1);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
}

.cardValue {
  font-size: var(--ccv-heading-md);
  font-weight: 600;
  color: var(--ccv-text-primary);
  font-family: var(--ccv-font-mono);
}

.budgetBar {
  height: 4px;
  background: var(--ccv-bg-secondary);
  border-radius: 2px;
  margin-top: var(--ccv-space-2);
  overflow: hidden;
}

.budgetFill {
  height: 100%;
  background: var(--ccv-accent-primary);
  border-radius: 2px;
  transition: width var(--ccv-transition-default);
}

.empty {
  padding: var(--ccv-space-8);
  text-align: center;
  color: var(--ccv-text-tertiary);
  font-size: var(--ccv-body-sm);
}
```

- [ ] **Step 9: Create TeamTab.tsx**

```tsx
'use client';

import type { Mission, TeamMemberRole } from '@/domain';
import styles from './TeamTab.module.css';

const ROLE_COLORS: Record<TeamMemberRole, string> = {
  architect: 'var(--ccv-team-architect)',
  developer: 'var(--ccv-team-developer)',
  qa: 'var(--ccv-team-qa)',
  reviewer: 'var(--ccv-team-reviewer)',
  product: 'var(--ccv-team-product)',
  learner: 'var(--ccv-team-learner)',
};

interface TeamTabProps {
  mission: Mission | null;
}

function formatTokens(count: number): string {
  if (count < 1000) return count.toString();
  if (count < 1_000_000) return `${(count / 1000).toFixed(1)}k`;
  return `${(count / 1_000_000).toFixed(1)}M`;
}

export function TeamTab({ mission }: TeamTabProps) {
  if (!mission) {
    return <div className={styles.empty}>No mission selected</div>;
  }

  return (
    <div className={styles.team}>
      <div className={styles.roster}>
        {mission.teamMembers.map((tm) => {
          const color = ROLE_COLORS[tm.member.role];
          const initial = tm.member.role.charAt(0).toUpperCase();

          return (
            <div key={tm.member.role} className={styles.member}>
              <div className={styles.avatar} style={{ background: color }}>
                {initial}
              </div>
              <div className={styles.memberInfo}>
                <div className={styles.memberRole}>{tm.member.displayName}</div>
                <div className={styles.memberStatus}>
                  <span className={`${styles.statusDot} ${styles[`status-${tm.status}`]}`} />
                  {tm.status === 'working' ? tm.currentTask ?? 'Working' : tm.status}
                </div>
              </div>
              <div className={styles.memberTokens}>
                {formatTokens(tm.tokensUsed)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 10: Create TeamTab.module.css**

```css
.team {
  display: flex;
  flex-direction: column;
  gap: var(--ccv-space-4);
}

.roster {
  display: flex;
  flex-direction: column;
  gap: var(--ccv-space-2);
}

.member {
  display: flex;
  align-items: center;
  gap: var(--ccv-space-3);
  padding: var(--ccv-space-2);
  border-radius: var(--ccv-radius-md);
}

.member:hover {
  background: var(--ccv-bg-tertiary);
}

.avatar {
  width: 30px;
  height: 30px;
  border-radius: var(--ccv-radius-circle);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: var(--ccv-caption);
  flex-shrink: 0;
}

.memberInfo {
  flex: 1;
  min-width: 0;
}

.memberRole {
  font-size: var(--ccv-body-sm);
  font-weight: 500;
  color: var(--ccv-text-primary);
}

.memberStatus {
  font-size: var(--ccv-caption);
  color: var(--ccv-text-tertiary);
  display: flex;
  align-items: center;
  gap: var(--ccv-space-1);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.statusDot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

.status-working { background: var(--ccv-status-active); }
.status-idle { background: var(--ccv-status-pending); }
.status-completed { background: var(--ccv-status-complete); }
.status-blocked { background: var(--ccv-status-blocked); }

.memberTokens {
  font-size: var(--ccv-caption);
  color: var(--ccv-text-tertiary);
  font-family: var(--ccv-font-mono);
  flex-shrink: 0;
}

.empty {
  padding: var(--ccv-space-8);
  text-align: center;
  color: var(--ccv-text-tertiary);
  font-size: var(--ccv-body-sm);
}
```

- [ ] **Step 11: Commit**

```bash
git add src/frameworks/react/RightPanel.tsx src/frameworks/react/RightPanel.module.css src/frameworks/react/CodeTab.tsx src/frameworks/react/CodeTab.module.css src/frameworks/react/StagesTab.tsx src/frameworks/react/StagesTab.module.css src/frameworks/react/MetricsTab.tsx src/frameworks/react/MetricsTab.module.css src/frameworks/react/TeamTab.tsx src/frameworks/react/TeamTab.module.css
git commit -m "feat: add RightPanel with Code, Stages, Metrics, and Team tabs"
```

---

## Task 13: CompletionBanner Component

**Files:**
- Create: `src/frameworks/react/CompletionBanner.tsx`
- Create: `src/frameworks/react/CompletionBanner.module.css`

- [ ] **Step 1: Create CompletionBanner.tsx**

```tsx
'use client';

import styles from './CompletionBanner.module.css';

interface CompletionBannerProps {
  tasksCompleted: number;
  totalTasks: number;
  totalDuration: string;
  totalTokens: string;
  estimatedCost: string;
  filesChanged: number;
  onViewRetro: () => void;
  onNewMission: () => void;
  onViewFiles: () => void;
}

export function CompletionBanner({
  tasksCompleted,
  totalTasks,
  totalDuration,
  totalTokens,
  estimatedCost,
  filesChanged,
  onViewRetro,
  onNewMission,
  onViewFiles,
}: CompletionBannerProps) {
  return (
    <div className={styles.banner}>
      <div className={styles.checkmark}>\u2714</div>
      <h2 className={styles.heading}>Mission Completed Successfully</h2>
      <p className={styles.summary}>
        {tasksCompleted}/{totalTasks} tasks completed in {totalDuration}
      </p>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statValue}>{tasksCompleted}</span>
          <span className={styles.statLabel}>Tasks</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>{totalTokens}</span>
          <span className={styles.statLabel}>Tokens</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>{estimatedCost}</span>
          <span className={styles.statLabel}>Cost</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>{filesChanged}</span>
          <span className={styles.statLabel}>Files</span>
        </div>
      </div>

      <div className={styles.actions}>
        <button className={styles.retroBtn} onClick={onViewRetro}>View Retrospective</button>
        <button className={styles.newBtn} onClick={onNewMission}>New Mission</button>
        <button className={styles.filesBtn} onClick={onViewFiles}>View all files</button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create CompletionBanner.module.css**

```css
.banner {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: var(--ccv-space-8);
  background: var(--ccv-bg-secondary);
  border: 1px solid var(--ccv-border-default);
  border-radius: var(--ccv-radius-lg);
}

.checkmark {
  width: 48px;
  height: 48px;
  border-radius: var(--ccv-radius-circle);
  background: rgba(34,197,94,0.12);
  color: var(--ccv-status-active);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  margin-bottom: var(--ccv-space-4);
}

.heading {
  font-size: var(--ccv-heading-md);
  font-weight: 600;
  color: var(--ccv-text-primary);
  margin-bottom: var(--ccv-space-2);
}

.summary {
  font-size: var(--ccv-body-sm);
  color: var(--ccv-text-secondary);
  margin-bottom: var(--ccv-space-6);
}

.stats {
  display: flex;
  gap: var(--ccv-space-8);
  margin-bottom: var(--ccv-space-6);
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.statValue {
  font-size: var(--ccv-heading-md);
  font-weight: 600;
  color: var(--ccv-text-primary);
  font-family: var(--ccv-font-mono);
}

.statLabel {
  font-size: var(--ccv-caption);
  color: var(--ccv-text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.actions {
  display: flex;
  gap: var(--ccv-space-3);
}

.retroBtn {
  background: rgba(251,146,60,0.12);
  color: var(--ccv-team-learner);
  border: 1px solid rgba(251,146,60,0.2);
  border-radius: var(--ccv-radius-md);
  padding: var(--ccv-space-2) var(--ccv-space-5);
  font-family: var(--ccv-font-sans);
  font-size: var(--ccv-body-sm);
  font-weight: 500;
  cursor: pointer;
  transition: background var(--ccv-transition-fast);
}

.retroBtn:hover {
  background: rgba(251,146,60,0.18);
}

.newBtn {
  background: var(--ccv-accent-primary);
  color: white;
  border: none;
  border-radius: var(--ccv-radius-md);
  padding: var(--ccv-space-2) var(--ccv-space-5);
  font-family: var(--ccv-font-sans);
  font-size: var(--ccv-body-sm);
  font-weight: 600;
  cursor: pointer;
  transition: background var(--ccv-transition-fast);
}

.newBtn:hover {
  background: var(--ccv-accent-hover);
}

.filesBtn {
  background: transparent;
  color: var(--ccv-text-secondary);
  border: 1px solid var(--ccv-border-default);
  border-radius: var(--ccv-radius-md);
  padding: var(--ccv-space-2) var(--ccv-space-5);
  font-family: var(--ccv-font-sans);
  font-size: var(--ccv-body-sm);
  cursor: pointer;
  transition: border-color var(--ccv-transition-fast);
}

.filesBtn:hover {
  border-color: var(--ccv-border-hover);
  color: var(--ccv-text-primary);
}
```

- [ ] **Step 3: Commit**

```bash
git add src/frameworks/react/CompletionBanner.tsx src/frameworks/react/CompletionBanner.module.css
git commit -m "feat: add CompletionBanner with stats and action CTAs"
```

---

## Task 14: ActiveMissionView (State 2 + State 3)

**Files:**
- Create: `src/frameworks/react/ActiveMissionView.tsx`
- Create: `src/frameworks/react/ActiveMissionView.module.css`
- Modify: `src/app/missions/[id]/page.tsx`

- [ ] **Step 1: Create ActiveMissionView.tsx**

This component orchestrates the active/completed mission layout: topbar + feed + composer.

```tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Mission } from '@/domain';
import { useAppStore } from './store';
import { MissionTopbar } from './MissionTopbar';
import { ActivityFeed } from './ActivityFeed';
import { UserMessage, AgentMessage } from './FeedMessage';
import { StageBanner } from './StageBanner';
import { CompletionBanner } from './CompletionBanner';
import { ActionChips } from './ActionChips';
import { Composer } from './Composer';
import styles from './ActiveMissionView.module.css';

interface ActiveMissionViewProps {
  mission: Mission;
}

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}

function formatTokens(count: number): string {
  if (count < 1000) return count.toString();
  if (count < 1_000_000) return `${(count / 1000).toFixed(1)}k`;
  return `${(count / 1_000_000).toFixed(1)}M`;
}

export function ActiveMissionView({ mission }: ActiveMissionViewProps) {
  const router = useRouter();
  const setActiveMission = useAppStore((s) => s.setActiveMission);
  const setRightPanelTab = useAppStore((s) => s.setRightPanelTab);
  const terminalLines = useAppStore(
    (s) => s.realtime.streamingLines.get(mission.id) ?? [],
  );

  const isLive = mission.status === 'active';
  const isCompleted = mission.status === 'completed';

  useEffect(() => {
    setActiveMission(mission);
    return () => setActiveMission(null);
  }, [mission, setActiveMission]);

  useEffect(() => {
    if (isCompleted) {
      setRightPanelTab('team');
    }
  }, [isCompleted, setRightPanelTab]);

  const handlePause = async () => {
    await fetch(`/api/missions/${mission.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'paused' }),
    });
  };

  const handleCancel = async () => {
    await fetch(`/api/missions/${mission.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'cancelled' }),
    });
  };

  const handleMessage = (message: string) => {
    // Send mid-mission intervention via WebSocket
    console.log('Mid-mission message:', message);
  };

  return (
    <div className={styles.missionView}>
      <MissionTopbar
        type={mission.type}
        title={mission.title}
        status={mission.status}
        startTime={mission.createdAt.getTime()}
        onPause={isLive ? handlePause : undefined}
        onCancel={isLive ? handleCancel : undefined}
        onRetry={!isLive ? () => {} : undefined}
      />

      <ActivityFeed isStreaming={isLive}>
        {/* Render feed items from terminal lines and stage data */}
        {terminalLines.map((line) => {
          if (line.type === 'stage-transition') {
            return null; // Stage banners rendered from stage data
          }
          if (line.source === 'system') {
            return null;
          }
          return (
            <AgentMessage
              key={line.id}
              role={line.source}
              status={isLive ? 'working' : 'done'}
              content={line.content}
            />
          );
        })}

        {isCompleted && (
          <CompletionBanner
            tasksCompleted={mission.metrics.completedTaskCount}
            totalTasks={mission.metrics.taskCount}
            totalDuration={formatDuration(mission.metrics.totalDurationMs)}
            totalTokens={formatTokens(mission.metrics.totalTokens)}
            estimatedCost={`$${mission.metrics.estimatedCostUsd.toFixed(2)}`}
            filesChanged={0}
            onViewRetro={() => setRightPanelTab('team')}
            onNewMission={() => router.push('/')}
            onViewFiles={() => setRightPanelTab('code')}
          />
        )}
      </ActivityFeed>

      <div className={styles.composerArea}>
        <div className={styles.composerWrapper}>
          {isLive && <ActionChips chips={[
            { label: 'Skip stage', onClick: () => {} },
            { label: 'Add constraint', onClick: () => {} },
            { label: 'Change model', onClick: () => {} },
            { label: 'Attach file', onClick: () => {} },
          ]} />}
          <Composer
            variant="mission"
            placeholder={
              isCompleted
                ? 'Mission completed. Ask follow-ups or start a new mission...'
                : 'Redirect, correct, or add context...'
            }
            onSubmit={handleMessage}
            disabled={false}
          />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create ActiveMissionView.module.css**

```css
.missionView {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.composerArea {
  border-top: 1px solid var(--ccv-border-default);
  padding: var(--ccv-space-4);
  display: flex;
  justify-content: center;
  background: var(--ccv-bg-primary);
}

.composerWrapper {
  max-width: 660px;
  width: 100%;
}

@media (max-width: 640px) {
  .composerArea {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 30;
    padding: var(--ccv-space-3);
  }
}
```

- [ ] **Step 3: Update mission detail page**

Replace `src/app/missions/[id]/page.tsx`:

```tsx
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
```

- [ ] **Step 4: Verify build**

Run: `cd /Users/mevapps/StudioProjects/CCV && npx next build 2>&1 | tail -30`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/frameworks/react/ActiveMissionView.tsx src/frameworks/react/ActiveMissionView.module.css src/app/missions/\[id\]/page.tsx
git commit -m "feat: add ActiveMissionView with feed, composer, and completion state"
```

---

## Task 15: Remove Old Components

**Files:**
- Delete: `src/frameworks/react/DashboardView.tsx`
- Delete: `src/frameworks/react/DashboardView.module.css`
- Delete: `src/frameworks/react/TopBar.tsx`
- Delete: `src/frameworks/react/TopBar.module.css`
- Delete: `src/frameworks/react/KanbanBoard.tsx`
- Delete: `src/frameworks/react/KanbanBoard.module.css`
- Delete: `src/frameworks/react/TableView.tsx`
- Delete: `src/frameworks/react/TableView.module.css`
- Delete: `src/frameworks/react/MissionDetailView.tsx`
- Delete: `src/frameworks/react/MissionDetailView.module.css`
- Delete: `src/frameworks/react/MetricsSidebar.tsx`
- Delete: `src/frameworks/react/MetricsSidebar.module.css`
- Delete: `src/frameworks/react/CreateMissionView.tsx`
- Delete: `src/frameworks/react/CreateMissionView.module.css`
- Delete: `src/app/missions/create/page.tsx`
- Delete: `src/app/missions/page.tsx`

- [ ] **Step 1: Remove old component files**

```bash
rm src/frameworks/react/DashboardView.tsx src/frameworks/react/DashboardView.module.css
rm src/frameworks/react/TopBar.tsx src/frameworks/react/TopBar.module.css
rm src/frameworks/react/KanbanBoard.tsx src/frameworks/react/KanbanBoard.module.css
rm src/frameworks/react/TableView.tsx src/frameworks/react/TableView.module.css
rm src/frameworks/react/MissionDetailView.tsx src/frameworks/react/MissionDetailView.module.css
rm src/frameworks/react/MetricsSidebar.tsx src/frameworks/react/MetricsSidebar.module.css
rm src/frameworks/react/CreateMissionView.tsx src/frameworks/react/CreateMissionView.module.css
rm src/app/missions/create/page.tsx
rm src/app/missions/page.tsx
```

- [ ] **Step 2: Verify no remaining imports of deleted files**

Run: `cd /Users/mevapps/StudioProjects/CCV && grep -r "DashboardView\|TopBar\|KanbanBoard\|TableView\|MissionDetailView\|MetricsSidebar\|CreateMissionView" src/ --include="*.tsx" --include="*.ts" -l`

Expected: No files returned (or only the old component files themselves which are now deleted). If any files still import deleted components, fix those imports.

- [ ] **Step 3: Remove TerminalPanel import from remaining code if referenced**

Check if `TerminalPanel` is still imported anywhere. It stays because terminal output is still used (embedded in feed messages), but direct imports from deleted files need to be cleaned.

- [ ] **Step 4: Verify build**

Run: `cd /Users/mevapps/StudioProjects/CCV && npx next build 2>&1 | tail -30`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: remove old dashboard, kanban, table, and create views"
```

---

## Task 16: Keyboard Shortcuts and Accessibility

**Files:**
- Modify: `src/frameworks/react/AppShell.tsx` (add keyboard handlers)

- [ ] **Step 1: Add keyboard shortcut handler to AppShell**

Add a `useEffect` in `AppShell.tsx` for the global keyboard shortcuts:

```tsx
useEffect(() => {
  const handler = (e: KeyboardEvent) => {
    // Cmd+Shift+O: New mission
    if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'O') {
      e.preventDefault();
      router.push('/');
    }
    // Cmd+Shift+S: Toggle sidebar
    if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'S') {
      e.preventDefault();
      setSidebarCollapsed(!sidebarCollapsed);
    }
    // / to focus input (when not already in an input)
    if (e.key === '/' && !(e.target instanceof HTMLTextAreaElement) && !(e.target instanceof HTMLInputElement)) {
      e.preventDefault();
      const composer = document.querySelector('textarea');
      composer?.focus();
    }
  };
  window.addEventListener('keydown', handler);
  return () => window.removeEventListener('keydown', handler);
}, [router, setSidebarCollapsed, sidebarCollapsed]);
```

- [ ] **Step 2: Add ARIA roles to AppShell**

Update the JSX in AppShell to include proper roles:

```tsx
<div className={styles.shell}>
  <Sidebar ... />  {/* Sidebar already uses nav + role="listbox" */}
  <main className={styles.mainArea}>
    {children}
  </main>
  {isMissionRoute && rightPanelOpen && <RightPanel />}  {/* RightPanel uses role="complementary" */}
</div>
```

The `ActivityFeed` already has `role="log"`, `FeedMessage` uses `role="article"`, and the `Sidebar` uses `role="listbox"`.

- [ ] **Step 3: Verify build**

Run: `cd /Users/mevapps/StudioProjects/CCV && npx next build 2>&1 | tail -20`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/frameworks/react/AppShell.tsx
git commit -m "feat: add keyboard shortcuts and ARIA roles"
```

---

## Task 17: Final Integration and Build Verification

**Files:**
- All files from previous tasks

- [ ] **Step 1: Run full build**

Run: `cd /Users/mevapps/StudioProjects/CCV && npx next build 2>&1`
Expected: Build succeeds with no errors

- [ ] **Step 2: Fix any build errors**

If TypeScript or build errors occur, fix them. Common issues:
- Missing imports
- Type mismatches between old and new interfaces
- CSS module class references that don't exist

- [ ] **Step 3: Run dev server and verify**

Run: `cd /Users/mevapps/StudioProjects/CCV && npx next dev &`
Expected: Dev server starts on port 3000

Open browser and verify:
1. Home screen shows centered greeting + composer + pills
2. Sidebar shows with logo, search, new mission button
3. Colors match the warm-tinted neutral spec
4. Keyboard shortcuts work (Cmd+K for search, Cmd+Shift+S for sidebar toggle)

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "feat: complete UI/UX redesign — claude.ai-inspired layout"
```
