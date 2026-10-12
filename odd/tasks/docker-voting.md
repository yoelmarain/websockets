# Durable voting and Docker delivery

## Objective and authorized boundary

Refactor the local voting demo to persist poll counts and run separate backend and frontend Docker containers with a data volume. Deliver **DV-01 backend persistence first**; Docker is the next coherent unit. Preserve existing user files and the nested backend Git repository. Baseline: [live voting recovery](live-voting.md).

No Git mutations, commits, pushes, remote execution, credential access, SDD phases, native reviews, or child delegates are authorized. Existing Spanish UI remains unchanged; new artifacts use English. Engram tools are unavailable: discovery saves, session summary, and a full-document mirror for project `websockets` are pending, not claimed.

## Stable tasks

| ID    | Scope                                                                                   | Status                                         | Acceptance checks                                                                                                                                                                                                          |
| ----- | --------------------------------------------------------------------------------------- | ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| DV-01 | JSON count storage, backend integration, failure safety, tests and backend instructions | Completed locally; environment example blocked | Restore counts on startup; missing file starts at zero; corrupt data fails without overwrite; atomic save before state changes/ack/broadcast; isolated unit and real restart tests; build, tests, lint and formatting pass |
| DV-02 | Backend/frontend containers, Compose data volume and frontend routing                   | Completed locally                              | Separate containers; durable writable volume mapped to `POLL_DATA_FILE`; browser routing reaches REST and Socket.IO; frontend maps storage rejection; preserve local workflow                                              |
| DV-03 | Root docs and integrated verification                                                   | Completed locally; browser pass not claimed    | Document local/container startup and reset semantics; verify container restart persistence and routing; record exact observed commands and limitations                                                                     |

## Routes, preparation and forecast

The delegated request triggers multi-file implementation and documentation write preparation, not a single-file assignment. Routes: backend storage/service/controller/gateway/types/config, isolated tests, backend README/environment example, root ignore rules, and this shared evidence document. No additional agents are launched. Read the baseline and backend scripts/source before implementation; create and read back this document before source writes.

Chosen delivery route: three coherent local behavior units with tests/docs alongside behavior. Advisory forecast: DV-01 may exceed the approximately 400-line review heuristic once failure and restart tests are included. That is a review signal, not a strict cap: do not compress readable code or omit tests to fit. No commits are authorized, so no commit identities exist. TDD mode is unknown without explicit configuration; use ordinary testing, not a strict TDD claim.

## Persistence decisions

- Keep business logic in `VotingService`; a small injected file store owns only JSON counts for React, Angular and Vue.
- `POLL_DATA_FILE` uses a safe backend-local default. Optional `.env` follows existing dotenv conventions.
- Validate exact count shape, finite nonnegative safe integers and safe total. Missing files start at zero; invalid/corrupt files stop startup without overwrite.
- Synchronous single-process writes use an exclusive temporary file in the same directory and atomic rename. Save before committing counters, eligibility, round or revision; failures return safe typed errors without broadcasting success.
- Do not persist connections, socket IDs, eligibility, rounds, revisions or instance IDs. Restart restores tally with fresh identity and eligibility.
- Tests use disposable directories, never production/default data. Multi-process writers, a database, migration framework and stronger crash/power-loss durability are outside this unit.

## Verification and outcomes

DV-01 persistence behavior is implemented and verified locally. In that first unit, Docker, frontend source and root README were not edited; the following DV-02/DV-03 unit now delivers them. The baseline remains historical: its in-memory-only statements no longer describe the backend. Backend `.env.example` could not be read because runtime permissions denied the read; it was preserved without bypass or another-tool retry. Its requested `POLL_DATA_FILE` example addition remains blocked. Backend/root READMEs document exported variables instead.

### Exact authored files

- New `backend/src/voting/poll.storage.ts` and `poll.storage.spec.ts`: count validation, private directory/file creation, exclusive temporary writes, atomic replacement, sanitized errors and failure tests.
- Updated `backend/src/config.ts`, `backend/src/voting/voting.module.ts` and `voting.service.ts`: configured storage factory, explicit injection, startup restoration and save-before-mutation ordering.
- Updated `backend/src/voting/voting.types.ts`, `voting.gateway.ts` and `voting.controller.ts`: storage rejection contract, explicit gateway rejection/broadcast branch and safe reset HTTP 503.
- Updated `backend/src/voting/voting.service.spec.ts`, `backend/test/voting.e2e-spec.ts`, `backend/README.md`, root `.gitignore` and this document: isolated tests, restart/failure harness, instructions and ignored `backend/data/` including temporary files.

Package files, dependencies, frontend, root README, baseline document and nested Git metadata were not modified by this unit. Build output was regenerated by the existing build script.

### Observed checks

Normalization ran from the project root before the final check-only commands. Backend checks ran from `backend/`.

| Exact command                                                                                                                          | Observed result                                                          |
| -------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `backend/node_modules/.bin/prettier --write 'backend/src/**/*.ts' 'backend/test/**/*.ts' backend/README.md odd/tasks/docker-voting.md` | Passed; normalized authored files; other source files reported unchanged |
| `npm run build`                                                                                                                        | Passed; Nest TypeScript build                                            |
| `npm test -- --run`                                                                                                                    | Passed: 2 files, 43 tests (21 storage, 22 service)                       |
| `npm run test:e2e -- --run`                                                                                                            | Passed: 1 file, 7 actual-server tests                                    |
| `npm run lint`                                                                                                                         | Passed; preserved check-only Oxlint                                      |
| `npx prettier --check 'src/**/*.ts' 'test/**/*.ts' README.md ../odd/tasks/docker-voting.md`                                            | Passed; all matched authored backend/docs files formatted                |

The compiled default was also verified without writing data, immediately after the build, with:

```bash
node --input-type=module -e "import { fileURLToPath } from 'node:url'; import { pollDataFile } from './dist/config.js'; delete process.env.POLL_DATA_FILE; const expected = fileURLToPath(new URL('./data/poll.json', import.meta.url)); if (pollDataFile() !== expected) throw new Error('Compiled default path mismatch'); process.stdout.write('Compiled default path verified; no data written.\\n');"
```

Observed output: `Compiled default path verified; no data written.`

The e2e harness uses the production storage factory with an isolated `POLL_DATA_FILE`, genuine HTTP and Socket.IO clients, ephemeral loopback ports, and fresh Nest apps sharing the same temporary file. It proves counts/percentages survive restart, instance/round change, revision resets, presence/eligibility are fresh, and a persisted reset survives another restart. A real store rename failure is injected at the filesystem boundary: vote rejection reaches both acknowledgement and sender-only error, reset returns exactly the safe 503 body, prior saved data/poll/eligibility remain intact, temporary cleanup succeeds and peers receive no success broadcast. A corrupt-file startup compilation fails without overwriting the file. All owned clients/apps and temporary directories are cleaned up; no test writes default production data. No browser or strict TDD claim.

### Contract delta and Docker handoff

- New vote rejection/identical sender-only `vote:error`: `{ status: 'rejected', code: 'STORAGE_ERROR', message: 'Your vote could not be saved. Please try again.' }`. The gateway's existing explicit rejected-result branch handles storage failures rather than throwing a packet error.
- Reset failure: HTTP 503, `{ statusCode: 503, code: 'STORAGE_ERROR', message: 'The poll could not be reset. Please try again.' }`; no results broadcast or round/revision change. Safe-total overflow also rejects the vote without mutation.
- `POLL_DATA_FILE` defaults to absolute `backend/data/poll.json`, resolved relative to the source/compiled module rather than the launch directory. Custom relative paths resolve from the working directory. Optional dotenv behavior is unchanged.
- Persist only `{ react, angular, vue }`. A missing file starts at zero and is written on the next accepted vote/reset, not on startup. Corrupt/invalid/unreadable data fails startup without automatic repair.
- DV-02 must mount a writable **directory** volume and set an absolute in-container `POLL_DATA_FILE`; mounting just the JSON file prevents the same-directory rename design. One backend process owns the file. Map `STORAGE_ERROR` in frontend UI/tests next; Spanish existing UI was not changed now.

### Risks and pending work

Single-process synchronous filesystem storage is intentional for this tiny demo. There is no inter-process locking, fsync/power-loss durability guarantee, backup automation or schema migration. Existing directory permissions are not forcibly changed; configure a trusted writable directory. Cleanup failure can leave an ignored orphan temporary file, which is never loaded. Reset remains public and reconnect/restart allows voting again. Existing development dependency vulnerabilities through `@nestjs/mau` were not upgraded or re-audited. The non-blocking Vite tsconfig-paths plugin warning remains.

Engram discovery saves, session summary and full-document mirror remain pending because no memory tools are exposed. The file is the source of truth; no fabricated save is claimed. No Git mutations, commits, remote execution, credential inspection/reuse, child delegates, SDD or native reviews occurred. DV-02/DV-03 were pending at the DV-01 handoff and are completed below; environment-example editing remains blocked by runtime permissions.

DV-01 rollback boundary: remove only DV-01 storage/tests and restore its backend wiring, contract/config/docs and generated-data ignore changes; retain unrelated user files, the baseline and this history. The following unit has its own boundary.

## DV-02/DV-03 delivery and verification

Separate backend/frontend images, same-origin browser routing, a durable directory volume and lifecycle documentation are implemented and verified. Ordinary tests were used; TDD mode was unknown. One writer, no delegates. Local Docker builds and public image/package fetches were explicitly authorized for this unit; no remote Docker endpoint or host was used.

### Files and runtime decisions

- New `backend/Dockerfile` and `.dockerignore`: Node 24 LTS builder uses `npm ci` with development dependencies and verifies `dist/main.js`; runtime installs `npm ci --omit=dev`, copies compiled output and package metadata (`type: module`), then runs `node dist/main.js` as UID 1000. `/app/data` is created and owned by `node` before a fresh volume mount. Ignore rules exclude source control, environment files, local data, dependencies, output and test artifacts; build/test configuration remains available to compilation.
- New `frontend/Dockerfile`, `.dockerignore` and `nginx.conf`: Node build followed by unprivileged Nginx on 8080. SPA fallback, preserved REST/Socket.IO paths, HTTP/1.1 upgrade map, unbuffered polling and 75-second proxy timeouts. Variable-based upstream with Docker resolver `127.0.0.11`, five-second DNS cache, resolves backend replacement without Nginx restart. Full Nginx config places PID/temp files in `/tmp`; direct entrypoint avoids startup scripts writing a read-only filesystem.
- New root `compose.yaml`: backend is internal only on 3000, frontend publishes `${APP_PORT:-8080}`, named `poll-data` directory volume at `/app/data`, absolute `POLL_DATA_FILE`, `unless-stopped`, built-in Node HTTP backend readiness and frontend `wget` healthcheck. `depends_on: service_healthy`; frontend read-only with `/tmp` tmpfs. Port-derived default CORS origin and explicit `FRONTEND_URL` override; no dotenv bind mounts or secrets.
- Updated frontend services/tests, hook/tests, shared types and Vite config: page-origin API/socket defaults, optional explicit URL overrides retained, `/api` and `/socket.io` development proxies to localhost:3000 with WebSocket support and no path stripping. Spanish `STORAGE_ERROR` feedback is tested for both ack and sender-only event, retaining retry eligibility and tally.
- Root and service READMEs explain container/npm startup, persisted counts, fresh eligibility, public persistent reset, corrupt startup safety, volume lifecycle, non-local origin override and single-writer/no-fsync limits. Historical `odd/tasks/live-voting.md` and nested `backend/.git` are untouched. Package/lockfiles and DV-01 implementation were not edited in this unit.

Sources checked before configuration: Context7 `/docker/docs` (Compose named volumes, readiness and interpolation), `/websites/nginx_en` (variable proxy URI, WebSocket upgrade map/timeouts), `/vitejs/vite` (development HTTP/WebSocket proxies). Official [Node image versions](https://github.com/nodejs/docker-node/blob/main/versions.json) confirm Node 24 LTS Alpine variants; [unprivileged Nginx guidance](https://github.com/nginx/docker-nginx-unprivileged) confirms non-root port/PID/temp paths. Moving image tags were chosen for the supported demo line, not digest-pinned release reproducibility.

### Exact observed checks

Normalization ran before checks, using the installed backend Prettier; no local dependency installation was needed. Commands below are relative to the root except service commands.

| Command                                                                                                                                                                                      | Observed result                                                                                                                                                      |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `backend/node_modules/.bin/prettier --write 'frontend/src/**/*.{ts,tsx,css}' frontend/vite.config.ts README.md backend/README.md frontend/README.md compose.yaml odd/tasks/docker-voting.md` | Passed; authored frontend/docs/Compose normalized; unrelated files unchanged                                                                                         |
| Frontend: `npm run build && npm run lint && npm test -- --run`                                                                                                                               | Passed: Vite build, ESLint, 4 files / 36 tests                                                                                                                       |
| Backend: `npm run build && npm run lint && npm test -- --run && npm run test:e2e -- --run`                                                                                                   | Passed: Nest build, Oxlint, 2 files / 43 unit tests, 1 file / 7 real-server tests                                                                                    |
| Backend: import `./dist/config.js` with `node --input-type=module` and assert `dist/main.js` exists                                                                                          | Passed: compiled ES module imports; exact entrypoint exists; no default data written                                                                                 |
| `docker --version` / `docker compose version`                                                                                                                                                | Docker 29.4.1 / Compose v5.1.3                                                                                                                                       |
| Check only `DOCKER_HOST` and `DOCKER_CONTEXT`, then `docker context show` and `docker context inspect desktop-linux --format '{{.Endpoints.docker.Host}}'`                                   | Both environment overrides unset; selected context `desktop-linux`; endpoint `unix:///Users/yoelmarain/.docker/run/docker.sock` confirmed local before daemon access |
| `docker --host unix:///Users/yoelmarain/.docker/run/docker.sock info --format '{{.ServerVersion}}'`                                                                                          | Local daemon available: 29.4.1; all daemon commands pinned to this endpoint                                                                                          |
| `docker --host unix:///Users/yoelmarain/.docker/run/docker.sock compose --env-file /dev/null -p websockets-docker-verification config --quiet`                                               | Passed; no interpolated credentials printed or dotenv file loaded                                                                                                    |
| `APP_PORT=18080 docker --host unix:///Users/yoelmarain/.docker/run/docker.sock compose --env-file /dev/null -p websockets-docker-verification build`                                         | Both images built successfully on the first attempt; no correction/rebuild loop                                                                                      |
| Node/image version checks via isolated `docker run --rm`                                                                                                                                     | Actual image Node v24.21.0 and Nginx 1.30.5                                                                                                                          |
| Compose JSON piped directly into a Node assertion, with `APP_PORT=18080`                                                                                                                     | Passed: default CORS becomes `http://localhost:18080`; backend has no published ports; config content not printed                                                    |
| `node /var/folders/f8/hsf0vvsn70g7_wwm9q_7qykc0000gn/T/opencode/websockets-docker-verification.mjs`                                                                                          | Passed: all isolated container scenarios below and owned-resource cleanup                                                                                            |

The temporary harness is outside the workspace, retained as local evidence rather than a repository test framework. It checks that project resources do not preexist and port 18080 was separately verified available by a temporary local TCP listener before startup. `COMPOSE_PROJECT_NAME` is selected with the equivalent explicit `-p websockets-docker-verification` flag, with controlled `APP_PORT=18080` and `FRONTEND_URL=http://localhost:18080`; it never touches the ordinary project's volume.

Final normalization ran with `backend/node_modules/.bin/prettier --write README.md odd/tasks/docker-voting.md`. The exact final check `backend/node_modules/.bin/prettier --check 'frontend/src/**/*.{ts,tsx,css}' frontend/vite.config.ts frontend/package.json frontend/index.html 'backend/src/**/*.ts' 'backend/test/**/*.ts' backend/README.md frontend/README.md README.md compose.yaml odd/tasks/docker-voting.md` passed: all matched files use Prettier style. Dockerfiles/ignore/Nginx are not supported Prettier formats; actual image builds, `nginx -t` and runtime tests validate those boundaries instead. Compose `config --quiet` passed again after documentation normalization.

### Container harness outcomes

1. `compose up -d --no-build --wait --wait-timeout 60`: both services healthy. Actual runtime confirms Node 24, backend UID 1000 and exact command, frontend non-root UID, read-only root filesystem, and `nginx -t`. SPA HTML/deep-link fallback and HTTP API/CORS work through frontend port 18080.
2. Two genuine Socket.IO clients start via HTTP polling; one upgrades to WebSocket, the other stays polling. Initial snapshots, two-client presence, accepted vote and peer broadcast work. Duplicate/invalid submissions receive typed rejections. Filesystem permissions on the isolated volume directory are temporarily restricted by its owning UID: vote ack/sender-only `STORAGE_ERROR`, reset 503, unchanged tally and no peer success broadcast are observed. Permissions are restored in `finally`; retry succeeds. Saved file contains exactly `{ react: 1, angular: 1, vue: 0 }`, no IDs or live state.
3. `compose restart backend`: REST returns restored total 2, both clients reconnect with a fresh instance/zero revision and fresh eligibility. A new vote succeeds. HTTP reset persists zero and broadcasts it to both clients.
4. `compose stop backend` and `compose rm -f backend`, followed by a short-lived owned helper occupying the old IP and `compose up -d --no-build --no-deps --wait --wait-timeout 60 backend`: backend changes **172.20.0.2 → 172.20.0.4**. Without changing the frontend container, REST and both socket clients recover; reset counts remain zero and a new polling-client vote succeeds. This exercises actual IP replacement, not just restart at the same address.
5. Disconnect clients, remove only the owned IP helper, then `compose down -v` with the isolated project flag. Assert no isolated containers/volume remain. That destructive cleanup was authorized only for this run's newly created test volume; normal user resources/data were never removed. Built verification images and cache remain locally.

Build npm output reports 5 backend builder dependency vulnerabilities (2 low, 1 moderate, 2 high), and 0 in the backend production install/frontend install. This is install output, not a separate image security audit; no dependency upgrade was attempted. The non-blocking backend tsconfig-paths warning remains. No real browser, production deployment, crash/fsync durability, multi-writer or image scan proof is claimed.

### Completion and rollback boundary

DV-02/DV-03 acceptance is complete locally; a manual browser pass and blocked backend environment-example update remain explicit limitations, not container blockers. Engram saves/session summary/full-document mirror remain pending because those tools are unavailable. Only read-only Git root resolution occurred. No Git mutations, staging, commits, pushes, native reviews, SDD phases, remote operations, credential reuse or child delegation occurred.

To roll back only this unit, remove the six new container/config files (both Dockerfiles and `.dockerignore` files, frontend `nginx.conf`, root `compose.yaml`), restore this unit's same-origin services/Vite proxy, frontend storage-error type/message/tests and root/service README edits. Retain DV-01 storage/wiring/tests/data, `.gitignore`, nested Git metadata, baseline, unrelated user changes and this history. Do not delete the regular poll volume as a rollback shortcut.

## Skill resolution

### Parent closure evidence

- Independent functional verification passed both builds, both linters, 43 backend unit tests, 7 real-server integration tests and 36 frontend tests (86 total), plus Compose structural/configuration checks.
- Initial independent container verification was partial because verification images were unavailable. A separate bounded action built both images once and ran the isolated harness once successfully. REST, SPA fallback, polling/WebSocket, presence, rejection handling, storage failure safety, restart restoration and persistent reset passed. Backend IP replacement recovered through the unchanged frontend. Cleanup confirmed no isolated containers, networks or volumes remain; images/cache remain.
- Parent spot check of `docker compose config --quiet`, pinned to the local daemon and isolated project with no dotenv loading, passed.
- Native review is enabled globally, but assessment and selectorless preflight refused the existing nested backend Git repository. Preflight reported `mutation_outcome: not_started`; no native review approval exists. Git structure was preserved; functional verification does not replace native review authority.
- Browser demonstration, blocked environment-example edit and Engram mirror/session summary remain pending. No commits or publication occurred.

**paths-injected**: `/Users/yoelmarain/.agents/skills/work-unit-commits/SKILL.md` and `/Users/yoelmarain/.config/opencode/skills/cognitive-doc-design/SKILL.md` were read before work. CodeGraph reported no index and directed filesystem fallback; no index was created.
