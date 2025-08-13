# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Structure

This is a React-based Kanji learning application built with TypeScript and Vite. The main application code is located in `kanji-trainer/`.

### Key Architecture Components

- **State Management**: Uses Zustand store (`src/store/appStore.ts`) with persistence for app-level state (selected JLPT level, current kanji)
- **Data Fetching**: TanStack Query for server state management and caching
- **Routing**: React Router with three main routes: level selection (`/`), writing practice (`/write`), and flashcards (`/flashcards`)
- **UI Components**: Component-based architecture with shared common components in `src/components/common/`
- **Kanji Data**: Static JSON files for each JLPT level (N1-N5) in `src/data/`

### Core Features

1. **Level Selection**: Choose JLPT level (N1-N5) 
2. **Writing Practice**: Interactive kanji writing with hanzi-writer integration
3. **Flashcards**: Spaced repetition study system

## Development Commands

All commands should be run from the `kanji-trainer/` directory:

```bash
# Development server
npm run dev

# Build for production
npm run build

# Type checking
npm run type-check

# Linting
npm run lint
npm run lint:fix

# Testing
npm run test
npm run test:ui
npm run test:coverage
npm run test:e2e

# Preview production build
npm run preview
```

## Key Technologies

- **Frontend**: React 19, TypeScript, Tailwind CSS 4
- **Build Tool**: Vite 7
- **State**: Zustand with persistence
- **Data Fetching**: TanStack Query
- **Animation**: Framer Motion
- **Kanji Writing**: hanzi-writer + react-konva
- **Testing**: Vitest + React Testing Library + Playwright
- **Routing**: React Router 7

## Data Structure

Kanji objects follow this interface (`src/types/index.ts`):
- `character`: The kanji character
- `level`: JLPT level (N1-N5)  
- `meanings`: Array of English meanings
- `readings`: Object with onyomi and kunyomi arrays
- `strokes`: Stroke count
- `frequency`: Usage frequency ranking
- use docker environment for testing instead of local one