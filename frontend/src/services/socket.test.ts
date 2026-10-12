import { afterEach, expect, it, vi } from "vitest";
import { createSocket } from "./socket";

const mock = vi.hoisted(() => ({ io: vi.fn().mockReturnValue({}) }));
vi.mock("socket.io-client", () => ({ io: mock.io }));
afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});

it("creates an isolated, manually connected lifecycle using the page origin", () => {
  createSocket();
  expect(mock.io).toHaveBeenCalledWith(undefined, {
    autoConnect: false,
    forceNew: true,
  });
});

it("retains the optional explicit Socket.IO origin override", () => {
  vi.stubEnv("VITE_SOCKET_URL", "http://localhost:3001");
  createSocket();
  expect(mock.io).toHaveBeenCalledWith("http://localhost:3001", {
    autoConnect: false,
    forceNew: true,
  });
});
