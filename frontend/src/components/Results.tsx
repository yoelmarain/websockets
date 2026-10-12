import type { PollSnapshot } from "../types/poll";

export function Results({ poll }: { poll: PollSnapshot }) {
  return (
    <>
      <div className="total">
        <strong>{poll.total}</strong>
        <span>
          {poll.total === 1 ? "voto en esta ronda" : "votos en esta ronda"}
        </span>
      </div>
      <div className="result-list" aria-live="polite" aria-atomic="true">
        {poll.options.map((option) => (
          <div className="result" key={option.id}>
            <div className="result-label">
              <span>{option.label}</span>
              <strong>
                {option.percentage.toLocaleString("es", {
                  maximumFractionDigits: 1,
                })}
                %
              </strong>
            </div>
            <div className="bar-track" aria-hidden="true">
              <div
                className={`bar-fill ${option.id}`}
                style={{ width: `${option.percentage}%` }}
              />
            </div>
            <span className="vote-count">
              {option.votes} {option.votes === 1 ? "voto" : "votos"}
            </span>
          </div>
        ))}
      </div>
    </>
  );
}
