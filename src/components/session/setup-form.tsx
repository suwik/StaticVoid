"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function SetupForm() {
  const [question, setQuestion] = useState("");
  const [markScheme, setMarkScheme] = useState("");
  const [timeLimit, setTimeLimit] = useState(45); // minutes
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question,
        markScheme,
        timeLimit: timeLimit * 60, // convert to seconds
      }),
    });

    if (res.ok) {
      const session = await res.json();
      router.push(`/session/${session.id}`);
    }

    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="question">Essay Question</Label>
        <Textarea
          id="question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          required
          rows={3}
          placeholder="Paste your essay question here..."
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="markScheme">Mark Scheme Criteria</Label>
        <Textarea
          id="markScheme"
          value={markScheme}
          onChange={(e) => setMarkScheme(e.target.value)}
          required
          rows={5}
          placeholder="What criteria does this essay get marked against?"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="timeLimit">Time Limit (minutes)</Label>
        <Input
          id="timeLimit"
          type="number"
          value={timeLimit}
          onChange={(e) => setTimeLimit(Number(e.target.value))}
          min={5}
          max={180}
        />
      </div>
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Creating..." : "Start Session"}
      </Button>
    </form>
  );
}
