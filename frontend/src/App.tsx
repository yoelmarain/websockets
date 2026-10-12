import { usePoll } from "./hooks/usePoll";
import { Poll } from "./components/Poll";
import { Results } from "./components/Results";
import { ConnectionStatus } from "./components/ConnectionStatus";
import "./App.css";

export default function App() {
  const poll = usePoll();
  const offline = poll.connection !== "connected" || !poll.poll;

  return (
    <main className="shell">
      <header className="page-header">
        <a className="brand" href="#main-poll" aria-label="Ir a la encuesta">
          <span className="brand-mark" aria-hidden="true">
            ↗
          </span>{" "}
          Pulso<span className="brand-tag">EN VIVO</span>
        </a>
        <ConnectionStatus connection={poll.connection} />
      </header>
      <section className="intro">
        <p className="eyebrow">TU OPINIÓN CUENTA</p>
        <h1>
          Votación en vivo<span className="accent">.</span>
        </h1>
        <p>Una pregunta. Muchas perspectivas. Resultados al instante.</p>
      </section>
      <div className="poll-layout">
        <section
          className="card voting-card"
          id="main-poll"
          aria-labelledby="poll-title"
        >
          <div className="card-heading">
            <span className="eyebrow">LA PREGUNTA</span>
          </div>
          {poll.poll ? (
            <Poll
              poll={poll.poll}
              selected={poll.selected}
              onSelect={poll.setSelected}
              onVote={() => poll.selected && poll.vote(poll.selected)}
              disabled={offline}
            />
          ) : (
            <h2 id="poll-title">Cargando encuesta…</h2>
          )}
          <p className="feedback" role="status">
            {offline
              ? "Waiting for a connection to vote."
              : "Choose an option. You can vote more than once."}
          </p>
          {poll.error && (
            <p className="error" role="alert">
              {poll.error}
            </p>
          )}
        </section>
        <section className="card results-card" aria-labelledby="results-title">
          <div className="card-heading">
            <h2 id="results-title">Resultados</h2>
            <span className="live-label">EN TIEMPO REAL</span>
          </div>
          {poll.poll ? (
            <Results poll={poll.poll} />
          ) : (
            <p role="status">Esperando resultados…</p>
          )}
          <div className="results-footer">
            <span aria-hidden="true">↻</span> Se actualizan automáticamente
          </div>
        </section>
      </div>
      <aside className="demo-notice" aria-label="Acerca de esta demostración">
        <div>
          <h2>Un espacio para experimentar</h2>
          <p>
            You can vote as many times as you like. Counts live in memory and
            are lost when the server restarts.
          </p>
          <p>Reset clears the votes and selections in every connected tab.</p>
        </div>
        <button
          className="reset-button"
          type="button"
          onClick={poll.reset}
          disabled={offline}
        >
          Reiniciar demo
        </button>
      </aside>
      <footer className="page-footer">
        Hecho para compartir ideas · Sin cuentas, sin complicaciones
      </footer>
    </main>
  );
}
