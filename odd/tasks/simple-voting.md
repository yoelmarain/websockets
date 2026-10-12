# Simple HTTP and Socket.IO voting

Keep the beginner-friendly demo with **HTTP reset and Socket.IO votes/results**. The accepted scope correction restores only native `fetch` POST `/api/poll/reset`, not an initial HTTP poll fetch or advanced state. Keep in-memory counts, repeatable votes, basic validation and socket snapshots. T1/T2 below are historical completed work; their socket-only reset and proxy claims are superseded by T3.

## Authorization and current boundary

- Authorized implementation workspace: `/Users/yoelmarain/Proyectos/websockets`.
- The initial invocation created and read back this ledger only; the earlier implementation authorized T1/T2. The current invocation authorizes the accepted T3 correction and required local verification, using delegated preparation and one direct writer. No SDD or child delegation is used.
- Subsequent implementation must preserve unrelated user work and existing Git structure, including the nested backend repository recorded in the earlier tasks.
- No branches, staging, commits, pushes, PR planning or creation are authorized under the tool policy. Commit evidence is **pending authorization**, not a completion prerequisite that grants permission to mutate Git.
- No remote execution, file transfer, credential inspection, authenticated-session inspection or reuse, installation, or child-agent launch is authorized here.
- Review is globally on, as read by the parent. This invocation performs no review assessment, preflight, approval, or other review lifecycle action. Historical review blockers are not current approval evidence.

### Preserved baseline

Read-only `git status --short` observed the following user state before document creation:

```text
 M README.md
?? .atl/
?? .gitignore
?? backend/
?? compose.yaml
?? frontend/
?? odd/
```

Preserve this state and all unrelated content; untracked does not mean disposable. Existing [live voting](live-voting.md) and [durable voting/Docker](docker-voting.md) records are historical context and must not be overwritten to imply this simplification is already delivered.

## Route and preparation

**Route: originally delegated preparation; now direct implementation, one writer. Trigger: two or more nontrivial files and documentation write preparation.** The change spans backend behavior/contracts/tests, frontend behavior/tests, and deployment/docs. No additional agents are launched; the parent owns final review.

CodeGraph previously failed because its index was missing; direct reads are explicitly permitted for this invocation. No index or tooling is installed. Both existing task documents were read before preparing this one, and an exact-name lookup confirmed that `simple-voting.md` did not exist.

TDD mode is **unknown from existing records**. Use ordinary tests and record actual outcomes; do not assert strict TDD or inherit old passing results as proof for new behavior. Inspect current scripts and source before implementation.

## Stable tasks

### T3 — Accepted HTTP reset correction (complete locally)

Route: delegated preparation from the parent, direct implementation by one writer; no child delegation or SDD. Trigger: two or more nontrivial files and documentation preparation. Before source edits, read the current gateway/service/module/contracts, actual-server tests, hook/tests/App, proxies, scripts and all three READMEs. CodeGraph previously failed and direct files are authorized. Both requested skills were loaded before preparation. TDD mode remains unknown; use ordinary behavioral checks.

- [x] Native `fetch` POST `/api/poll/reset` checks `response.ok`, handles network/HTTP failure visibly, and never updates poll state from its response.
- [x] HTTP controller resets in-memory counts and broadcasts `poll:reset` to all connected clients, including an already-zero tally. Remove client-to-server reset event/type/subscription; keep the frontend reset listener.
- [x] Preserve initial socket snapshot, repeatable votes, validation, cleanup, selection clearing and `GET /health`; `GET /api/poll` stays absent. No persistence, presence, tokens, timeouts or dependencies added.
- [x] Restore `/api` proxies in Vite and Nginx without changing Socket.IO upgrade routing; update the root/backend/frontend beginner walkthroughs.
- [x] Actual-server two-client HTTP reset tests and frontend fetch success/non-ok/network failure tests pass; normalize only authored supported files and run every required check with exact new evidence.

Initial reconciliation after cancelled dispatch (before continuation edits/checks): actual files already contained the HTTP controller (204), module registration, gateway broadcast method, native fetch reset with basic errors, removed client reset contracts/subscription, restored Vite/Nginx API proxies, and HTTP/backend/frontend tests. Those partial edits were preserved rather than reimplemented. At resumption the three READMEs still described the superseded socket reset, and no new T3 checks had been observed. The continuation then added a focused in-flight reset/disconnect test, corrected docs, normalized the explicit T3 file set, and verified locally as recorded below. Current authorization includes T3 only within the stated local boundary.

Authorization: local implementation and verification only; no install, remote operations, Git mutation, review lifecycle, repository restructuring, denied environment-example access, or data/volume changes. Existing nested Git review blocker is preserved. Historical T1/T2 results below are not T3 proof. Rollback boundary is only T3 edits to the controller, gateway/module/contracts, hook/App/tests, proxies, three READMEs and this ledger; preserve all other user state. Engram tools are unavailable; full-document mirror for project `websockets`, topic `odd/simple-voting/tasks`, remains pending.

### T3 observed verification and correction boundary

All commands below ran foreground after normalization in this continuation, with exit 0. No required check failed. Total: **39 passing tests**. Backend printed a non-failing `vite-tsconfig-paths` migration advisory; no dependency/configuration change was made for it.

| Directory   | Exact command                                                                    | Observed result                           |
| ----------- | -------------------------------------------------------------------------------- | ----------------------------------------- |
| `backend/`  | `npm test -- --run`                                                              | 1 file, 17 tests passed                   |
| `backend/`  | `npm run test:e2e -- --run`                                                      | 1 file, 6 actual-server tests passed      |
| `backend/`  | `npm run build`                                                                  | Nest build passed                         |
| `backend/`  | `npm run lint`                                                                   | Oxlint passed                             |
| `frontend/` | `npm test -- --run`                                                              | 3 files, 16 tests passed                  |
| `frontend/` | `npm run build`                                                                  | TypeScript/Vite build passed, 51 modules  |
| `frontend/` | `npm run lint`                                                                   | ESLint passed                             |
| Root        | `docker compose --env-file /dev/null -p websockets-simple-config config --quiet` | Exit 0, no output; static validation only |

Backend commands ran sequentially with `&&` in the listed order; frontend commands likewise. Runtime harness: actual Nest servers with two actual socket clients (polling and WebSocket) prove HTTP 204 reset broadcasts zero snapshots at nonzero and already-zero counts, future voting, initial snapshots, validation, repeated voting, reconnect/restart and cleanup. A packet-barrier test proves the removed client reset event does not mutate state. Frontend mocks prove POST URL/method, socket-only success updates, HTTP/network errors, selection clearing, offline controls, completion after disconnect without restoring stale state, reconnect and listener cleanup. No browser or container startup is claimed.

Preserved partial T3 files: `backend/src/voting/voting.controller.ts`, `voting.gateway.ts`, `voting.module.ts`, `voting.types.ts`, `backend/test/voting.e2e-spec.ts`, `frontend/src/hooks/usePoll.ts`, `usePoll.test.tsx`, `frontend/src/types/poll.ts`, `frontend/vite.config.ts`, `frontend/nginx.conf`. This continuation added the in-flight disconnect test and corrected root/backend/frontend READMEs plus this ledger. App button wiring was already correct and unchanged. No unrelated app/style, package/lockfile, Compose, Git, data, or volume changes were authored here. With no pre-dispatch immutable snapshot, exact dispatch churn cannot be reconstructed.

Exact T3 formatting commands from root (both passed before verification):

```sh
backend/node_modules/.bin/prettier --write backend/src/voting/voting.controller.ts backend/src/voting/voting.gateway.ts backend/src/voting/voting.module.ts backend/src/voting/voting.types.ts backend/test/voting.e2e-spec.ts frontend/src/hooks/usePoll.ts frontend/src/hooks/usePoll.test.tsx frontend/src/types/poll.ts frontend/vite.config.ts README.md backend/README.md frontend/README.md odd/tasks/simple-voting.md
backend/node_modules/.bin/prettier --check backend/src/voting/voting.controller.ts backend/src/voting/voting.gateway.ts backend/src/voting/voting.module.ts backend/src/voting/voting.types.ts backend/test/voting.e2e-spec.ts frontend/src/hooks/usePoll.ts frontend/src/hooks/usePoll.test.tsx frontend/src/types/poll.ts frontend/vite.config.ts README.md backend/README.md frontend/README.md odd/tasks/simple-voting.md
```

Nginx is not a supported Prettier format. After recording evidence, ledger-only normalization and the same full explicit check passed; the ledger was read back. Root `git diff --check` passed (tracked diff only), and status categories match the preserved baseline. Rollback is the coherent T3 HTTP reset behavior/tests/proxies/docs only, not historical T1/T2 simplification or unrelated user work. Commit identity is pending authorization; native review remains parent-owned and blocked historically, not approved.

| ID  | Coherent work unit                                             | Status                                               | Planned route                                                                                                               |
| --- | -------------------------------------------------------------- | ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| T1  | Socket-only poll behavior with matching backend/frontend tests | Complete locally                                     | Backend service/gateway/contracts/wiring and tests; frontend socket lifecycle, selection/results/disconnection UI and tests |
| T2  | Deployment and documentation consistency                       | Complete locally; runtime/browser checks not claimed | Compose, container/proxy/health configuration; root/service READMEs and this ledger; environment examples preserved         |

### T1 — Coherent socket-only behavior and tests

Keep a fixed poll with in-memory counts. Use Socket.IO for initial state, voting, live results, and reset. Remove file storage and storage-error handling, presence tracking/UI, connection eligibility and duplicate-vote restrictions, HTTP poll fetch/reset duplication, and obsolete instance/revision/request-token freshness defenses. Replace advanced tests for removed behavior with focused tests for the simplified contract; do not merely delete coverage.

Acceptance criteria:

- [x] Connecting clients receive an initial complete poll snapshot without an HTTP poll request.
- [x] A valid vote increments the selected count and broadcasts current results to all connected clients. Repeated valid votes from the same client remain accepted.
- [x] An invalid option is rejected with clear feedback, without changing counts or broadcasting a successful mutation.
- [x] Reset travels over the socket and clears counts **and local selections in every connected client**, including a peer that did not initiate reset. A dedicated `poll:reset` broadcast clears selection even at zero counts.
- [x] Removed persistence/presence/restriction/HTTP paths and their obsolete tests do not remain active. Restart starts a new in-memory tally; existing user data and volumes were not touched.
- [x] Socket listeners are registered before connection and removed with matching references during cleanup; owned connections are closed. Tests clean up clients and apps.
- [x] Disconnected UI gives simple visible feedback and disables vote/reset actions; reconnect uses a fresh initial socket snapshot. No advanced timeout/generation/revision state machine was introduced.
- [x] Unit/frontend tests and real-server multi-client tests cover initial state, repeated voting, invalid input, reset propagation and cleanup.

Rollback boundary: restore only T1-authored backend/frontend behavior, contracts, wiring and tests from the pre-task snapshot; preserve unrelated files, data, Git metadata, historical ledgers and T2 changes. Capture the exact changed-file boundary during implementation because the baseline includes untracked user work.

### T2 — Deployment and docs consistency

Keep local and container startup instructions aligned with the simplified behavior. Remove persistence settings/mount requirements and claims, presence/one-vote claims, and REST poll duplication from active configuration and documentation. Adapt readiness checks if their current HTTP poll endpoint disappears; a minimal health endpoint is not a duplicate poll API. Preserve required Socket.IO polling/WebSocket proxy routing and supported local workflow.

Acceptance criteria:

- [x] Compose and authored Docker/proxy/readiness configuration no longer depend on poll file storage or HTTP poll operations. `GET /health` supplies readiness. Existing ignore rules protect legacy user data; environment examples remain permission-bound and may contain unused old variables, explicitly explained in active docs.
- [x] Root and service documentation describes socket-only initial state, repeatable votes, public reset, disconnected feedback and process-local counts accurately, with a beginner-friendly walkthrough.
- [x] Instructions do not claim production security, persistence, unique-person voting, browser verification or review approval without evidence.
- [x] Verification records exact commands/results and limitations after formatting and both task units. Only static Compose checking was performed; no container startup or volume deletion occurred.

Rollback boundary: restore only T2-authored deployment/configuration and active documentation changes from the pre-task snapshot. Preserve T1 behavior, user data/volumes and historical evidence. Do not use volume deletion as rollback.

## Historical T1/T2 verification plan and evidence (not T3 proof)

Normalize authored supported files with the existing formatter **before final verification**; then run check-only formatting, builds, lint and tests. Inspect existing scripts first; use installed tooling without installing anything in this invocation.

| Working directory   | Required command/check                                                           | Current evidence                                                                                                           |
| ------------------- | -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `backend/`          | `npm test -- --run`                                                              | Passed: 1 file, 17 tests                                                                                                   |
| `frontend/`         | `npm test -- --run`                                                              | Passed: 3 files, 12 tests                                                                                                  |
| `backend/`          | `npm run test:e2e -- --run`                                                      | Passed: 1 file, 5 actual-server tests; loopback binding allowed                                                            |
| `backend/`          | `npm run build`                                                                  | Passed: Nest build                                                                                                         |
| `frontend/`         | `npm run build`                                                                  | Passed: TypeScript and Vite production build; 51 modules                                                                   |
| `backend/`          | `npm run lint`                                                                   | Passed: check-only Oxlint                                                                                                  |
| `frontend/`         | `npm run lint`                                                                   | Passed: ESLint                                                                                                             |
| Root/authored files | Installed Prettier normalization, then check-only formatting                     | Passed; exact commands below                                                                                               |
| Local runtime       | `npm run test:e2e -- --run` in `backend/`                                        | Multi-client initial snapshots, repeated votes, invalid input, reset at nonzero/zero, reconnect/restart and cleanup passed |
| Root                | `docker compose --env-file /dev/null -p websockets-simple-config config --quiet` | Passed: exit 0, no output; static validation only, no daemon/session inspection                                            |
| Root                | `git status --short` and `git diff --check`                                      | Status categories match preserved baseline; whitespace check passed for tracked diff, not proof for untracked files        |

The initial document-only invocation ran no tests. All results above were newly observed during implementation, after normalization. Backend commands ran foreground as `npm test -- --run && npm run test:e2e -- --run && npm run build && npm run lint`; frontend commands ran as `npm test -- --run && npm run build && npm run lint`. Both chains exited 0, with **34 tests passing total**. No required command failed. TDD source is the existing project records; mode remains unknown, with no strict TDD claim. Commit identities remain pending explicit authorization.

### Exact formatting commands

From the root, only the following authored supported files were normalized and checked:

```sh
backend/node_modules/.bin/prettier --write backend/src/config.ts backend/src/voting/health.controller.ts backend/src/voting/voting.service.ts backend/src/voting/voting.service.spec.ts backend/src/voting/voting.gateway.ts backend/src/voting/voting.module.ts backend/src/voting/voting.types.ts backend/test/voting.e2e-spec.ts frontend/src/App.tsx frontend/src/App.test.tsx frontend/src/components/Poll.tsx frontend/src/components/ConnectionStatus.tsx frontend/src/hooks/usePoll.ts frontend/src/hooks/usePoll.test.tsx frontend/src/types/poll.ts frontend/vite.config.ts compose.yaml README.md backend/README.md frontend/README.md odd/tasks/simple-voting.md
backend/node_modules/.bin/prettier --check backend/src/config.ts backend/src/voting/health.controller.ts backend/src/voting/voting.service.ts backend/src/voting/voting.service.spec.ts backend/src/voting/voting.gateway.ts backend/src/voting/voting.module.ts backend/src/voting/voting.types.ts backend/test/voting.e2e-spec.ts frontend/src/App.tsx frontend/src/App.test.tsx frontend/src/components/Poll.tsx frontend/src/components/ConnectionStatus.tsx frontend/src/hooks/usePoll.ts frontend/src/hooks/usePoll.test.tsx frontend/src/types/poll.ts frontend/vite.config.ts compose.yaml README.md backend/README.md frontend/README.md odd/tasks/simple-voting.md
```

Both passed. After recording results, only this ledger is normalized again with `backend/node_modules/.bin/prettier --write odd/tasks/simple-voting.md`, followed by the same explicit full-file `--check` command above. Dockerfile and Nginx configuration are not supported Prettier formats; static Compose validation does not prove those images build or proxy at runtime.

## Implementation evidence and authored paths

### T1 behavior boundary

- Updated `backend/src/voting/voting.service.ts`, `voting.gateway.ts`, `voting.types.ts`, `voting.module.ts`, and `backend/src/config.ts`: memory-only counts, basic payload validation, initial `vote:results`, repeatable vote broadcasts and explicit `poll:reset`. Handler returns are void; no acknowledgements are generated by the application.
- Deleted `backend/src/voting/poll.storage.ts`, `poll.storage.spec.ts`, and `voting.controller.ts`; removed the storage provider, HTTP poll/reset routes and advanced contract/state. Existing `backend/data/` was not inspected, written or deleted.
- Replaced `backend/src/voting/voting.service.spec.ts` and `backend/test/voting.e2e-spec.ts` with tests of the simplified behavior, rather than retaining obsolete persistence/restriction tests.
- Updated `frontend/src/hooks/usePoll.ts`, `hooks/usePoll.test.tsx`, `types/poll.ts`, `App.tsx`, `App.test.tsx`, `components/Poll.tsx`, and `components/ConnectionStatus.tsx`. Selection is simple hook state cleared directly by reset, not by derived tally changes. Exact socket listener references are cleaned up, including StrictMode replay. No CSS/layout rewrite was performed.
- Deleted `frontend/src/services/api.ts` and `api.test.ts`. The existing socket factory and its two tests remain unchanged and pass.

Runtime tests use actual Nest applications and both polling/WebSocket clients on ephemeral loopback ports. They establish event listeners before requests, compare both clients' snapshots, reject malformed/invalid votes sender-only, use a subsequent valid broadcast as a packet barrier to verify no invalid-success events, and assert reset broadcasts at zero/nonzero counts. Owned sockets remove listeners and disconnect; owned servers close. A restart proves fresh counts. Frontend hook tests prove two clients' selections clear on reset, including zero tally; component tests prove visible controls and offline disabling. No actual browser result is claimed.

### T2 deployment/docs boundary

- Added `backend/src/voting/health.controller.ts` and registered it in the module. Real-server checks prove `/health` is 200 and former `/api/poll` and `/api/poll/reset` are 404.
- Updated `compose.yaml` and `backend/Dockerfile`: removed storage variables/directory preparation/mount declarations; readiness now calls `/health`. No existing volume was accessed or deleted.
- Updated `frontend/vite.config.ts` and `frontend/nginx.conf`: removed `/api` proxies, preserved `/socket.io` polling/WebSocket routing.
- Updated root `README.md`, `backend/README.md`, `frontend/README.md`, and this ledger: simple English walkthrough, Socket.IO versus native WebSocket, repeatable votes, public reset and memory-only counts. Existing Spanish layout labels are retained; newly authored explanatory copy is English.
- Preserved `.gitignore` and `backend/.dockerignore` exclusions for old user data; preserved all environment examples and historical task records. No denied file was retried through another mechanism. Package files, lockfiles and Git metadata were untouched; builds regenerated ignored output only.

Source scans of backend/frontend source found no remaining storage provider, presence, acknowledgement, revision/generation/request-token, volatile/timeout or HTTP poll-client terms from the removed implementation.

## Workload and risks

Estimated authored additions plus deletions: **700–1100 lines**, including removal/replacement of advanced tests. This is a forecast, not measured churn. The approximately **400-line per-task guideline is advisory only**: never omit tests, minify code, compress documentation or split artificially to meet it. Keep the two stable coherent tasks and report honest overages. No PR planning or creation is part of this route.

An exact reduction/churn count is not claimed: no complete immutable pre-edit snapshot was captured, and much of the user baseline is untracked. Tests were replaced with focused coverage, not omitted to fit the forecast.

Key risks are accidentally retaining old storage/HTTP dependencies in readiness or docs, leaving clients' selections uncleared on peer reset, weakening cleanup while simplifying the hook, and treating old passing tests as new evidence. Existing task records also report a nested backend Git review blocker and previously blocked environment-example access; preserve both boundaries and do not bypass permissions. Removing persistence must not delete existing user files or volumes.

## Skill resolution and memory

**skill_resolution: paths-injected, loaded before work.**

- `/Users/yoelmarain/.config/opencode/skills/work-unit-commits/SKILL.md`
- `/Users/yoelmarain/.agents/skills/cognitive-doc-design/SKILL.md`

Artifacts use English. Apply coherent work-unit boundaries and keep tests/docs alongside behavior, but do not execute the skill's branch/commit/PR lifecycle: explicit authorization and tool policy take precedence.

Engram tools, including `mem_save`, are unavailable in this invocation. **Full-document mirror and read-back are pending** for project `websockets`, topic `odd/simple-voting/tasks`. This local file is the source of truth; no memory persistence or session summary is claimed.

## Historical T1/T2 independent verification (not T3 approval)

The parent reran `npm run test:e2e -- --run` in `backend/`: all 5 actual-server tests passed. An independent functional verifier reran `npm test -- --run && npm run build && npm run lint` in each package: backend 17 tests and frontend 12 tests passed, and both builds and lint checks passed. Static inspection found no requirement gaps in initial snapshots, repeatable votes, invalid-input rejection, reset propagation and selection clearing, connection cleanup, offline controls, or deployment routing. This is functional evidence, not native review approval.

Native `gentle-ai review assess --cwd /Users/yoelmarain/Proyectos/websockets --json` returned high/unassessable because the untracked `backend` directory contains an independent nested Git repository. Selectorless native review STATUS refused the same candidate before mutation (`invalid_request`, `mutation_outcome: not_started`). No START, approval, acknowledgement, Git restructuring, or review-mode change occurred. Native review remains unavailable for the current repository structure.

## Next step

T3 is complete locally with newly observed tests, builds, lint, formatting and static Compose validation; its HTTP reset scope supersedes historical T1/T2 reset/proxy evidence. Manual browser verification and container build/runtime revalidation remain unperformed. Native review is blocked by the existing nested Git structure, not approved; parent owns assessment. Environment examples and Engram mirror/read-back/session summary remain unavailable/pending. No installations, branches, staging, commits, pushes, PR actions, remote operations, credential/session inspection or user data deletion occurred.
