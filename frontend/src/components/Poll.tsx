import type { OptionId, PollSnapshot } from "../types/poll";

interface Props {
  poll: PollSnapshot;
  selected?: OptionId;
  onSelect: (id: OptionId) => void;
  onVote: () => void;
  disabled: boolean;
}

export function Poll({ poll, selected, onSelect, onVote, disabled }: Props) {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onVote();
      }}
    >
      <h2 id="poll-title">{poll.question}</h2>
      <fieldset disabled={disabled}>
        <legend className="sr-only">Selecciona tu tecnología favorita</legend>
        {poll.options.map((option, index) => (
          <PollOption
            key={option.id}
            id={option.id}
            label={option.label}
            index={index}
            checked={selected === option.id}
            onSelect={onSelect}
          />
        ))}
      </fieldset>
      <button
        className="vote-button"
        type="submit"
        disabled={disabled || !selected}
      >
        Enviar mi voto
        <span aria-hidden="true">→</span>
      </button>
    </form>
  );
}

function PollOption({
  id,
  label,
  index,
  checked,
  onSelect,
}: {
  id: OptionId;
  label: string;
  index: number;
  checked: boolean;
  onSelect: (id: OptionId) => void;
}) {
  return (
    <label className={`poll-option ${checked ? "selected" : ""}`}>
      <span className="option-number" aria-hidden="true">
        0{index + 1}
      </span>
      <span>{label}</span>
      <input
        type="radio"
        name="technology"
        value={id}
        checked={checked}
        onChange={() => onSelect(id)}
      />
    </label>
  );
}
