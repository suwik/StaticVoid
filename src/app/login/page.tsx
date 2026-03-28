import { PenLine } from "lucide-react";
import { AuthForm } from "@/components/auth/auth-form";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <div className="flex flex-1 items-center justify-center bg-muted/30">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto flex items-center gap-2">
            <div className="flex items-center justify-center size-8 rounded-lg bg-primary/10">
              <PenLine className="size-4 text-primary" />
            </div>
            <span className="font-heading text-xl tracking-tight">EssayCoach</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Sign in to start practicing
          </p>
        </CardHeader>
        <CardContent>
          <AuthForm />
        </CardContent>
      </Card>
    </div>
  );
}
