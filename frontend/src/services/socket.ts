import { io } from "socket.io-client";
import type { Socket } from "socket.io-client";
import type { ClientEvents, ServerEvents } from "../types/poll";

export function createSocket(): Socket<ServerEvents, ClientEvents> {
  return io(import.meta.env.VITE_SOCKET_URL || undefined, {
    autoConnect: false,
    forceNew: true,
  });
}
