# SciReason - Scientific Reasoning Engine

## Overview
SciReason is a mobile application that transforms research questions into structured evidence maps, hypothesis cards, and R&D roadmaps following rigorous scientific methodology.

## Current State
- MVP implementation complete
- 4-tab navigation (Home, Evidence, Library, Profile)
- AI-powered scientific reasoning using Anthropic Claude via Replit AI Integrations
- Local data persistence with AsyncStorage

## Project Architecture

### Frontend (Expo/React Native)
- `client/` - Mobile app source code
  - `components/` - Reusable UI components
  - `screens/` - App screens
  - `navigation/` - React Navigation setup
  - `hooks/` - Custom hooks (useStorage, useTheme)
  - `types/` - TypeScript type definitions
  - `constants/` - Theme and design tokens

### Backend (Express.js)
- `server/` - API server
  - `routes.ts` - API route definitions
  - `reasoning.ts` - Anthropic AI integration for scientific reasoning

## Key Features
1. **Two Analysis Modes:**
   - Evidence Mode (Steps 1-7): Map existing therapies and evidence
   - R&D Roadmap Mode (Steps 1-9): Full analysis with hypothesis generation

2. **Card System:**
   - EvidenceCards with validity profiles
   - HypothesisCards with falsification criteria
   - RoadmapCards with decision gates

3. **9-Step Workflow:**
   - Step 0: Input validation
   - Step 1: Problem Definition
   - Step 2: Evidence Mapping
   - Step 3: Validity Assessment
   - Step 4: Evidence Map
   - Step 5: Gap List
   - Step 6: Hypothesis Generation
   - Step 7: Critic & Falsification
   - Step 8: Decision Gating
   - Step 9: R&D Roadmap

## Recent Changes
- Initial MVP build (December 2024)
- Implemented all 4 navigation tabs
- Created scientific reasoning workflow
- Integrated Anthropic Claude for AI processing
- Added local storage persistence

## User Preferences
- Dark/Light mode auto-detection
- Scientific/clinical color scheme (blue primary, purple secondary)
- Card-based UI with validity indicators

## Safety Constraints
- No medical advice or dosage recommendations
- No synthesis instructions
- Research information only disclaimer
