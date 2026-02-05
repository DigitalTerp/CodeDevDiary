# Code Dev Diary

Code Dev Diary is a simple **coding journal / CRUD application** built with **Next.js, TypeScript, and SCSS Modules**. It is designed specifically for **developers who are learning or improving their coding skills** and want a structured place to track what they work on each day.

Instead of using a traditional journal or notes app, Dev Diary allows users to record **coding-focused entries**, including written notes *and* actual **syntax / code snippets**, making it easier to reflect on progress and revisit past solutions.

---

## Why Code Dev Diary?

When learning to code, it’s common to:
- Forget how you solved a problem
- Lose useful snippets of code
- Jump between notebooks, docs, and note apps
- Lack a clear timeline of what you’ve learned

Dev Diary solves this by acting like a **developer-first journal**, combining written reflection with technical context.

---

## Core Features

- **User Authentication**
  - Email and password login
  - Entries are private and tied to the authenticated user

- **CRUD Functionality**
  - Create new diary entries
  - View individual entries
  - Edit existing entries
  - Delete entries when no longer needed

- **Entry Structure**
  Each Dev Diary entry includes:
  - Date
  - Title
  - Problem (New!)
  - Technologies used (CSS, HTML, JavaScript, React, Firebase, etc.)
  - Notes / explanations
  - Code / syntax block for pasting real code

- **Browsing & Organization**
  - View recent entries
  - Browse all entries
  - Search entries by title or notes
  - Quickly jump to view or edit an entry

---

## Tech Stack

- **Next.js (App Router)**
- **TypeScript**
- **SCSS Modules**
- **Firebase** (Authentication & Firestore)

---

## Design Philosophy

Code Dev Diary is intentionally:
- **Minimal** – no unnecessary features or distractions
- **Beginner-friendly** – easy to understand and extend
- **Code-first** – syntax is treated as a first-class part of each entry
- **Journal-like** – encourages reflection, not just storage

The UI leans toward a clean, developer-inspired aesthetic while keeping the focus on content and readability.

---

## Intended Audience

This project is ideal for:
- New developers learning web development
- Students in coding bootcamps
- Anyone who wants a personal coding journal

It can also serve as a learning project for developers who want to explore:
- CRUD patterns
- Authentication
- Firestore data modeling
- Next.js App Router structure


---

## Future Improvements 

- Tag or tech-based filtering
- Syntax highlighting themes
- Export entries to Markdown
- Entry grouping by date or topic

---

Code Dev Diary is meant to grow alongside the developer using it — a simple tool that documents progress, mistakes, and wins along the coding journey.

🔄 Recent Updates

# 02/05/2026
- UI & Form Enhancements
Over the last several days, the application has received a series of focused UI and UX improvements aimed at clarity, consistency, and responsiveness across devices.
Refined Entries and Browse Entries layouts with smaller, more readable cards
Unified visual styling across cards, buttons, and navigation components
Improved mobile responsiveness, including centered card content and overflow fixes
Updated action buttons with symbol-based indicators for clearer visual hierarchy
Enhanced navigation bar and drawer with consistent button treatments and improved usability
Simplified the drawer experience by replacing search inputs with a dedicated Browse Entries action
Expanded entry forms to support structured fields:
Title
Problem description
Technology used
Notes
Syntax / code blocks
Improved date handling to include time context where applicable
General UI polish, spacing adjustments, and accessibility-focused refinements
These updates bring the interface closer to a cohesive, developer-focused journaling experience while maintaining a clean, distraction-free workflow.