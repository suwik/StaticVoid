import { describe, it, expectTypeOf } from "vitest";
import type {
  InterventionType,
  StudentResponse,
  SessionStatus,
  Session,
  Essay,
  Intervention,
  Pattern,
  InterventionResponse,
} from "@/lib/types";

describe("Type definitions", () => {
  it("InterventionType should be a string union", () => {
    expectTypeOf<InterventionType>().toBeString();
    const valid: InterventionType = "evaluation_depth";
    expectTypeOf(valid).toMatchTypeOf<InterventionType>();
  });

  it("StudentResponse should be a string union", () => {
    expectTypeOf<StudentResponse>().toBeString();
    const valid: StudentResponse = "dismissed";
    expectTypeOf(valid).toMatchTypeOf<StudentResponse>();
  });

  it("SessionStatus should be a string union", () => {
    expectTypeOf<SessionStatus>().toBeString();
    const valid: SessionStatus = "active";
    expectTypeOf(valid).toMatchTypeOf<SessionStatus>();
  });

  it("Session should have required fields", () => {
    expectTypeOf<Session>().toHaveProperty("id");
    expectTypeOf<Session>().toHaveProperty("user_id");
    expectTypeOf<Session>().toHaveProperty("question");
    expectTypeOf<Session>().toHaveProperty("mark_scheme");
    expectTypeOf<Session>().toHaveProperty("time_limit");
    expectTypeOf<Session>().toHaveProperty("status");
  });

  it("Essay should have required fields", () => {
    expectTypeOf<Essay>().toHaveProperty("id");
    expectTypeOf<Essay>().toHaveProperty("session_id");
    expectTypeOf<Essay>().toHaveProperty("content");
  });

  it("Intervention should have required fields", () => {
    expectTypeOf<Intervention>().toHaveProperty("id");
    expectTypeOf<Intervention>().toHaveProperty("session_id");
    expectTypeOf<Intervention>().toHaveProperty("paragraph_index");
    expectTypeOf<Intervention>().toHaveProperty("intervention_type");
    expectTypeOf<Intervention>().toHaveProperty("message");
    expectTypeOf<Intervention>().toHaveProperty("student_response");
  });

  it("Pattern should have required fields", () => {
    expectTypeOf<Pattern>().toHaveProperty("id");
    expectTypeOf<Pattern>().toHaveProperty("user_id");
    expectTypeOf<Pattern>().toHaveProperty("skill_area");
    expectTypeOf<Pattern>().toHaveProperty("frequency");
    expectTypeOf<Pattern>().toHaveProperty("resolved");
  });

  it("InterventionResponse should have correct shape", () => {
    expectTypeOf<InterventionResponse>().toHaveProperty("should_intervene");
    expectTypeOf<InterventionResponse>().toHaveProperty("type");
    expectTypeOf<InterventionResponse>().toHaveProperty("message");
  });
});
