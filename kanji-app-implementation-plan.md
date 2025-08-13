# Japanese Kanji Training App - Revised Implementation Plan

## Project Overview
A web-based Japanese kanji training application for writing practice and memorization with N1-N5 level kanji database, featuring stroke-based drawing validation and flashcard functionality.

## Technology Stack (Revised)

### Frontend Framework
- **React 18** with TypeScript for component-based UI
- **Vite** for fast development and building
- **React Router DOM** for routing (essential missing piece)
- **Tailwind CSS** for responsive styling
- **Framer Motion** for smooth animations

### Drawing & Stroke Validation
- **Konva.js** for canvas-based drawing (stable, no conflicts)
- **Custom stroke validation** based on timing and count (realistic approach)
- **HanziWriter** for reference stroke order display only (separate canvas)

### State Management
- **Zustand** for lightweight global state management
- **React Query (TanStack Query)** for server state and caching

### Data Storage & APIs
- **Kanji Alive API** or **Jisho API** for reliable kanji data
- **Static JSON fallback** for offline functionality
- **LocalStorage** for user progress and selected level
- **IndexedDB** for caching API responses

### UI Components
- **Headless UI** for accessible components
- **React Hook Form** for form handling
- **React Hot Toast** for notifications
- **Error Boundaries** for stability

### Quality Assurance & Testing
- **Vitest** for unit and integration testing
- **React Testing Library** for component testing
- **ESLint** + **Prettier** for code quality
- **TypeScript strict mode** for type safety
- **Husky** + **lint-staged** for pre-commit hooks
- **Playwright** for E2E testing (optional)

## Database Structure

### Kanji Data Model
```json
{
  "id": "unique_id",
  "character": "漢",
  "level": "N2",
  "meanings": ["Chinese character", "Han character"],
  "readings": {
    "onyomi": ["カン"],
    "kunyomi": ["から"]
  },
  "strokes": 13,
  "strokeOrder": [...], // SVG path data
  "frequency": 1250
}
```

### Level Distribution
- **N5**: ~100 kanji (basic)
- **N4**: ~300 kanji (elementary)
- **N3**: ~650 kanji (intermediate)
- **N2**: ~1000 kanji (upper-intermediate)
- **N1**: ~1000 kanji (advanced)

## Application Architecture

### Component Structure
```
src/
├── components/
│   ├── common/
│   │   ├── Header.tsx
│   │   ├── Navigation.tsx
│   │   └── LoadingSpinner.tsx
│   ├── LevelSelector/
│   │   └── LevelSelector.tsx
│   ├── WritingPractice/
│   │   ├── DrawingCanvas.tsx
│   │   ├── KanjiDisplay.tsx
│   │   └── AccuracyScore.tsx
│   └── Flashcards/
│       ├── FlashcardDeck.tsx
│       ├── FlashcardItem.tsx
│       └── FlashcardResults.tsx
├── data/
│   ├── kanji-n1.json
│   ├── kanji-n2.json
│   ├── kanji-n3.json
│   ├── kanji-n4.json
│   └── kanji-n5.json
├── hooks/
│   ├── useKanjiData.ts
│   ├── useDrawing.ts
│   └── useFlashcards.ts
├── store/
│   └── appStore.ts
└── utils/
    ├── kanjiRecognition.ts
    └── randomSelection.ts
```

## Core Features Implementation

### 1. Level Selection
- **Component**: `LevelSelector.tsx`
- **Functionality**: 
  - Display N1-N5 buttons with visual indicators
  - Save selected level to localStorage
  - Show kanji count per level
- **State**: Global state with Zustand

### 2. Writing Practice (Realistic Approach)
- **Component**: `WritingPractice/`
- **Features**:
  - Canvas drawing area with grid overlay (Konva.js)
  - Display target kanji prominently
  - **Stroke validation based on:**
    - Stroke count (compare with expected)
    - Drawing time (reasonable completion time)
    - Basic stroke direction detection
    - Canvas coverage area analysis
  - **Feedback system:**
    - "Good practice!" for reasonable attempts
    - Stroke count validation ("Expected 8 strokes, you drew 7")
    - Time-based encouragement
  - Clear/retry functionality
  - Side-by-side stroke order reference (HanziWriter)
- **Libraries**: 
  - Konva.js for drawing canvas
  - HanziWriter for stroke order display (separate canvas)
  - Custom validation algorithms (no ML dependency)

### 3. Flashcards
- **Component**: `Flashcards/`
- **Features**:
  - Deck of 20 random kanji from selected level
  - Two-sided cards (kanji → meaning/reading)
  - Progress tracking through deck
  - Results summary at end
- **Animation**: Framer Motion for card flips

## UI/UX Design Plan

### Layout Structure
```
┌─────────────────────────────────────┐
│              Header                 │
│          Kanji Trainer              │
├─────────────────────────────────────┤
│                                     │
│            Main Content             │
│         (Route-based views)         │
│                                     │
├─────────────────────────────────────┤
│            Navigation               │
│    [Level] [Write] [Flashcards]     │
└─────────────────────────────────────┘
```

### Color Scheme
- **Primary**: Indigo (Japanese aesthetic)
- **Secondary**: Red (traditional Japanese)
- **Background**: Light gray/white
- **Accent**: Gold for success states
- **Text**: Dark gray for readability

### Typography
- **Headers**: Noto Sans JP for Japanese characters
- **Body**: Inter for English text
- **Kanji Display**: Large serif font (40-60px)

## Development Phases (With Verification)

### Phase 1: Foundation & Setup (Days 1-3)
**Implementation:**
- Project initialization: `npm create vite@latest kanji-trainer -- --template react-ts`
- Install and configure all dependencies
- Setup ESLint, Prettier, TypeScript strict mode
- Basic routing with React Router DOM
- Error boundaries and loading states
- Zustand store setup

**Verification Steps:**
- [ ] `npm run build` succeeds
- [ ] `npm run lint` passes
- [ ] `npm run type-check` passes  
- [ ] All routes render without errors
- [ ] Error boundaries catch and display errors
- [ ] Unit tests for store (80%+ coverage)

### Phase 2: Data Layer & Level Selection (Days 4-6)
**Implementation:**
- Kanji data integration (API + fallback)
- Level selector component
- Data loading with React Query
- LocalStorage persistence
- Loading states and error handling

**Verification Steps:**
- [ ] API integration works with fallback
- [ ] Level selection persists across sessions
- [ ] Error states display properly
- [ ] Component tests for LevelSelector
- [ ] Integration tests for data flow
- [ ] Manual testing on mobile devices

### Phase 3: Flashcards Module (Days 7-10)
**Implementation:**
- Flashcard component system
- Card flip animations (Framer Motion)
- Deck management logic
- Results tracking and persistence

**Verification Steps:**
- [ ] Smooth animations on all devices
- [ ] Deck logic works correctly (20 random cards)
- [ ] Results persist and display accurately
- [ ] Accessibility testing (keyboard navigation)
- [ ] Component and integration tests
- [ ] Performance testing (animation smoothness)

### Phase 4: Drawing Module (Days 11-16)
**Implementation:**
- Konva.js canvas setup
- Drawing functionality with touch/mouse support
- HanziWriter integration (separate canvas)
- Stroke validation algorithms
- Feedback system implementation

**Verification Steps:**
- [ ] Drawing works on desktop and mobile
- [ ] Stroke counting validation accurate
- [ ] HanziWriter displays correctly
- [ ] Canvas performance acceptable
- [ ] Touch gestures work properly
- [ ] Comprehensive testing of validation logic

### Phase 5: Integration & Polish (Days 17-21)
**Implementation:**
- Route integration and navigation
- UI/UX improvements
- Performance optimization
- Mobile responsiveness refinement
- Accessibility improvements

**Verification Steps:**
- [ ] E2E tests pass (Playwright)
- [ ] Performance audit (Lighthouse score >90)
- [ ] Accessibility audit (WCAG compliance)
- [ ] Cross-browser testing
- [ ] User acceptance testing
- [ ] Final build verification

### Phase 6: Quality Assurance (Days 22-24)
**Implementation:**
- Code review and refactoring
- Documentation updates
- Performance monitoring setup
- Deployment preparation

**Verification Steps:**
- [ ] Code coverage >85%
- [ ] No ESLint warnings
- [ ] TypeScript strict mode passes
- [ ] Bundle size analysis and optimization
- [ ] Security audit
- [ ] Final manual testing checklist

## Technical Considerations

### Performance
- Lazy loading of kanji data by level
- Canvas optimization for smooth drawing
- Debounced recognition to avoid excessive API calls

### Accessibility
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support
- Touch/mouse input handling

### Mobile Optimization
- Touch-friendly drawing canvas
- Responsive grid layout
- Appropriate font sizes
- Gesture support for card navigation

## Future Enhancements
- User accounts and progress tracking
- Spaced repetition system (SRS)
- Audio pronunciation
- Kanji composition breakdown
- Achievement system
- Offline mode with service workers

## Estimated Timeline
- **Setup & Planning**: 3-4 days
- **Core Development**: 2-3 weeks
- **Testing & Polish**: 4-5 days
- **Total**: ~1 month for MVP

## Revised Setup Commands
```bash
# Project initialization
npm create vite@latest kanji-trainer -- --template react-ts
cd kanji-trainer

# Core dependencies
npm install react-router-dom zustand @tanstack/react-query
npm install tailwindcss framer-motion react-hot-toast
npm install konva react-konva hanzi-writer
npm install @headlessui/react @heroicons/react

# Development dependencies
npm install -D @types/react @types/react-dom
npm install -D eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser
npm install -D prettier eslint-config-prettier eslint-plugin-react-hooks
npm install -D vitest @testing-library/react @testing-library/jest-dom
npm install -D @testing-library/user-event jsdom
npm install -D husky lint-staged
npm install -D @playwright/test

# Setup pre-commit hooks
npx husky install
npx husky add .husky/pre-commit "npx lint-staged"

# Development server
npm run dev
```

## Package.json Scripts Addition
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "lint:fix": "eslint . --ext ts,tsx --fix",
    "type-check": "tsc --noEmit",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:e2e": "playwright test"
  }
}
```

## Critical Risk Mitigation

### 1. **Data Source Reliability**
- Primary: Kanji Alive API (free, reliable)
- Fallback: Curated JSON files (manual backup)
- Validation: Data structure verification on load

### 2. **Canvas Performance**
- Konva.js optimization for mobile
- Debounced drawing events
- Canvas size limitations
- Memory leak prevention

### 3. **State Management**
- Error boundaries at route level
- Offline state handling
- Progress persistence strategies
- Performance monitoring

### 4. **Testing Strategy**
- Unit tests: 85%+ coverage requirement
- Integration tests: Critical user flows
- E2E tests: Main app functionality
- Manual testing: Mobile devices, accessibility

This revised plan addresses the critical issues identified and provides a stable, achievable development path with proper verification at each phase.