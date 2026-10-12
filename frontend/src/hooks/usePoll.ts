import { useEffect, useRef, useState } from "react";
import type { Socket } from "socket.io-client";
import { createSocket } from "../services/socket";
import type {
  ClientEvents,
  OptionId,
  PollSnapshot,
  ServerEvents,
  VoteError,
} from "../types/poll";

export function usePoll() {
  const socket = useRef<Socket<ServerEvents, ClientEvents> | null>(null);
  const [poll, setPoll] = useState<PollSnapshot | null>(null);
  const [connection, setConnection] = useState<"connected" | "disconnected">(
    "disconnected",
  );
  const [selected, setSelected] = useState<OptionId>();
  const [error, setError] = useState("");

  useEffect(() => {
    const client = createSocket();
    socket.current = client;
    const connect = () => {
      setConnection("connected");
      setSelected(undefined);
      setError("");
    };
    const disconnect = () => {
      setConnection("disconnected");
      setPoll(null);
    };
    const connectError = () => {
      disconnect();
      setError("Could not connect. Waiting for the server…");
    };
    const results = (snapshot: PollSnapshot) => {
      setPoll(snapshot);
      setError("");
    };
    const reset = (snapshot: PollSnapshot) => {
      results(snapshot);
      setSelected(undefined);
    };
    const voteError = (failure: VoteError) => setError(failure.message);
    client.on("connect", connect);
    client.on("disconnect", disconnect);
    client.on("connect_error", connectError);
    client.on("vote:results", results);
    client.on("poll:reset", reset);
    client.on("vote:error", voteError);
    client.connect();

    return () => {
      client.off("connect", connect);
      client.off("disconnect", disconnect);
      client.off("connect_error", connectError);
      client.off("vote:results", results);
      client.off("poll:reset", reset);
      client.off("vote:error", voteError);
      client.disconnect();
      socket.current = null;
    };
  }, []);

  const vote = (optionId: OptionId) => {
    if (socket.current?.connected)
      socket.current.emit("vote:cast", { optionId });
  };
  const reset = async () => {
    setError("");
    try {
      const response = await fetch("/api/poll/reset", { method: "POST" });
      if (!response.ok) throw new Error("Reset request failed.");
      // The socket notification updates the poll and clears every selection.
    } catch {
      setError("No se pudo reiniciar la encuesta. Inténtalo de nuevo.");
    }
  };
  return { poll, connection, selected, setSelected, error, vote, reset };
}
