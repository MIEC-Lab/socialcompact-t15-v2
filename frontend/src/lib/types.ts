/*
 * Authorship: Chonglin Dong (C), Chenle Chen (D), and Yuhao Ye (E) share the frontend/backend data contract.
 * Scope: Type definitions for results, logs, and public match payloads.
 */

export type PlayerResult = {
  name: string;
  score: number;
  status: string;
};

export type RoundLog = {
  round: number;
  events: string[];
  remaining_players: string[];
};

export type MatchResult = {
  match_id: string;
  game: string;
  rounds: number;
  winner: string;
  players: PlayerResult[];
  summary: string;
  source: string;
  status: string;
  round_logs: RoundLog[];
};

export type GameLogEvent = {
  id: string;
  match_id: string;
  round: number;
  phase: string;
  actor?: string | null;
  target?: string | null;
  message: string;
  timestamp: string;
};

export type MatchLogsResponse = {
  match_id: string;
  status: string;
  source: string;
  event_count: number;
  events: GameLogEvent[];
};

export type MatchCreateResponse = {
  id: string;
  game: string;
  rounds: number;
  player_count: number;
  status: string;
  message: string;
  source: string;
  result?: MatchResult | null;
};
