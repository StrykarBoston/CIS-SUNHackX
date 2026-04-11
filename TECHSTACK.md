# Conflict Intelligence System (CIS) — Tech Stack

This document outlines the core technologies, APIs, and frameworks utilized to power the decentralized Multi-AI Agent Conflict Intelligence System.

## 1. Multi-Agent AI Backend (Python)
The intelligence system operates on a powerful backend utilizing LangChain-style sequential AI architectures.

* **FastAPI:** High-performance Python web framework responsible for driving the `main.py` core engine, exposing RESTful methods, and managing real-time data streaming.
* **WebSockets:** Bypasses standard HTTP request timeouts by establishing an open async loop, streaming live progress from each of the 5 agents directly to the UI.
* **Groq API Inference Engine:**
  * **Model:** `llama-3.1-8b-instant` / `llama-3.3-70b-versatile`
  * **Role:** Acts as the primary powerhouse resolving the vast arrays of systemic intelligence logic. Handles everything from Geocoding from text strings to full Macro-economic predictions.
  * *Anthropic API* acts as an intelligent failover/redundant mechanism.
* **Resend API SDK:** Hooked natively into the Python server to silently dispatch emails regarding the finalized Commander Brief. Used for real-time human alerting.

## 2. Frontend Environment (React)
* **React 19:** Building the responsive single-page application structure.
* **Vite (`@vitejs/plugin-react`):** Extremely fast build tool and dev server.
* **React-Leaflet:** The mapping engine that renders OpenStreetMap tiles on the Dashboard, utilizing dynamic geo-coordinate arrays passed back by the AI OSINT collector.

## 3. Styling & User Interface
* **Tailwind CSS (v4.x):** Utility-first CSS framework managing total layout grids and components natively globally in `%src/index.css%`. Extremely responsive layouts.
* **Theme System:** Fully operational global Light/Dark modes mapping Tailwind's `.dark` pseudo-classes utilizing dynamic gradient manipulations and CSS variable injection (`ThemeContext.jsx`).
* **Lucide SVGs:** Lightweight inline SVG structures for intelligence iconography (shield, chat bubbles, alert warnings, etc.).

## 4. Analytical Tools & Data Collectors
* **Wikipedia REST API:** Leveraged to dynamically harvest background intel, geography, and baseline historic context via automated backend scripts (`osint_tools.py`).
* **Reddit API (Pushshift / Public PRAW equivalents):** Automatically queries global geopolitics subreddits locked explicitly to a strict timestamp interval (`t=day`) to ensure 100% contemporary OSINT extraction.

## 5. Sentiment Analysis Engine
* **VADER Sentiment Analysis:** Lightweight, lexicon-based sentiment analyzer optimized for social media and conflict-related text. Provides compound sentiment scores ranging from -1 (very negative) to +1 (very positive).
* **TextBlob NLP Library:** Complementary sentiment analysis providing polarity and subjectivity scores. Combined with VADER for improved accuracy.
* **Conflict Keyword Modifiers:** Custom sentiment modifiers for conflict-specific terminology (war, casualties, ceasefire, humanitarian aid, etc.) that adjust sentiment scores based on severity.
* **Multi-Source Analysis:** Analyzes sentiment across all OSINT sources including news headlines, summaries, daily briefs, and agent reasoning outputs.
* **Real-Time SSE Streaming:** Sentiment analysis results are streamed to the frontend via Server-Sent Events immediately after OSINT collection completes. 

## 6. Architectural Paradigms
* **AI Pipelines:** A chain of specialized LLM instances where the output of Agent *N* directly informs the context array of Agent *N+1* (OSINT → Conflict Detection → Simulation Sandbox → Final Writer).
* **Decoupled Architecture:** A strictly separate Python Backend holding the AI capabilities and secret keys, exposing solely sanitized intelligence payload events to the React visual client layer.
