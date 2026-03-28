import { SetupForm } from "@/components/session/setup-form";

export default function NewSessionPage() {
  return (
    <div className="mx-auto w-full max-w-2xl p-8 space-y-6">
      <h1 className="text-2xl font-bold">New Practice Session</h1>
      <p className="text-zinc-500">
        Enter your essay question and mark scheme to start a timed practice session.
      </p>
      <SetupForm />
    </div>
  );
}
