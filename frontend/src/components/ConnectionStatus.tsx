const labels = {
  connected: "Conectado",
  disconnected: "Desconectado",
};

export function ConnectionStatus({
  connection,
}: {
  connection: keyof typeof labels;
}) {
  return (
    <span className={`connection ${connection}`} role="status">
      <span className="status-dot" aria-hidden="true" />
      {labels[connection]}
    </span>
  );
}
