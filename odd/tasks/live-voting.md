# Live voting demo recovery plan

## Objective and scope

Deliver the full local live voting project: a NestJS HTTP/Socket.IO backend, a React/TypeScript frontend, root documentation and verification of both services. Preserve relevant user starter configuration. The user selected a local split: backend first (LV-01), then frontend and documentation (LV-02/LV-03). This task list covers the overall project, not just the first backend unit. No branches, staging, commits, pushes, remote operations, SDD phases or native reviews are authorized.

## Stable tasks and delivery boundaries

| ID    | Task                                                                                        | Status            | Evidence route                                                                                                                         |
| ----- | ------------------------------------------------------------------------------------------- | ----------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| LV-01 | Backend poll, presence, validated voting, reset, configuration, tests, backend instructions | Completed locally | `backend/src/voting/`, `backend/src/main.ts`, `backend/src/app.module.ts`, `backend/test/`, package/config files, backend README       |
| LV-02 | Frontend live results, connection/vote feedback, reset round handling                       | Completed locally | `frontend/src/`, `frontend/vite.config.ts`, package/lock files, HTML, `.env.example`; 32 frontend tests and real TypeScript/Vite build |
| LV-03 | Root docs and integrated demo verification                                                  | Completed locally | Root README/`.gitignore`, frontend README, this evidence document; both service check suites and local Vite HTTP/port smoke checks     |

Delivery is split into local behavior units with tests and instructions alongside each unit. No strict size cap or code golf. No commit identities exist because commits are not authorized. Delegated evidence is routed through this shared recovery document, not an assumed single-file implementation.

## Acceptance and checks

- Fixed Spanish question with React, Angular, Vue options; in-memory votes and one vote per live socket per round.
- HTTP and Socket.IO share one port and one FRONTEND_URL configuration.
- Connect sends current poll and broadcasts presence; disconnect removes eligibility, not tally.
- Invalid and duplicate votes return typed rejection acknowledgement and sender-only `vote:error`.
- Reset clears votes and eligibility, preserves active users, and broadcasts a new globally distinguishable round token.
- Service tests cover percentages, zero totals, malformed input, duplicates, disconnect and reset.
- Real running-server multi-client tests cover HTTP/connect snapshots, presence/broadcasts, rejections and reset eligibility.
- Inspect scripts, normalize formatting before final checks, then build, unit tests, e2e tests, check-only lint and formatting. Record exact commands/results below; do not claim browser verification.

TDD mode is unknown: no explicit TDD configuration was supplied or found in the inspected starter scripts/test configuration. Use ordinary tests and do not claim strict TDD.

## Backend observations and contract handoff

Implemented `VotingModule`, `VotingService`, `VotingGateway`, `VotingController` and exported DTO/event types. In-memory mutation is synchronous. Removed the unused starter hello-world files/tests and Observe placeholder wiring/dependency. Preserved the existing Nest/TypeScript/Vitest/Oxlint configuration and unrelated scripts, including the unused deploy script. Added Socket.IO packages, dotenv and a Socket.IO client dev dependency; regenerated the local lockfile. Frontend and root README were untouched at the LV-01 boundary; subsequent work is recorded below.

The starter uses NestJS 12, Vitest run scripts and check-only Oxlint (not mutating ESLint). CodeGraph has no index and directed filesystem fallback; existing test/config files were inspected directly. Explicit `@Inject` constructor tokens let the same backend run under the starter Vitest transform without depending on emitted decorator metadata. No Engram tools are exposed: discovery saves, session summary and full-document mirror are explicitly pending for project `websockets`.

### Exact frontend contract

Use HTTP and Socket.IO at `http://localhost:3000` by default, default namespace `/`, Socket.IO path `/socket.io`. HTTP/socket CORS share `FRONTEND_URL` (default `http://localhost:5173`); `PORT` defaults to `3000`. `dotenv/config` loads optional `backend/.env` when launched from `backend/`. Example contains no secrets.

`GET /api/poll` (200), `POST /api/poll/reset` (201, no body), and server event `vote:results` carry the same full snapshot:

```json
{
  "instanceId": "<server-uuid>",
  "round": "<server-uuid>:0",
  "revision": 0,
  "question": "¿Cuál es tu tecnología frontend favorita?",
  "options": [
    { "id": "react", "label": "React", "votes": 0, "percentage": 0 },
    { "id": "angular", "label": "Angular", "votes": 0, "percentage": 0 },
    { "id": "vue", "label": "Vue", "votes": 0, "percentage": 0 }
  ],
  "total": 0
}
```

- Client event `vote:cast`: exactly `{ "optionId": "react" }` (or `angular`/`vue`) and an acknowledgement callback.
- Accepted ack: `{ status: 'accepted', poll: PollSnapshot }`.
- Rejected ack and identical sender-only `vote:error`: `{ status: 'rejected', code: 'INVALID_PAYLOAD' | 'ALREADY_VOTED' | 'NOT_CONNECTED', message: string }`. Messages are English. Invalid and duplicate casts do not broadcast results or mutate revision.
- Server `users:count`: `{ "count": 2 }`; emitted on connect/disconnect, counts connections rather than unique people.
- `vote:results` is sent immediately on connect and broadcast on accepted votes/reset. Percentages are unrounded 0–100 numbers, all zero when total is zero.
- `instanceId` is a fresh UUID per service/server lifetime. Opaque `round` changes on every reset/restart but remains stable across ordinary votes. `revision` increments on accepted votes/reset, never presence, and is comparable only within one instance.
- Frontend must register listeners before connecting. The initial socket snapshot takes precedence over an in-flight initial HTTP response. Ignore lower revisions within the active instance, including delayed acks. On round change clear local voted state for ALL clients. Reconnect clears connection-local voted state; establish the instance from the new socket, never from a delayed old HTTP response.
- Reset preserves all active users and frees every live connection to vote again. Disconnect frees only that connection's eligibility, retaining its tally.

### Observed verification

Commands run from `backend/`; final formatting normalization precedes check-only verification.

| Command                                                                    | Observed result                                                                                                               |
| -------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `npx prettier --write "src/**/*.ts" "test/**/*.ts" README.md package.json` | Formatting normalized before checks                                                                                           |
| `npm run build`                                                            | Passed, Nest TypeScript build                                                                                                 |
| `npm test -- --run`                                                        | Passed: 1 file, 18 service tests                                                                                              |
| `npm run test:e2e -- --run`                                                | Passed: 1 file, 4 running-server tests                                                                                        |
| `npm run lint -- --no-fix`                                                 | Not supported: starter Oxlint rejects `--no-fix`; no source mutation                                                          |
| `npm run lint`                                                             | Passed with existing check-only `oxlint src/ test/` (no `--fix`); ESLint is not configured                                    |
| `npx prettier --check "src/**/*.ts" "test/**/*.ts" README.md package.json` | Passed                                                                                                                        |
| `npm audit --omit=dev`                                                     | Passed: 0 production vulnerabilities                                                                                          |
| `npm audit`                                                                | Reports 5 dev-tree vulnerabilities (2 low, 1 moderate, 2 high) through preserved `@nestjs/mau`; no force/breaking fix applied |

Runtime harness uses genuine HTTP and Socket.IO clients on ephemeral loopback ports, including polling and WebSocket transports. Four cases verify initial HTTP/connect equivalence and CORS, two-client results/presence/disconnect tally, malformed/duplicate ack plus sender-only errors, and reset broadcast/revision/eligibility for both clients. Clients and Nest applications are closed after each case. No browser verification or strict TDD claim.

Known risks: local Node 25.6.1 triggers starter Angular Devkit engine warnings (use a supported Node 24.15+ LTS version); Vitest reports a non-blocking Vite tsconfig-paths plugin deprecation. Demo reset is unauthenticated; reconnect permits another vote; state is process-local and lost on restart; CORS is not access control. Production concerns are outside this authorized unit.

Skill resolution: paths-injected `/Users/yoelmarain/.agents/skills/work-unit-commits/SKILL.md` loaded before task work; `/Users/yoelmarain/.config/opencode/skills/cognitive-doc-design/SKILL.md` loaded for English recovery/backend documentation. No orchestrated phases, reviews, child delegates, git mutations or remote execution/file transfer.

## Frontend and root documentation observations

The LV-02/LV-03 writer read this full handoff first and the backend event types before implementation. No CodeGraph index exists; the user explicitly directed filesystem fallback and no indexing. Skills were loaded from the exact injected paths below. Socket.IO lifecycle, Manager reconnection events, exact `off` references and timeout acknowledgement APIs were checked with Context7 (`/websites/socket_io_v4`, official client/event documentation).

### Delivery and document creation forecast

The authorized delivery remains two local behavior units: backend first, then frontend with tests and root instructions. The latter is a multi-file implementation, not a single-file assignment. The ~400-line heuristic is a review signal, not a minimum or hard cap: cohesive hook tests, accessible components and readable CSS/documentation exceed it without minification or omitted tests. No commits or publication were requested or created.

Documentation scope: create root `README.md` with the two-terminal quick start, supported Node 24.15+ LTS, optional environment defaults, architecture/contracts, seven-step implementation walkthrough, eight-step multi-tab demo, checks and limitations; replace frontend starter README with a concise root pointer; update this existing recovery document rather than inventing another task ledger. Root `.gitignore` protects dependencies/builds/dotenv secrets while retaining example files and leaving `.atl` untouched. This forecast describes the completed frontend/docs unit; it is not an orchestrated phase or a commit plan.

### Source route and behavior

- `frontend/src/App.tsx` and `components/`: Spanish responsive voting interface, accessible radios and labels, focus styling, live connection/errors/presence, vote feedback, total/percentage bars, reduced-motion support, public reset and explicit demo limitations. Selection is round-scoped, so another tab's reset visibly clears it.
- `frontend/src/hooks/usePoll.ts`: one owned Socket.IO lifecycle, exact socket/Manager cleanup and abort on unmount. HTTP initial state cannot supersede a socket snapshot. Revisions, retired server instances, connection generations and request tokens prevent stale results/HTTP/acks from regressing state or marking a new round voted. Every round clears local eligibility; reconnect waits for a fresh snapshot before voting.
- `frontend/src/services/` and `types/poll.ts`: typed HTTP/Socket.IO contracts, `autoConnect: false`, isolated Manager, connected gating, volatile emission and five-second acknowledgement timeout. Timeout feedback explicitly acknowledges uncertainty. Reset remains pending until its HTTP request settles, and delayed reset responses cannot overwrite later broadcasts or a new connection's poll.
- `frontend/vite.config.ts`, package/lock files, `.env.example`, `index.html`: Vitest/jsdom setup, client dependencies, environment-loaded strict development port and Spanish page metadata. Existing TypeScript/ESLint configuration and unrelated starter assets/configuration were retained. The existing entry point was only formatting-normalized.
- Root and frontend READMEs: commands and event shapes match the backend handoff; no browser or production-readiness claim. Backend source/configuration was not edited by LV-02/LV-03.

### Observed verification for LV-02/LV-03

Formatting normalization preceded the final code checks. Initial frontend lint found an unused placeholder argument in the action ref; its type was moved to the ref annotation, followed by successful final checks. No lint rule was disabled.

| Working directory | Exact command                                                                                                                                                                                         | Observed result                                                                                                              |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `frontend/`       | `npm install socket.io-client`                                                                                                                                                                        | Installed client; audit clean                                                                                                |
| `frontend/`       | `npm install -D vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event`                                                                                            | Installed test tools; audit clean                                                                                            |
| Root              | `backend/node_modules/.bin/prettier --write 'frontend/src/**/*.{ts,tsx,css}' frontend/vite.config.ts frontend/package.json frontend/index.html frontend/README.md README.md odd/tasks/live-voting.md` | Formatting normalized before final checks                                                                                    |
| `frontend/`       | `npm run build`                                                                                                                                                                                       | Passed: actual `tsc -b` plus Vite production build; 52 modules transformed                                                   |
| `frontend/`       | `npm run lint`                                                                                                                                                                                        | Passed: preserved check-only ESLint configuration                                                                            |
| `frontend/`       | `npm test -- --run`                                                                                                                                                                                   | Passed: 4 files, 32 tests (22 hook, 7 component, 2 HTTP service, 1 socket factory)                                           |
| `backend/`        | `npm run build`                                                                                                                                                                                       | Passed: Nest TypeScript build                                                                                                |
| `backend/`        | `npm test -- --run`                                                                                                                                                                                   | Passed: 1 file, 18 service tests                                                                                             |
| `backend/`        | `npm run test:e2e -- --run`                                                                                                                                                                           | Passed: 1 file, 4 actual running-server HTTP/Socket.IO tests                                                                 |
| `backend/`        | `npm run lint`                                                                                                                                                                                        | Passed: check-only Oxlint                                                                                                    |
| `backend/`        | `npx prettier --check 'src/**/*.ts' 'test/**/*.ts' README.md package.json`                                                                                                                            | Passed                                                                                                                       |
| `frontend/`       | `npm audit` and `npm audit --omit=dev`                                                                                                                                                                | Both passed: 0 vulnerabilities                                                                                               |
| `backend/`        | `npm audit`                                                                                                                                                                                           | Still reports 5 dev-tree vulnerabilities: 2 low, 1 moderate, 2 high through preserved `@nestjs/mau`; no breaking fix applied |
| `backend/`        | `npm audit --omit=dev`                                                                                                                                                                                | Passed: 0 production vulnerabilities                                                                                         |

Frontend tests explicitly exercise initial HTTP, listener-before-connect order, StrictMode teardown, live snapshots/presence, offline controls, pending and duplicate voting, accepted/rejected ack and sender-only errors, uncertain timeout, multi-client reset, successful reconnection eligibility, old connection/round acks, retired instances, stale revisions/reset HTTP, abort and HTTP failure recovery. The component layer checks accessible choices, percentages, disabled states and round-scoped selection. Mocked frontend tests are not browser networking evidence.

An additional real local Vite process smoke check used `node --input-type=module -e` with a `child_process.spawn` harness in `frontend/`: launched `node_modules/vite/bin/vite.js --host 127.0.0.1` with `VITE_PORT=5189`, fetched `http://127.0.0.1:5189/`, and verified the Spanish app HTML (HTTP 200). A second Vite process with the same configured port exited 1 with `Port 5189 is already in use` rather than auto-shifting. Both owned processes were terminated. This verifies environment/strict-port behavior and HTML serving, not rendered browser behavior. The backend runtime harness separately verifies actual live HTTP/socket boundaries for both clients.

Final authored frontend/root/recovery formatting command: `backend/node_modules/.bin/prettier --check 'frontend/src/**/*.{ts,tsx,css}' frontend/vite.config.ts frontend/package.json frontend/index.html frontend/README.md README.md odd/tasks/live-voting.md`. **Passed**: all matched files use Prettier code style. The recovery document was normalized and read back before delivery.

### Limitations and pending memory mirror

No browser tool is exposed; the eight-step multi-tab README flow remains a manual checklist. There is no authentication, persistence or production deployment. Reset is public, voting is connection-local rather than person-unique, and reconnect/restart semantics are intentional. Backend dev audit warnings and the non-blocking Vite tsconfig-paths deprecation remain. The local Node 25 runtime is not the recommended Node 24.15+ LTS prerequisite.

No Engram tools are available. Pending mirror for project `websockets`: save the frontend lifecycle/freshness design, the complete document content and completed local verification/session summary when memory tools become available. This document is the current source of truth; no memory save or sync is claimed.

Skill resolution: **paths-injected** `/Users/yoelmarain/.agents/skills/work-unit-commits/SKILL.md` and `/Users/yoelmarain/.config/opencode/skills/cognitive-doc-design/SKILL.md` were read before task work. No child delegates, git mutations, SDD or native review, remote execution or credential access occurred. A backend example dotenv read was blocked by runtime permissions and was not bypassed; documented defaults came from the authorized handoff instead.

## Rollback boundaries

- LV-01: remove the voting module/types/tests and restore only backend app wiring, starter tests, dependencies/lockfile and backend instructions changed by this unit. Do not remove the user starter directory or unrelated configuration. Preserve this recovery document as history.
- LV-02: revert `frontend/src/App.tsx`, `App.css`, `index.css`, entry-point formatting, new `components/`, `hooks/`, `services/`, `types/`, `test/`, `App.test.tsx`, plus `frontend/vite.config.ts`, `index.html`, package/lock files and `.env.example`. Preserve starter TypeScript/ESLint configuration and assets; do not undo the backend contract.
- LV-03: revert only root `README.md`, `.gitignore` and frontend README changes; preserve backend/frontend behavior units and this recovery history.

## Next step

### Parent closure evidence

- Parent spot check: `npm run test:e2e -- --run` in `backend/` passed all 4 actual-server tests.
- Independent functional verifier reran both builds, both linters and all test suites: 18 backend unit tests, 4 backend integration tests and 32 frontend tests passed (54 total). No functional mismatch was found within the inspected scope. Browser multi-tab verification and a fresh-install quick start remain manual.
- Native review mode is on (global). Assessment and selectorless preflight refused because `backend/` contains an independent nested Git repository that cannot enter the root review candidate. Preflight reported `mutation_outcome: not_started`; no review authority or approval exists. The existing Git structure was preserved. Functional verification does not replace native review approval.
- No commits, publication or remote operations occurred. Engram mirror and session summary remain unavailable/pending.

LV-01/LV-02/LV-03 are complete locally. Parent must read this document before reporting the full-project result. Optional next step: perform the manual multi-tab browser demonstration on a supported Node LTS runtime. Engram mirror remains pending until authorized memory tools are available. No commits/publication or remote operations are authorized.
