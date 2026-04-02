# CCV UI/UX Redesign — Design Specification

**Date:** 2026-04-02
**Status:** Approved
**Approach:** Option C — Hybrid Activity Feed + Mission Intelligence

## Overview

Restructure CCV's UI from a dashboard/kanban paradigm to a claude.ai-inspired layout: sidebar + activity feed + context panel. The app retains its multi-agent mission orchestration identity while adopting the structural patterns that make claude.ai feel effortless.

## Layout Structure

### Three-Column Layout

| Column | Width | Content |
|--------|-------|---------|
| **Sidebar** | 252px (collapsible to 0) | Logo, search, new mission button, mission list, user footer |
| **Main Area** | flex: 1 (min 400px) | Topbar + home screen OR activity feed + composer |
| **Right Panel** | 360px (closable) | Context-aware tabs: Code, Stages, Metrics, Team/Retro |

### Responsive Behavior

- **Desktop (>1024px):** All three columns visible, panel is side-by-side
- **Tablet (640-1024px):** Sidebar collapsible overlay, panel slides over at 70%
- **Mobile (<640px):** Sidebar hidden (drawer), panel fullscreen overlay, input fixed bottom

## Three App States

### State 1: Home Screen (No Mission Selected)

Centered vertically at ~30vh, max-width 640px:

1. **Greeting:** "What should your team build?" — large heading, centered
2. **Composer:** Claude.ai-style input box
   - Rounded `xl` corners (20px radius)
   - Auto-growing textarea (1-8 rows)
   - Toolbar: attach (＋), web search (globe), deep research (microscope), voice (mic), send (arrow)
   - Send button appears only when input is non-empty (animated pop-in)
   - Focus state: blue border + glow ring (`0 0 0 2px rgba(75,141,248,0.15)`)
3. **Model picker:** Below composer, left-aligned, dropdown trigger ("Claude Sonnet 4.6 ▾")
4. **Mission type pills:** Horizontal row below model picker
   - 8 pills: Brainstorm, Spec, Task, Bug fix, Epic, Review, Plan, Profile
   - Each pill shows: colored dot + type name + abbreviated team roster (e.g., "Arch · Dev · QA")
   - Clicking a pill expands into sub-suggestions (e.g., Task → "Implement endpoint", "Refactor module", "Add tests", "Migration")
   - Sub-suggestions prefill the composer with a starter prompt
   - Back arrow returns to top-level pills
   - Free-text input always works — pills are optional guidance
5. **Disclaimer:** "CCV orchestrates AI agents to complete software missions. Costs apply per token usage."

### State 2: Active Mission

**Topbar:**
- Left: Mission type badge (color-coded, uppercase monospace)
- Center: Mission title + live status indicator (pulsing green dot) + elapsed time
- Right: Pause button (amber), Cancel button (red)

**Activity Feed (scrollable, max-width 660px, centered):**
- **User message:** Right-aligned bubble, rounded corners, bg-tertiary
- **Stage transition banners:** Horizontal bar showing "Analysis → Implementation" with duration, amber-tinted background
- **Agent messages:** Left-aligned with:
  - Role avatar (30px, gradient background, letter initial)
  - Status indicator on avatar: pulsing green = working, blue = done, gray = idle
  - Role label (uppercase, team color) + timestamp
  - Message body with inline code support
  - Artifact cards (clickable, opens file in right panel)
  - Terminal output embedded contextually under the producing agent
- **Error recovery cards:** Red-tinted background with:
  - Error title + code snippet
  - Three action buttons: "Retry with fix" (primary), "Skip task" (secondary), "Full trace" (secondary)

**Composer (sticky bottom, max-width 660px):**
- Action chips above input: "Skip stage", "Add constraint", "Change model", "Attach file"
- Same composer style as home but with placeholder "Redirect, correct, or add context..."

**Right Panel:**
- Auto-focuses Code tab when artifact card is clicked
- Green notification dot on Stages tab when stage transition occurs
- **Code tab:** Syntax-highlighted file with line numbers, highlighted active lines
- **Stages tab:** Vertical list of stages with status icons (done/active/pending) and assigned agent avatars
- **Metrics tab:** Cards for elapsed time, tokens used (with budget bar), task progress, estimated cost
- **Team tab:** Agent roster with status (working/idle), current task, tokens consumed

### State 3: Completed Mission

**Topbar:** Status shows "Completed" (blue), Retry button replaces Pause/Cancel

**Feed additions:**
- Final stage banner showing full pipeline (Analysis → Impl → Review → Complete) with total duration
- **Completion banner:** Centered card with:
  - Checkmark icon
  - "Mission Completed Successfully" heading
  - Summary: "7/7 tasks completed in 11m 08s"
  - Stats row: Tasks, Tokens, Cost, Files changed
  - Three CTAs: "View Retrospective" (orange-tinted), "New Mission" (primary blue), "View all files" (secondary)

**Right Panel:** Auto-switches to Retro tab showing:
- Learner agent avatar + "Learner Analysis" header
- Summary paragraph
- Structured sections: "Went Well" (green checkmarks), "To Improve" (amber triangles), "Suggestions" (blue arrows)

**Composer:** Dimmed but still functional, placeholder: "Mission completed. Ask follow-ups or start a new mission..."

## Sidebar

### Structure (top to bottom)
1. **Header:** Logo (blue square "C") + brand name "CCV"
2. **Search:** Input with ⌘K shortcut indicator
3. **New Mission button:** Primary blue, full width
4. **Mission list** (scrollable, grouped):
   - **Running:** Missions with pulsing green dot, agent count, micro-progress bar, elapsed time
   - **Today/Yesterday/Older:** Completed missions with team member color dots, token count, duration
   - Blocked missions show red pulsing dot + red "!" notification badge
5. **Footer (sticky bottom):** User avatar + name + token budget display ("84.2k tokens today")

### Sidebar Interactions
- Hover on mission: show background highlight
- Active mission: tertiary background
- Notification badges: red circle with "!" for blocked/errored missions
- Collapse: sidebar slides to 0px width, hamburger icon appears in topbar

## Color System

### Design Philosophy
Warm-tinted neutral surfaces with refined blue accent (`#4B8DF8`). Backgrounds use subtle warm undertones to reduce eye strain. Surfaces differentiated by elevation (brightness steps) rather than heavy borders.

### Dark Mode Tokens

**Surfaces:**
| Token | Value | Usage |
|-------|-------|-------|
| bg-base | `#111214` | App root, deepest layer |
| bg-primary | `#1A1B1E` | Main content area |
| bg-secondary | `#222328` | Sidebar, panels, cards |
| bg-tertiary | `#2A2C32` | Hover states, inputs |
| bg-elevated | `#32343B` | Popovers, dropdowns |
| bg-sunken | `#131417` | Terminal, code blocks |

**Text:**
| Token | Value | Usage |
|-------|-------|-------|
| text-primary | `#EAEDF2` | Headings, body text |
| text-secondary | `#9199A8` | Descriptions, metadata |
| text-tertiary | `#5C6478` | Placeholders, timestamps |
| text-disabled | `#3A3E4A` | Disabled controls |

**Accent:**
| Token | Value | Usage |
|-------|-------|-------|
| accent-primary | `#4B8DF8` | Buttons, links, active tabs |
| accent-hover | `#3A7AE6` | Hover on accent elements |
| accent-pressed | `#2D6AD4` | Active/pressed state |
| accent-subtle | `rgba(75,141,248,0.12)` | Selected backgrounds, badges |
| accent-ghost | `rgba(75,141,248,0.06)` | Hover on ghost buttons |

**Borders:**
| Token | Value | Usage |
|-------|-------|-------|
| border-default | `#2A2D35` | Cards, dividers |
| border-hover | `#363940` | Hover emphasis |
| border-focus | `#4B8DF8` | Focus rings |

### Light Mode Tokens

**Surfaces:**
| Token | Value | Usage |
|-------|-------|-------|
| bg-base | `#F5F6F8` | App root |
| bg-primary | `#FFFFFF` | Main content area |
| bg-secondary | `#F0F1F4` | Sidebar, panels, cards |
| bg-tertiary | `#E4E6EB` | Hover states, inputs |
| bg-elevated | `#FFFFFF` (with shadow) | Popovers, dropdowns |
| bg-sunken | `#1E1F23` | Code blocks (always dark) |

**Text:**
| Token | Value | Usage |
|-------|-------|-------|
| text-primary | `#1A1D24` | Headings, body text |
| text-secondary | `#5C6478` | Descriptions, metadata |
| text-tertiary | `#8B91A0` | Placeholders, timestamps |
| text-disabled | `#B8BCC8` | Disabled controls |

**Accent (light mode):**
| Token | Value |
|-------|-------|
| accent-primary | `#3B7CF5` |

**Borders (light mode):**
| Token | Value |
|-------|-------|
| border-default | `#D8DBE2` |
| border-hover | `#C5C9D2` |
| border-focus | `#4B8DF8` |

### Semantic Colors (Shared)

**Status:**
| Token | Value | Usage |
|-------|-------|-------|
| status-active | `#22C55E` | Running, in-progress |
| status-complete | `#4B8DF8` | Done, finished |
| status-blocked | `#EF4444` | Error, blocked, failed |
| status-paused | `#F59E0B` | Paused, waiting |
| status-pending | `#6B7280` | Not started, idle |

**Team Members (Dark / Light):**
| Role | Dark | Light |
|------|------|-------|
| Architect | `#A78BFA` | `#7C3AED` |
| Developer | `#34D399` | `#059669` |
| QA | `#FBBF24` | `#D97706` |
| Reviewer | `#60A5FA` | `#2563EB` |
| Product | `#F472B6` | `#DB2777` |
| Learner | `#FB923C` | `#D97706` |

**Mission Types (Dark / Light):**
| Type | Dark | Light |
|------|------|-------|
| Brainstorm | `#C084FC` | `#7C3AED` |
| Spec | `#67E8F9` | `#0891B2` |
| Plan | `#86EFAC` | `#16A34A` |
| Task | `#60A5FA` | `#2563EB` |
| Epic | `#F472B6` | `#DB2777` |
| Review | `#FDE047` | `#CA8A04` |
| Bug | `#FCA5A5` | `#DC2626` |
| Profiling | `#FDBA74` | `#EA580C` |

### Elevation System

Surfaces gain brightness as they rise. No heavy borders needed — elevation communicates hierarchy.

**Dark mode:** sunken (#131417) → base (#1A1B1E) → card (#222328) → raised (#2A2C32) → overlay (#32343B)
**Light mode:** sunken (#1E1F23, always dark) → base (#FFFFFF) → card (#F0F1F4) → raised (#E4E6EB) → overlay (#FFFFFF + shadow)

### Shadows

| Token | Dark Mode | Light Mode |
|-------|-----------|------------|
| shadow-sm | `0 1px 2px rgba(0,0,0,0.2)` | `0 1px 2px rgba(0,0,0,0.05)` |
| shadow-md | `0 4px 12px rgba(0,0,0,0.25)` | `0 4px 12px rgba(0,0,0,0.08)` |
| shadow-lg | `0 8px 24px rgba(0,0,0,0.3)` | `0 8px 24px rgba(0,0,0,0.12)` |
| focus-ring | `0 0 0 2px rgba(75,141,248,0.2)` | `0 0 0 2px rgba(75,141,248,0.15)` |

### Overlays

| Token | Value | Usage |
|-------|-------|-------|
| overlay-dim | `rgba(0,0,0,0.5)` | Modal backdrop |
| overlay-light | `rgba(0,0,0,0.3)` | Mobile sidebar overlay |

## Typography

| Token | Font | Size | Weight | Line Height |
|-------|------|------|--------|-------------|
| heading-xl | Inter | 28px | 700 | 1.3 |
| heading-lg | Inter | 22px | 700 | 1.35 |
| heading-md | Inter | 18px | 600 | 1.4 |
| body-lg | Inter | 16px | 400 | 1.6 |
| body-md | Inter | 15px | 400 | 1.6 |
| body-sm | Inter | 13px | 400 | 1.5 |
| caption | Inter | 12px | 400 | 1.4 |
| label | Inter | 11px | 600 | 1.3 |
| code | JetBrains Mono | 12px | 400 | 1.8 |
| terminal | JetBrains Mono | 11px | 400 | 1.7 |

## Spacing

4px base unit: 0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80

## Border Radii

| Token | Value | Usage |
|-------|-------|-------|
| radius-sm | 4px | Badges, inline elements |
| radius-md | 6px | Buttons, inputs, small cards |
| radius-lg | 8px | Cards, panels |
| radius-xl | 20px | Composer, major containers |
| radius-pill | 9999px | Pills, chips |
| radius-circle | 50% | Avatars, send button |

## Transitions

| Token | Value | Usage |
|-------|-------|-------|
| fast | 120ms ease | Color changes, borders |
| default | 200ms ease | Most interactions |
| slow | 300ms ease-out | Panel slides, sidebar |
| spring | 300ms cubic-bezier(0.34,1.56,0.64,1) | Pop-in animations (send button, pills) |

## Interaction Patterns

### Composer Behavior
- Submit on Enter, newline on Shift+Enter
- Auto-resize height on content
- Focus: blue border + glow ring
- Send button: disabled state (tertiary bg) → enabled (accent, pop-in animation)
- Supports paste image and drag-drop files

### Action Chips (Active Mission)
- Appear above composer during active missions
- Contextual: "Skip stage", "Add constraint", "Change model", "Attach file"
- Pill-shaped, border, hover lifts 1px with shadow

### Artifact Cards
- Click opens file in right panel Code tab
- Hover: border brightens, arrow shifts right 2px
- Shows: icon + filename (mono) + metadata (line count, file type)

### Error Recovery
- Red-tinted card (6% red bg, 15% red border)
- Shows: error type, code snippet, file location
- Three action buttons: Retry (primary red), Skip (secondary), Full trace (secondary)

### Mission Sidebar Items
- Running: pulsing green dot + agent count + micro-progress bar
- Completed: static blue/gray dot + team member color dots + metrics
- Blocked: pulsing red dot + "!" badge notification
- Hover: bg-tertiary highlight
- Active: bg-tertiary persistent

## Accessibility

### Keyboard Navigation
| Shortcut | Action |
|----------|--------|
| ⌘K | Search missions |
| ⌘Shift+O | New mission |
| ⌘Shift+S | Toggle sidebar |
| Enter | Send message |
| Shift+Enter | New line |
| / | Focus input |

### ARIA Roles
- Sidebar: `navigation`
- Mission list: `listbox`
- Feed: `log`
- Messages: `article`
- Input area: `form`
- Right panel: `complementary`

### Motion
- Respects `prefers-reduced-motion`: all transforms disabled, opacity transitions kept but instant
- GPU-accelerated: only `transform` and `opacity` animated

## Data Flow (Unchanged)

The existing clean architecture remains intact:
- WebSocket streams terminal output, mission status, stage updates
- Zustand store manages client-side state
- Presenters transform domain entities to view models
- API routes serve as thin adapters to use cases

## What Changes vs. Current Implementation

| Area | Current | New |
|------|---------|-----|
| Home page | Dashboard with stats cards + mission grid | Centered composer + mission type pills |
| Navigation | TopBar breadcrumbs + sidebar nav links | Sidebar mission list (temporal grouping) |
| Mission detail | Header + kanban/table + terminal + metrics sidebar | Activity feed + contextual right panel |
| Interaction | View-only monitoring | Composer for mid-mission intervention |
| Color palette | Cold blue-gray (#0D0F11, #3B82F6) | Warm neutrals (#1A1B1E, #4B8DF8) + light mode |
| Terminal | Separate collapsible panel | Embedded in agent messages contextually |
| Error handling | Status indicators only | Actionable error recovery cards |
| Completion | Status badge change | Completion banner + retrospective CTA |

## Mockup References

Interactive mockups saved in `.superpowers/brainstorm/`:
- `option-c-final.html` — Three-state app mockup (home, active, completed)
- `color-system-v2.html` — Complete color system with tokens, previews, interaction states
