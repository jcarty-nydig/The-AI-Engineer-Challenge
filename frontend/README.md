# Futuristic Chatbot Frontend

This is a client-side-only (SPA) chatbot application built with the latest Next.js and React, featuring a futuristic theme.

## Getting Started

### Prerequisites
- Node.js (18.x or later recommended)
- npm (comes with Node.js)

### Installation
1. Open a terminal in the `frontend` directory.
2. Install dependencies:
   ```bash
   npm install
   ```

### Running the Application
Start the development server:
```bash
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

### Build for Production
To build the app for production:
```bash
npm run build
npm start
```

## Features
- Single Page Application (SPA) — no SSR
- Modern, futuristic UI
- Chat interface with scrollable history and input field

## API Connection
This frontend expects a backend API at `/api/chat` that accepts POST requests with `{ message: string }` and returns `{ response: string }`.

---

For more details, see the API folder in this project.

