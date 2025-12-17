# Scientific Reasoning Engine - Mobile Design Guidelines

## Architecture Decisions

### Authentication
**Auth Required** - This app needs user accounts for:
- Saving research sessions and card collections
- Syncing reasoning chains across devices
- Tracking research history

**Implementation:**
- Use Apple Sign-In (iOS) and Google Sign-In (Android) via SSO
- Mock auth flow in prototype with local state simulation
- Include login/signup screens with privacy policy & terms links
- Profile screen with:
  - User avatar (use 1 science-themed preset: beaker/flask icon)
  - Display name
  - Settings: theme preference, notification settings
  - Log out (with confirmation alert)
  - Delete account (Settings > Account > Delete with double confirmation)

### Navigation
**Tab Navigation** (4 tabs with floating action button for core action):

1. **Home** - Current reasoning session, active problem
2. **Evidence** - Saved evidence cards and maps
3. **Library** - Past research sessions and roadmaps
4. **Profile** - User settings and account

**Floating Action Button (FAB):**
- Position: Bottom-right, above tab bar
- Purpose: "New Inquiry" - starts fresh reasoning session
- Icon: Plus or magnifying glass icon
- Shadow: width: 0, height: 2, opacity: 0.10, radius: 2

## Screen Specifications

### 1. Home Screen (Active Research Session)
**Purpose:** Display current reasoning workflow with step-by-step progress

**Layout:**
- **Header:** Transparent, title: "Reasoning Session"
  - Left: Back button (if in active session)
  - Right: Save/Share button
- **Main Content:** Scrollable vertical list
  - Safe area insets: top (headerHeight + Spacing.xl), bottom (tabBarHeight + Spacing.xl)
  - Step progress indicator (1/9 steps)
  - Expandable step cards showing current state
  - Primary action button at bottom of each incomplete step

**Components:**
- StepCard component (collapsible)
- ProgressBar (9 segments)
- StatusBadge (completed/active/pending)
- PrimaryButton for step actions

### 2. Evidence Card Detail Screen (Modal)
**Purpose:** Display full evidence card with validity profile

**Layout:**
- **Header:** Custom navigation header (non-transparent)
  - Left: Close button (X)
  - Right: Bookmark icon
  - Title: "Evidence Card"
- **Main Content:** Scrollable form
  - Safe area insets: top (Spacing.xl), bottom (insets.bottom + Spacing.xl)
  - Citation block with source link
  - Context section (model, species, population)
  - Intervention details
  - Outcome data
  - Validity Profile visualization (4 bars: internal, external, mechanistic, robustness)
  - Critical limitations list

**Components:**
- InfoSection (label + value pairs)
- ValidityBar (horizontal bar chart)
- Tag (for high/medium/low indicators)
- LinkButton (for source citation)

### 3. Evidence Map Screen
**Purpose:** Visualize evidence relationships, contradictions, and gaps

**Layout:**
- **Header:** Transparent, title: "Evidence Map"
  - Right: Filter icon
- **Main Content:** Scrollable
  - Safe area insets: top (headerHeight + Spacing.xl), bottom (tabBarHeight + Spacing.xl)
  - Three sections: Consistent Findings, Contradictions, Gaps
  - Connection lines between contradicting evidence
  
**Components:**
- SectionHeader
- EvidenceCardPreview (compact card)
- ConnectionLine (visual indicator)
- GapCard (highlighted differently)

### 4. Hypothesis Generator Screen
**Purpose:** Create and evaluate hypothesis cards

**Layout:**
- **Header:** Custom header (non-transparent)
  - Left: Cancel
  - Right: Generate (primary action)
  - Title: "Generate Hypotheses"
- **Main Content:** Scrollable form
  - Safe area insets: top (Spacing.xl), bottom (insets.bottom + Spacing.xl)
  - Problem statement input
  - Selected gap indicators
  - Mechanism description field
  - Predictions list builder

**Components:**
- TextArea (multi-line input)
- ChipSelector (for gap selection)
- ListBuilder (add/remove predictions)
- FormSection

### 5. Roadmap Screen
**Purpose:** Display phased R&D roadmap with decision gates

**Layout:**
- **Header:** Transparent, title: "R&D Roadmap"
  - Right: Export icon
- **Main Content:** Scrollable vertical timeline
  - Safe area insets: top (headerHeight + Spacing.xl), bottom (tabBarHeight + Spacing.xl)
  - Phase cards connected with vertical line
  - Decision gates (proceed/stop/pivot) between phases
  - Risk indicators

**Components:**
- PhaseCard (expandable)
- TimelineConnector (vertical line)
- DecisionGate (diamond shape with icons)
- RiskBadge

### 6. Library Screen
**Purpose:** Browse past research sessions

**Layout:**
- **Header:** Transparent
  - Title: "Research Library"
  - Right: Search icon
- **Main Content:** Scrollable list
  - Safe area insets: top (headerHeight + Spacing.xl), bottom (tabBarHeight + Spacing.xl)
  - Session cards with metadata
  - Swipe actions: Delete, Archive

**Components:**
- SessionCard (thumbnail preview)
- SwipeActions
- EmptyState (when no sessions)

## Design System

### Color Palette
**Primary Theme:** Scientific/Clinical - Trust and Precision

- **Primary:** `#2563EB` (Blue) - Actions, links, primary buttons
- **Secondary:** `#7C3AED` (Purple) - Hypothesis cards, creative elements
- **Success:** `#059669` (Green) - High validity, completed steps
- **Warning:** `#D97706` (Amber) - Medium validity, decision gates
- **Error:** `#DC2626` (Red) - Low validity, contradictions
- **Background:** `#FFFFFF` (Light mode), `#0F172A` (Dark mode)
- **Surface:** `#F8FAFC` (Light mode), `#1E293B` (Dark mode)
- **Text Primary:** `#0F172A` (Light mode), `#F8FAFC` (Dark mode)
- **Text Secondary:** `#64748B`
- **Border:** `#E2E8F0`

### Typography
- **Headers (Large Title):** SF Pro Display, 34pt, Bold
- **Section Headers:** SF Pro Text, 22pt, Semibold
- **Body:** SF Pro Text, 17pt, Regular
- **Caption:** SF Pro Text, 13pt, Regular
- **Monospace (Citations):** SF Mono, 14pt, Regular

### Card System
**Evidence Card:**
- Background: Surface color
- Border: 1px solid Border color
- Border radius: 12px
- Padding: 16px
- Shadow: NONE (use border only)
- Validity indicator: Colored left border (4px width)

**Hypothesis Card:**
- Background: Linear gradient (subtle purple tint)
- Border radius: 12px
- Padding: 16px
- Shadow: NONE
- Falsification section with warning background

**Validity Profile Visualization:**
- Four horizontal bars
- Color-coded: Success (high), Warning (medium), Error (low)
- Bar height: 8px
- Rounded ends
- Labels on left, percentage on right

### Interactive Elements
**Primary Button:**
- Background: Primary color
- Text: White, 17pt, Semibold
- Height: 50px
- Border radius: 12px
- Press feedback: Opacity 0.8

**Secondary Button:**
- Background: Surface color
- Border: 1px Primary color
- Text: Primary color
- Same dimensions as primary

**FAB (New Inquiry):**
- Background: Primary color
- Icon: White, 24px
- Size: 56x56px
- Border radius: 28px
- Shadow: width: 0, height: 2, opacity: 0.10, radius: 2
- Position: 16px from right, 16px above tab bar

**Card Press Feedback:**
- Scale animation: 0.98
- Opacity: 0.95
- Duration: 150ms

### Icons
- Use **Feather icons** from @expo/vector-icons
- Primary icon set: Search, Plus, X, Check, AlertTriangle, AlertCircle, ChevronRight, ChevronDown, FileText, Link, Bookmark
- Size: 20px (small), 24px (default), 32px (large)

### Spacing System
- xs: 4px
- sm: 8px
- md: 12px
- lg: 16px
- xl: 24px
- 2xl: 32px
- 3xl: 48px

### Critical Assets
**Generated Assets Required:**
1. **Science-themed avatar** (1 option):
   - Abstract beaker or microscope icon
   - Geometric, minimal style
   - Primary color palette
   - 200x200px, transparent background

**NO other custom illustrations needed** - Use system icons for all functionality

### Accessibility
- All text meets WCAG AA contrast ratios (4.5:1 for body text)
- Validity indicators use BOTH color AND text labels
- All interactive elements minimum 44x44pt touch target
- Support Dynamic Type (iOS) for font scaling
- VoiceOver labels for all cards and interactive elements
- Screen reader announces step progress clearly

### Safety & Constraints Visual Indicators
**STOP State Display:**
- Full-screen overlay with warning icon
- Clear explanation of why stopped
- List of required next steps
- "What's Missing" section with bullet points
- Suggested queries in secondary cards
- NO dismissive language - professional and informative

**Safety Constraint Alert:**
- Banner at top when medical/dosing questions detected
- Icon: AlertCircle
- Background: Warning color (10% opacity)
- Text: "This platform provides research information only. Consult medical professionals for clinical advice."
- Persistent until acknowledged