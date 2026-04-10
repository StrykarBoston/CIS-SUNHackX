# Conflict Intelligence System (CIS) — Tech Stack

This document outlines the core technologies, APIs, architectures, and libraries utilized to build and run the autonomous Conflict Intelligence System and its embedded features.

## 1. Core Framework & Environment
* **React 19:** The foundational UI library used to build the single-page application structure.
* **Vite (`@vitejs/plugin-react`):** Extremely fast build tool and development server used for the React environment.
* **Node.js:** JavaScript runtime required for Vite and package management.
* **NPM:** Dependency package manager.

## 2. Styling & UI/UX
* **Tailwind CSS (v4.2.2):** Utility-first CSS framework used for all layout, spacing, and responsive design. 
  * Leverages `@apply` directives seamlessly inside `index.css`.
  * Integrates full support for both native `light` and `dark` modes utilizing the `.dark` class strategy.
* **Custom CSS & Animations:** 
  * Complex keyframes (like `pulse-ring` and `slideUpFade`) embedded either inside functional components via inline style injections or globally in `%src/index.css%` to manage premium glassmorphic gradients.
* **Lucide SVGs:** Lightweight inline SVG structures for iconography (shield, chat bubbles, alert warnings, etc.).

## 3. Application State & Context Management
* **React Hooks Matrix:** Heavy reliance on React's functional lifecycle (`useState`, `useEffect`, `useRef`, `useCallback`) inside the primary `App.jsx` router.
* **Context API (`ThemeContext.jsx`):** Manages the global visual mode toggles (Light/Dark themes) and handles localized `localStorage` preservation.

## 4. Artificial Intelligence & LLM Infrastructure
The intelligence system operates via a dual-brain architecture utilizing specific frontier LLMs for specialized tasks.

* **Groq API Inference Engine:**
  * **Model:** `llama-3.3-70b-versatile`
  * **Role:** The core processing brain. It handles the heavy autonomous lifting for the 5-Agent sequential pipeline (OSINT Collector → Conflict Analyst → Scenario Designer → Humanitarian Analyst → Commander Briefs). Runs exceedingly fast, returning highly complex `json_object` configurations securely.
* **Anthropic API (Claude):**
  * **Model:** `claude-3-5-sonnet-20241022`
  * **Role:** The natural language processing engine powering **ARIA** (Autonomous Response & Intelligence Assistant). Serves as an integrated context-aware system chatbot capable of understanding ongoing pipeline memory arrays.

## 5. OSINT Data Aggregation Tools (`osintTools.js`)
External APIs connected sequentially into the generation pipeline:
* **Wikipedia REST API:** Leveraged to dynamically pull geographic, historical, and conflict-oriented contextual baselines corresponding to users' query terms.
* **Reddit API (Public endpoints):** Harvests the latest "hot" threads dynamically mapped from `r/worldnews` and queries them for real-time sentiment extraction.

## 6. System Architecture Map
* **Monolithic SPA** architecture routing exclusively from `App.jsx`.
* **State Lifter Integration:** The `currentBrief` state tree resides globally and acts as the "payload pipeline," cascading downwards into distinct UI modules (`SimulationLab.jsx`, `Dashboard.jsx`, `AlertCenter.jsx`, `ARIAChatbot.jsx`) after Generation Agents terminate.

## 7. Version Control & Management
* **Git:** Repository version control.
* **TypeScript Settings:** Basic configuration rules implemented inside `tsconfig.json` mappings for build processing.
