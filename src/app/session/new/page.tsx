import { SetupForm } from "@/components/session/setup-form";
import { loadPredefinedQuestions } from "@/lib/predefined-questions";
import { NavHeader } from "@/components/layout/nav-header";
import { GridBackground } from "@/components/layout/grid-background";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function NewSessionPage() {
  const predefinedQuestions = loadPredefinedQuestions();

  return (
    <GridBackground>
      <NavHeader />
      <div className="mx-auto w-full max-w-2xl p-8 space-y-6">
        <div>
          <h1 className="font-heading text-3xl tracking-tight">New Session</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Set up your timed essay practice
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-xl">Practice Setup</CardTitle>
            <CardDescription>
              Enter your essay question and mark scheme to start a timed
              practice session.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SetupForm predefinedQuestions={predefinedQuestions} />
          </CardContent>
        </Card>
      </div>
    </GridBackground>
  );
}
