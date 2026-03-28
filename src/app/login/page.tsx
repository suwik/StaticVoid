import { AuthForm } from "@/components/auth/auth-form";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="w-full max-w-sm space-y-6 p-4">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">EssayCoach</h1>
          <p className="text-zinc-500">Sign in to start practicing</p>
        </div>
        <AuthForm />
      </div>
    </div>
  );
}
