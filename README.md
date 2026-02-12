# Live Match Center

A real-time football match center application built with React, TypeScript, and Socket.IO.

## Features

- **Live Match Dashboard**: Real-time scores and status updates for all matches.
- **Match Detail View**: In-depth view with timeline, statistics, and live chat.
- **Real-time Chat**: Join match-specific chat rooms with typing indicators and users list.
- **Live Updates**: Instant updates for scores, match events (goals, cards), and statistics.

## Tech Stack

- **Frontend**: React (Vite), TypeScript
- **Styling**: TailwindCSS
- **Real-time**: Socket.IO Client
- **Routing**: React Router DOM
- **HTTP Client**: Axios

## Setup Instructions

1.  **Install dependencies**:
    ```bash
    npm install
    ```

2.  **Run development server**:
    ```bash
    npm run dev
    ```

3.  **Build for production**:
    ```bash
    npm run build
    ```

## Architecture Decisions

-   **Socket Management**: Used a singleton pattern for the Socket.IO connection (`src/api/socket.ts`) and exposed it via a custom hook `useSocket` to ensure a single active connection across the app while allowing components to react to connection state changes.
-   **State Management**: Kept state local to components or pages (Dashboard, MatchDetail) to avoid unnecessary complexity of global state libraries like Redux, as the app's scope is focused and discrete.
-   **Type Safety**: Comprehensive TypeScript definitions for domain entities (`Match`, `Event`, `Stats`, `Chat`) to ensure reliability.
-   **Component Structure**:
    -   `Dashboard`: Handles the list of matches and global socket listeners for scores.
    -   `MatchDetail`: Handles specific match data, utilizing sub-components (`Timeline`, `Statistics`, `Chat`) for organized code.

## Trade-offs

-   **Initial Data Load**: We assume the REST API provides the initial state. For `MatchDetail`, if the implementation of the backend splits events/stats into separate endpoints, we would need additional API calls. Currently, we fetch the match object and rely on socket updates for live progression.
-   **Chat Persistence**: Chat history is ephemeral in the current client-side implementation (stored in component state). A persistent solution would require fetching chat history from the backend upon joining.

## Assumptions

-   The backend provides `shortName` for teams.
-   Socket events strictly follow the naming convention: `score_update`, `match_event`, `stats_update`, `chat_message`.
-   `match.minute` is updated via socket or inferred from start time (simulated here via simple display).

