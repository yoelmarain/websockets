import { StrictMode } from "react";
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { usePoll } from "./usePoll";
import type { PollSnapshot } from "../types/poll";

const mock = vi.hoisted(() => ({ createSocket: vi.fn() }));
vi.mock("../services/socket", () => ({ createSocket: mock.createSocket }));

function snapshot(total = 0): PollSnapshot {
  return {
    question: "Favorite frontend technology?",
    options: [
      {
        id: "react",
        label: "React",
        votes: total,
        percentage: total ? 100 : 0,
      },
      { id: "angular", label: "Angular", votes: 0, percentage: 0 },
      { id: "vue", label: "Vue", votes: 0, percentage: 0 },
    ],
    total,
  };
}
type Listener = (...args: unknown[]) => void;
class FakeSocket {
  connected = false;
  listeners = new Map<string, Set<Listener>>();
  on = vi.fn((name: string, listener: Listener) => {
    const listeners = this.listeners.get(name) ?? new Set<Listener>();
    listeners.add(listener);
    this.listeners.set(name, listeners);
    return this;
  });
  off = vi.fn((name: string, listener: Listener) => {
    this.listeners.get(name)?.delete(listener);
    return this;
  });
  emit = vi.fn();
  connect = vi.fn(() => this);
  disconnect = vi.fn(() => {
    this.connected = false;
    return this;
  });
  receive(name: string, ...args: unknown[]) {
    this.listeners.get(name)?.forEach((listener) => listener(...args));
  }
  establish(poll = snapshot()) {
    this.connected = true;
    this.receive("connect");
    this.receive("vote:results", poll);
  }
  lose() {
    this.connected = false;
    this.receive("disconnect");
  }
  count() {
    return [...this.listeners.values()].reduce(
      (count, listeners) => count + listeners.size,
      0,
    );
  }
}
let sockets: FakeSocket[];
const resetFetch = vi.fn();
beforeEach(() => {
  vi.clearAllMocks();
  resetFetch.mockReset().mockResolvedValue({ ok: true });
  vi.stubGlobal("fetch", resetFetch);
  sockets = [];
  mock.createSocket.mockImplementation(() => {
    const socket = new FakeSocket();
    sockets.push(socket);
    return socket;
  });
});
afterEach(() => vi.unstubAllGlobals());

describe("usePoll", () => {
  it("registers listeners before connect and cleans exact references in StrictMode", () => {
    const { unmount } = renderHook(usePoll, { wrapper: StrictMode });
    expect(sockets).toHaveLength(2);
    expect(sockets[0].count()).toBe(0);
    expect(sockets[0].disconnect).toHaveBeenCalledOnce();
    const active = sockets[1];
    expect(active.count()).toBe(6);
    expect(active.on.mock.invocationCallOrder.at(-1)).toBeLessThan(
      active.connect.mock.invocationCallOrder[0],
    );
    unmount();
    expect(active.count()).toBe(0);
    expect(active.off.mock.calls).toEqual(active.on.mock.calls);
    expect(active.disconnect).toHaveBeenCalledOnce();
  });

  it("loads the initial socket snapshot, applies live updates and emits repeated votes without acks", () => {
    const { result } = renderHook(usePoll);
    expect(result.current.poll).toBeNull();
    expect(resetFetch).not.toHaveBeenCalled();
    act(() => sockets[0].establish());
    expect(result.current.connection).toBe("connected");
    expect(result.current.poll).toEqual(snapshot());
    act(() => {
      result.current.vote("react");
      result.current.vote("react");
      sockets[0].receive("vote:results", snapshot(2));
    });
    expect(sockets[0].emit.mock.calls).toEqual([
      ["vote:cast", { optionId: "react" }],
      ["vote:cast", { optionId: "react" }],
    ]);
    expect(result.current.poll?.total).toBe(2);
  });

  it("reports vote errors without pending state and clears errors on results", () => {
    const { result } = renderHook(usePoll);
    act(() => sockets[0].establish());
    act(() =>
      sockets[0].receive("vote:error", { message: "Choose a valid option." }),
    );
    expect(result.current.error).toBe("Choose a valid option.");
    expect(result.current.poll?.total).toBe(0);
    act(() => sockets[0].receive("vote:results", snapshot(1)));
    expect(result.current.error).toBe("");
  });

  it.each([0, 2])(
    "clears all clients' selections on explicit reset with total %s",
    async (total) => {
      const first = renderHook(usePoll);
      const second = renderHook(usePoll);
      act(() => sockets.forEach((socket) => socket.establish(snapshot(total))));
      act(() => {
        first.result.current.setSelected("react");
        second.result.current.setSelected("vue");
      });
      await act(async () => first.result.current.reset());
      expect(resetFetch).toHaveBeenCalledExactlyOnceWith("/api/poll/reset", {
        method: "POST",
      });
      expect(sockets[0].emit).not.toHaveBeenCalled();
      // The request alone does not pretend the server has reset the poll.
      expect(first.result.current.selected).toBe("react");
      expect(first.result.current.poll?.total).toBe(total);
      expect(second.result.current.selected).toBe("vue");
      act(() =>
        sockets.forEach((socket) => socket.receive("poll:reset", snapshot())),
      );
      for (const hook of [first, second]) {
        expect(hook.result.current.selected).toBeUndefined();
        expect(hook.result.current.poll?.total).toBe(0);
      }
    },
  );

  it.each(["http", "network"])(
    "handles %s reset failures without changing the poll or selection",
    async (failure) => {
      if (failure === "http") resetFetch.mockResolvedValue({ ok: false });
      else resetFetch.mockRejectedValue(new Error("Network unavailable"));
      const { result } = renderHook(usePoll);
      act(() => sockets[0].establish(snapshot(2)));
      act(() => result.current.setSelected("react"));
      await act(async () => result.current.reset());
      expect(result.current.error).toBe(
        "No se pudo reiniciar la encuesta. Inténtalo de nuevo.",
      );
      expect(result.current.poll).toEqual(snapshot(2));
      expect(result.current.selected).toBe("react");
      expect(sockets[0].emit).not.toHaveBeenCalled();
    },
  );

  it("uses HTTP reset without coupling the request to socket connectivity", async () => {
    const { result } = renderHook(usePoll);
    await act(async () => result.current.reset());
    expect(resetFetch).toHaveBeenCalledWith("/api/poll/reset", {
      method: "POST",
    });
    expect(result.current.poll).toBeNull();
    expect(sockets[0].emit).not.toHaveBeenCalled();
  });

  it("does not restore a stale poll when HTTP reset completes after disconnect", async () => {
    let finish!: (response: { ok: boolean }) => void;
    resetFetch.mockReturnValue(
      new Promise((resolve) => {
        finish = resolve;
      }),
    );
    const { result, unmount } = renderHook(usePoll);
    act(() => sockets[0].establish(snapshot(2)));
    act(() => result.current.setSelected("react"));
    let pending!: Promise<void>;
    act(() => {
      pending = result.current.reset();
    });
    act(() => sockets[0].lose());
    await act(async () => {
      finish({ ok: true });
      await pending;
    });
    expect(result.current.connection).toBe("disconnected");
    expect(result.current.poll).toBeNull();
    act(() => sockets[0].establish(snapshot()));
    expect(result.current.selected).toBeUndefined();
    expect(result.current.poll).toEqual(snapshot());
    unmount();
    expect(sockets[0].count()).toBe(0);
    expect(sockets[0].disconnect).toHaveBeenCalledOnce();
  });

  it("blocks offline votes, shows connection errors and uses a fresh reconnect snapshot", () => {
    const { result } = renderHook(usePoll);
    act(() => {
      result.current.vote("react");
    });
    expect(sockets[0].emit).not.toHaveBeenCalled();
    act(() => sockets[0].receive("connect_error"));
    expect(result.current.error).toContain("Could not connect");
    act(() => sockets[0].establish(snapshot(4)));
    act(() => result.current.setSelected("vue"));
    act(() => sockets[0].lose());
    expect(result.current.connection).toBe("disconnected");
    expect(result.current.poll).toBeNull();
    act(() => {
      result.current.vote("react");
    });
    expect(sockets[0].emit).not.toHaveBeenCalled();
    act(() => sockets[0].establish(snapshot(1)));
    expect(result.current.poll?.total).toBe(1);
    expect(result.current.selected).toBeUndefined();
    expect(result.current.error).toBe("");
  });
});
