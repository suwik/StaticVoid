import { AuthForm } from "@/components/auth/auth-form";
import { Logo } from "@/components/ui/logo";
import { InfiniteGrid } from "@/components/ui/the-infinite-grid";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <InfiniteGrid
      className="flex flex-1 items-center justify-center"
      baseOpacity={0.06}
      revealOpacity={0.3}
      revealRadius={420}
      speedX={0.2}
      speedY={0.2}
      showGlow
    >
      <Card className="w-full max-w-sm shadow-lg shadow-foreground/5 bg-card/90 backdrop-blur-sm">
        <CardHeader className="text-center space-y-3 pb-2">
          <div className="mx-auto">
            <Logo size="lg" />
          </div>
          <p className="text-sm text-muted-foreground">
            Sign in to start practicing
          </p>
        </CardHeader>
        <CardContent>
          <AuthForm />
        </CardContent>
      </Card>
    </InfiniteGrid>
  );
}
