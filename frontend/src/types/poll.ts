export type OptionId = "react" | "angular" | "vue";
export interface PollSnapshot {
  question: string;
  options: { id: OptionId; label: string; votes: number; percentage: number }[];
  total: number;
}
export interface VoteError {
  message: string;
}
export interface ServerEvents {
  "vote:results": (poll: PollSnapshot) => void;
  "poll:reset": (poll: PollSnapshot) => void;
  "vote:error": (error: VoteError) => void;
}
export interface ClientEvents {
  "vote:cast": (payload: { optionId: OptionId }) => void;
}
