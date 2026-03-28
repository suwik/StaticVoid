import { SetupForm } from "@/components/session/setup-form";
import { loadPredefinedQuestions } from "@/lib/predefined-questions";
import { NavHeader } from "@/components/layout/nav-header";
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
    <>
      <NavHeader />
      <div className="mx-auto w-full max-w-2xl p-8">
        <Card>
          <CardHeader>
            <CardTitle>New Practice Session</CardTitle>
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
    </>
  );
}
