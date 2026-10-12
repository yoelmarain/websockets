# Simple voting backend

NestJS and Socket.IO keep a three-choice poll in memory. Repeated votes are allowed; public reset clears the tally for everyone. Restarting the process starts at zero. No files are read or written for poll storage.

## Run

Use Node.js 24.15+ LTS. From `backend/`:

```sh
npm ci
npm run start:dev
```

For compiled execution: `npm run build`, then `node dist/main.js`. `PORT` defaults to `3000`; `FRONTEND_URL` defaults to `http://localhost:5173`. Optional `.env` loading is retained. The existing environment example remains untouched because of the prior permission boundary; any old `POLL_DATA_FILE` value is ignored.

## Read the code

- `voting.service.ts`: validates exactly one `optionId` field, increments in-memory counts, calculates percentages and resets counts.
- `voting.gateway.ts`: sends the initial snapshot, accepts `vote:cast`, broadcasts successful results and reset snapshots, and emits invalid-vote errors only to the sender. It has no client-to-server reset subscription.
- `voting.controller.ts`: `POST /api/poll/reset` calls the in-memory service reset, then the gateway broadcasts `poll:reset` to all clients. HTTP returns 204 with no snapshot body; socket notification is the authoritative UI update, even for an already-zero tally.
- `voting.types.ts`: small event and snapshot contract, without acknowledgements, presence, voting eligibility or revision tokens.
- `health.controller.ts`: `GET /health` returns `{ status: 'ok' }`. Initial poll state stays socket-only; `GET /api/poll` does not exist.

Socket.IO uses namespace `/` and path `/socket.io`. It is an event protocol over HTTP polling/WebSocket, not a native WebSocket API. Clients receive `vote:results` on connect and after votes, and `poll:reset` with a zero snapshot after every reset (even if already zero). The latter clears selections in all clients.

## Verify

```sh
npm test -- --run
npm run test:e2e -- --run
npm run build
npm run lint
```

Lint is check-only Oxlint. E2e tests create actual Nest servers on ephemeral loopback ports and multiple Socket.IO clients; owned clients and servers are closed after each case. No storage test touches existing data. Use installed Prettier for authored files before final verification. Exact evidence lives in [simple voting tasks](../odd/tasks/simple-voting.md).

## Containers and limits

See the [root walkthrough](../README.md). Compose checks `/health`, uses an internal backend port and forwards HTTP reset and Socket.IO through the frontend. The runtime image runs `node dist/main.js` as non-root with no poll data directory/mount requirement. Existing data and volumes remain untouched but unused. Counts are process-local; do not scale instances expecting a shared tally. Reset is unauthenticated and CORS is not access control.
