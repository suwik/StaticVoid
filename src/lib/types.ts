export type InterventionType =
  | "evaluation_depth"
  | "application_missing"
  | "structure_drift"
  | "evidence_lacking"
  | "time_priority";

export type StudentResponse = "pending" | "dismissed" | "read" | "revised";

export type SessionStatus = "active" | "completed" | "abandoned";

export interface Session {
  id: string;
  user_id: string;
  question: string;
  mark_scheme: string;
  time_limit: number;
  status: SessionStatus;
  started_at: string;
  completed_at: string | null;
  created_at: string;
}

export interface Essay {
  id: string;
  session_id: string;
  content: string;
  updated_at: string;
}

export interface Intervention {
  id: string;
  session_id: string;
  paragraph_index: number;
  paragraph_text: string;
  intervention_type: InterventionType;
  message: string;
  student_response: StudentResponse;
  created_at: string;
}

export interface Pattern {
  id: string;
  user_id: string;
  skill_area: string;
  weakness_type: string;
  frequency: number;
  last_seen: string;
  resolved: boolean;
}

export interface InterventionResponse {
  should_intervene: boolean;
  type: InterventionType | null;
  message: string | null;
}
