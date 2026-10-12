import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";
import App from "./App";

const mock = vi.hoisted(() => ({
  usePoll: vi.fn(),
  vote: vi.fn(),
  reset: vi.fn(),
  setSelected: vi.fn(),
}));
vi.mock("./hooks/usePoll", () => ({ usePoll: mock.usePoll }));
const state = () => ({
  poll: {
    question: "Favorite frontend technology?",
    options: [
      { id: "react", label: "React", votes: 2, percentage: 66.666 },
      { id: "vue", label: "Vue", votes: 1, percentage: 33.333 },
    ],
    total: 3,
  },
  connection: "connected",
  selected: undefined,
  error: "",
  vote: mock.vote,
  reset: mock.reset,
  setSelected: mock.setSelected,
});
beforeEach(() => {
  vi.clearAllMocks();
  mock.usePoll.mockReturnValue(state());
});

it("renders accessible choices and results, with selection required before voting", () => {
  const { rerender } = render(<App />);
  expect(screen.getByText("66,7%")).toBeInTheDocument();
  const submit = screen.getByRole("button", { name: "Enviar mi voto" });
  expect(submit).toBeDisabled();
  fireEvent.click(screen.getByRole("radio", { name: "React" }));
  expect(mock.setSelected).toHaveBeenCalledWith("react");
  mock.usePoll.mockReturnValue({ ...state(), selected: "react" });
  rerender(<App />);
  fireEvent.click(submit);
  fireEvent.click(submit);
  expect(mock.vote).toHaveBeenCalledTimes(2);
  expect(mock.vote).toHaveBeenCalledWith("react");
  fireEvent.click(screen.getByRole("button", { name: "Reiniciar demo" }));
  expect(mock.reset).toHaveBeenCalledOnce();
});

it("disables vote and reset controls offline and exposes errors", () => {
  mock.usePoll.mockReturnValue({
    ...state(),
    connection: "disconnected",
    selected: "react",
    error: "Could not connect.",
  });
  render(<App />);
  expect(screen.getByRole("radio", { name: "React" })).toBeDisabled();
  expect(screen.getByRole("button", { name: "Enviar mi voto" })).toBeDisabled();
  expect(screen.getByRole("button", { name: "Reiniciar demo" })).toBeDisabled();
  expect(screen.getByRole("alert")).toHaveTextContent("Could not connect.");
});

it("keeps actions disabled while waiting for the initial snapshot", () => {
  mock.usePoll.mockReturnValue({ ...state(), poll: null });
  render(<App />);
  expect(screen.getByRole("button", { name: "Reiniciar demo" })).toBeDisabled();
  expect(screen.getByText("Cargando encuesta…")).toBeInTheDocument();
});

it("clears the visible selection when reset state arrives, even with unchanged counts", () => {
  mock.usePoll.mockReturnValue({ ...state(), selected: "react" });
  const { rerender } = render(<App />);
  expect(screen.getByRole("radio", { name: "React" })).toBeChecked();
  mock.usePoll.mockReturnValue(state());
  rerender(<App />);
  expect(screen.getByRole("radio", { name: "React" })).not.toBeChecked();
  expect(screen.getByRole("button", { name: "Enviar mi voto" })).toBeDisabled();
});
