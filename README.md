# Simple live voting

A beginner example with React, NestJS and Socket.IO. Choose React, Angular or Vue, vote as often as you like, and watch results update in every connected tab. **Reset is public** and clears all counts and selections. Counts stay in server memory only and disappear when the backend restarts.

## Run locally

Use Node.js 24.15+ LTS and npm. Open two terminals from the repository root:

```sh
# Terminal 1
cd backend
npm ci
npm run start:dev
```

```sh
# Terminal 2
cd frontend
npm ci
npm run dev
```

Open **http://localhost:5173**. Vite forwards `/api` and `/socket.io` to the backend at `http://localhost:3000`. Reset uses native `fetch` over HTTP; initial state, votes and live results use Socket.IO. There is no initial HTTP poll fetch.

Defaults work without environment files. Optional exported settings:

| Service  | Variable          | Default                 | Purpose                              |
| -------- | ----------------- | ----------------------- | ------------------------------------ |
| Backend  | `PORT`            | `3000`                  | Socket.IO and health port            |
| Backend  | `FRONTEND_URL`    | `http://localhost:5173` | Allowed browser origin               |
| Frontend | `VITE_PORT`       | `5173`                  | Fixed Vite development port          |
| Frontend | `VITE_SOCKET_URL` | Page origin             | Optional direct Socket.IO server URL |

If the frontend port changes, update `FRONTEND_URL` too. If the backend port changes, update both Vite proxy targets. `VITE_SOCKET_URL` changes only the socket destination; reset always uses the page origin's `/api` proxy. Frontend variables are public build-time values, not secrets. Optional backend `.env` loading is retained; existing environment examples were not inspected or changed because of the prior permission boundary. `POLL_DATA_FILE` and `VITE_API_URL` are no longer used, even if old local examples contain them.

## Try it in two tabs

1. Open two tabs and wait for **Conectado** and the poll choices.
2. Select React in the first tab and click **Enviar mi voto** twice. Both tabs show two votes.
3. Vote for Vue in the second tab. Both tabs show three votes and updated percentages.
4. Click **Reiniciar demo** in either tab. Both counts and both selections clear.
5. Select options without voting, then reset again while the tally is zero. Selections still clear in both tabs.
6. Stop the backend. Offline vote/reset actions are disabled. Restart it: tabs reconnect and receive a fresh empty snapshot.

This is a manual browser checklist, not a claim of completed browser verification.

## Follow the event flow

Socket.IO is **not native WebSocket**. It supplies named events, automatic reconnection and a protocol of its own; its transport can be HTTP long-polling or WebSocket. A native `WebSocket` client cannot replace `socket.io-client` here.

1. `VotingService` owns three in-memory counts and produces a snapshot containing the question, choices, counts, percentages and total.
2. `VotingGateway` sends `vote:results` to each new connection. The React hook registers listeners before connecting, so it receives that initial snapshot.
3. The form emits `vote:cast` with `{ optionId: 'react' }`. The service validates the payload and increments that choice. There is no one-vote restriction or acknowledgement/pending state.
4. The gateway broadcasts `vote:results` to everyone, including the sender. React replaces the displayed snapshot.
5. Invalid input produces `vote:error` only for the sender and does not change the tally.
6. The reset button calls `usePoll.reset()`, which sends native `fetch('/api/poll/reset', { method: 'POST' })`. `VotingController` calls `VotingService.reset()` and then `VotingGateway.broadcastReset(snapshot)`. The gateway broadcasts `poll:reset` to **every** client, including when counts were already zero. That socket event updates counts and clears selections; the HTTP 204 response never updates the UI independently. Non-success responses and network failures show a basic error. No reset token or revision is needed.
7. On disconnect, controls are disabled. On reconnect, the server sends the current snapshot. On unmount, the hook removes its exact listeners and disconnects its owned socket.

| Direction                                                  | Event          | Data                                          |
| ---------------------------------------------------------- | -------------- | --------------------------------------------- |
| Server → newly connected client / all clients after a vote | `vote:results` | Full poll snapshot                            |
| Client → server                                            | `vote:cast`    | `{ optionId: 'react' \| 'angular' \| 'vue' }` |
| Server → all clients after reset                           | `poll:reset`   | Full zero-count snapshot                      |
| Server → invalid vote sender                               | `vote:error`   | `{ message: 'Choose a valid option.' }`       |

The snapshot has only `question`, `options` and `total`. Each option has `id`, `label`, `votes` and `percentage`; percentages are zero for an empty poll. TypeScript contracts live in `backend/src/voting/voting.types.ts` and `frontend/src/types/poll.ts`. HTTP routes are `POST /api/poll/reset` (204 after mutation/broadcast) and `GET /health`, returning `{ status: 'ok' }` for readiness. `GET /api/poll` is absent, and there is no client-to-server socket reset event.

## Containers

With Docker Engine and Compose installed, run from the root:

```sh
docker compose up --build -d
docker compose ps
docker compose logs -f backend frontend
```

Open **http://localhost:8080**. Nginx serves the frontend and forwards `/api/` for HTTP reset and `/socket.io/` for HTTP polling and WebSocket upgrades. The backend is internal on port 3000 and its `/health` check gates frontend startup. Images use Node 24 LTS; both runtime services are non-root. The frontend has a read-only filesystem with writable `/tmp`.

```sh
docker compose restart backend # Counts disappear; clients reconnect.
docker compose down            # Stops the stack without deleting old volumes.
```

There is no poll data mount or persistence setting. Existing data directories and old volumes are preserved but unused; do not delete them as part of this simplification. Export `APP_PORT=8081` to change the published port. For a non-local browser origin, export the matching `FRONTEND_URL`. CORS is not authentication. `vite preview` is only a static preview, not the production Socket.IO proxy.

## Checks

Run these in each package directory:

| Backend                     | Frontend            |
| --------------------------- | ------------------- |
| `npm test -- --run`         | `npm test -- --run` |
| `npm run test:e2e -- --run` | —                   |
| `npm run build`             | `npm run build`     |
| `npm run lint`              | `npm run lint`      |

Backend e2e tests launch actual servers with multiple Socket.IO clients, cover both transports, repeated votes, invalid input, reset (including zero counts), reconnect/restart and cleanup. Frontend tests cover listener ownership, snapshots, errors, offline actions, repeatable submission and reset selection. They use mocked sockets and do not prove browser networking. TDD mode is unknown; ordinary behavioral tests are used.

Use the installed `backend/node_modules/.bin/prettier` to normalize only files you author, then run `--check` on the same supported files before final verification. Exact current commands and results are recorded in [simple voting tasks](odd/tasks/simple-voting.md). The [live voting](odd/tasks/live-voting.md) and [Docker/persistence](odd/tasks/docker-voting.md) records describe earlier versions, not the current contract.

## Demo limits

This is not a secure election system. Anyone connected can vote repeatedly or reset the poll. There are no accounts, persistent storage, guaranteed event delivery across disconnection, or shared state across backend processes. Keep one backend instance for this demo. Previously reported developer dependency warnings were not addressed by dependency upgrades. No production-readiness, container runtime revalidation or native review approval is implied by these instructions.
