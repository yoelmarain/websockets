# Simple voting frontend

React, TypeScript, Vite and Socket.IO Client with the existing layout and plain CSS. Choose an option, vote repeatedly, see live results, or reset every connected client's counts and selections.

## Run

Use Node.js 24.15+ LTS. From `frontend/`:

```sh
npm ci
npm run dev
```

Open `http://localhost:5173` with the backend running on port 3000. Vite forwards `/api` for HTTP reset and `/socket.io` for HTTP polling and WebSocket upgrades. The socket defaults to the page origin; optional `VITE_SOCKET_URL` selects another socket server and `VITE_PORT` selects a fixed development port. Reset always uses the page origin's API proxy; update both proxy targets if the backend port changes. The old `VITE_API_URL` setting is unused. Initial poll state is fetched only through the socket.

## Read the flow

`usePoll` creates one owned socket, installs listeners before connecting, and replaces the displayed snapshot on `vote:results`. A `poll:reset` snapshot also clears selection, without tokens or derived round detection. `vote:error` displays the server's validation message. Connect/disconnect/error feedback is visible; vote/reset controls are disabled offline. Cleanup removes exact listener references and disconnects the socket, including React StrictMode replay.

The reset button calls `reset()`, which uses native `fetch('/api/poll/reset', { method: 'POST' })` and checks `response.ok`. The backend controller resets memory, then its gateway broadcasts `poll:reset` to all clients. Only that socket snapshot changes displayed counts and selections, not the HTTP response. Network failures or non-success HTTP responses display a basic reset error without clearing state.

There is no pending acknowledgement, timeout, vote restriction, presence counter or HTTP fallback. Socket.IO is not native WebSocket: use the matching client library. See the [root README](../README.md) for the event contract, two-tab walkthrough and containers. Nginx serves the production frontend and forwards `/api/` and `/socket.io/`; `vite preview` alone does not provide those proxies.

## Verify

```sh
npm test -- --run
npm run build
npm run lint
```

Vitest/React Testing Library tests mock the socket boundary; they verify updates, errors, reset selection, repeatable voting, offline controls and listener cleanup, not browser networking. Counts are held only by the backend and disappear on its restart. Current evidence: [simple voting tasks](../odd/tasks/simple-voting.md).
