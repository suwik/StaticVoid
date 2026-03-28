import Link from "next/link";
import {
  ArrowRight,
  ArrowDown,
  MessageSquare,
  FileText,
  PencilLine,
  Sparkles,
  BarChart3,
  GraduationCap,
  Users,
  School,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { InfiniteGrid } from "@/components/ui/the-infinite-grid";

export default function Home() {
  return (
    <InfiniteGrid
      className="flex flex-1 flex-col min-h-screen"
      baseOpacity={0.07}
      revealOpacity={0.4}
      revealRadius={500}
      speedX={0.3}
      speedY={0.3}
      showGlow
    >
      {/* Nav */}
      <header className="sticky top-0 z-50 flex items-center justify-between h-16 px-8 bg-background/80 backdrop-blur-sm">
        <Logo />
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors"
          >
            Login
          </Link>
          <Link href="/login">
            <Button className="rounded-full px-5 h-9 text-sm font-semibold">
              Sign up free
            </Button>
          </Link>
        </div>
      </header>

      {/* ───── HERO ───── */}
      <section className="flex flex-col items-center justify-center px-6 pt-20 pb-28 md:pt-28 md:pb-36">
        <div className="text-center space-y-6 max-w-3xl">
          <h1 className="font-heading text-[2.75rem] md:text-[4rem] leading-[1.08] tracking-tight">
            You don&apos;t need more feedback.
            <br />
            You need it sooner.
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Practice essays with an AI teacher that reads every paragraph as you
            write it — and nudges you before you lose marks, not after.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link href="/login">
              <Button className="rounded-full px-8 h-12 text-base font-semibold gap-2 shadow-lg shadow-foreground/10 hover:shadow-xl hover:shadow-foreground/15 transition-all hover:-translate-y-0.5">
                Start practicing free
                <ArrowRight className="size-4" />
              </Button>
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              See how it works
              <ArrowDown className="size-3.5" />
            </a>
          </div>
        </div>
      </section>

      {/* ───── FEATURE CARDS ───── */}
      <section className="px-6 pb-28">
        <div className="mx-auto max-w-5xl flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8">
          {/* Card 1 */}
          <div
            className="w-full md:w-80 rounded-3xl p-8 transition-transform hover:scale-[1.02] hover:-translate-y-1"
            style={{
              backgroundColor: "var(--warm-blue)",
              transform: "rotate(-3deg)",
            }}
          >
            <h3 className="font-heading text-2xl md:text-[1.7rem] text-foreground/90 mb-2">
              Nudges, not answers{" "}
              <span className="inline-block ml-0.5">&#x25B8;</span>
            </h3>
            <p className="text-sm italic text-foreground/60 mb-2">
              &ldquo;You&apos;ve explained the theory — what does this mean for
              the case study?&rdquo;
            </p>
            <p className="text-sm md:text-[0.95rem] leading-relaxed text-foreground/70">
              Questions that make you think. Not answers that think for you.
            </p>
          </div>

          {/* Card 2 */}
          <div
            className="w-full md:w-80 rounded-3xl p-8 transition-transform hover:scale-[1.02] hover:-translate-y-1"
            style={{ backgroundColor: "var(--warm-orange)" }}
          >
            <h3 className="font-heading text-2xl md:text-[1.7rem] text-foreground/90 mb-2">
              Real exam pressure{" "}
              <span className="inline-block ml-0.5">&#x25B8;</span>
            </h3>
            <p className="text-sm md:text-[0.95rem] leading-relaxed text-foreground/70">
              Timer running. Mark scheme loaded. Write like it counts — with a
              teacher watching every paragraph.
            </p>
          </div>

          {/* Card 3 */}
          <div
            className="w-full md:w-80 rounded-3xl p-8 transition-transform hover:scale-[1.02] hover:-translate-y-1"
            style={{
              backgroundColor: "var(--warm-lavender)",
              transform: "rotate(3deg)",
            }}
          >
            <h3 className="font-heading text-2xl md:text-[1.7rem] text-foreground/90 mb-2">
              Mark scheme aligned{" "}
              <span className="inline-block ml-0.5">&#x25B8;</span>
            </h3>
            <p className="text-sm md:text-[0.95rem] leading-relaxed text-foreground/70">
              Every nudge maps to your actual assessment criteria. Not generic
              writing tips. Exam-specific teaching.
            </p>
          </div>
        </div>
      </section>

      {/* ───── THE PROBLEM ───── */}
      <section className="bg-surface-sunken py-24 md:py-32">
        <div className="mx-auto max-w-2xl px-6 text-center space-y-6">
          <h2 className="font-heading text-3xl md:text-[2.75rem] leading-[1.1] tracking-tight">
            Feedback is broken
          </h2>
          <div className="text-base md:text-lg text-muted-foreground leading-relaxed space-y-4 text-left">
            <p>
              You write an essay. Submit it. Wait three days. Get it back
              covered in red.
            </p>
            <p>
              By then you&apos;ve forgotten why you made those choices. You see
              &ldquo;needs more evaluation&rdquo; but can&apos;t remember what
              you were thinking. So you nod, say you&apos;ll do better, and make
              the exact same mistakes next time.
            </p>
            <p className="text-foreground font-medium">
              The feedback wasn&apos;t wrong. It was just too late.
            </p>
          </div>
        </div>
      </section>

      {/* ───── THE SHIFT ───── */}
      <section className="py-24 md:py-32">
        <div className="mx-auto max-w-2xl px-6 space-y-8">
          <h2 className="font-heading text-3xl md:text-[2.75rem] leading-[1.1] tracking-tight text-center">
            What if your teacher could read over your shoulder?
          </h2>
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed text-center">
            Not checking grammar. Not rewriting your sentences. Just watching
            your argument unfold — and asking the right question at the right
            moment.
          </p>

          <div className="space-y-3 py-4">
            {[
              "Strong point. What's the counter-argument?",
              "You're describing. Can you push into analysis?",
              "Five minutes left. Evaluation earns the most marks right now.",
            ].map((quote) => (
              <div
                key={quote}
                className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4"
              >
                <MessageSquare
                  className="size-4 mt-0.5 shrink-0 text-muted-foreground"
                  strokeWidth={2}
                />
                <p className="text-sm md:text-base italic text-foreground/80">
                  &ldquo;{quote}&rdquo;
                </p>
              </div>
            ))}
          </div>

          <p className="text-base md:text-lg text-muted-foreground leading-relaxed text-center">
            On track? Silence. No interruption. Keep writing.
          </p>
          <p className="text-base md:text-lg text-foreground leading-relaxed text-center font-medium">
            That&apos;s what a great teacher does sitting beside you. This is
            that — for every student, every essay, every time.
          </p>
        </div>
      </section>

      {/* ───── HOW IT WORKS ───── */}
      <section
        id="how-it-works"
        className="bg-surface-sunken py-24 md:py-32 scroll-mt-16"
      >
        <div className="mx-auto max-w-3xl px-6 space-y-12">
          <div className="text-center space-y-2">
            <h2 className="font-heading text-3xl md:text-[2.75rem] leading-[1.1] tracking-tight">
              Pick a question. Write. Get taught.
            </h2>
            <p className="text-muted-foreground text-lg">25 minutes.</p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2">
            {[
              {
                step: "1",
                icon: FileText,
                title: "Choose your question",
                desc: "AI-generated exam questions, paste your own, or snap a photo. The mark scheme loads automatically.",
                color: "var(--warm-blue)",
              },
              {
                step: "2",
                icon: PencilLine,
                title: "Write like the real exam",
                desc: "Clean editor. Timer running. You focus on your argument. The AI reads silently in the background.",
                color: "var(--warm-orange)",
              },
              {
                step: "3",
                icon: Sparkles,
                title: "Get nudged when it matters",
                desc: "Finished a paragraph and something's off? A small nudge appears — not telling you what to write, asking you what to think about. Dismiss it or act on it. Your call.",
                color: "var(--warm-lavender)",
              },
              {
                step: "4",
                icon: BarChart3,
                title: "See what you're learning",
                desc: "Which areas got flagged. Where you self-corrected without help. What's improving session over session. The nudges should go down — that means it's working.",
                color: "var(--warm-blue)",
              },
            ].map((s) => (
              <div key={s.step} className="flex gap-4">
                <div
                  className="flex items-center justify-center size-10 rounded-2xl shrink-0"
                  style={{ backgroundColor: s.color }}
                >
                  <s.icon className="size-5 text-foreground/70" />
                </div>
                <div>
                  <h3 className="font-heading text-lg mb-1">{s.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {s.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── COMPARISON TABLE ───── */}
      <section className="py-24 md:py-32">
        <div className="mx-auto max-w-2xl px-6 space-y-8">
          <div className="text-center space-y-3">
            <h2 className="font-heading text-3xl md:text-[2.75rem] leading-[1.1] tracking-tight">
              This isn&apos;t ChatGPT for essays.
            </h2>
            <p className="text-base md:text-lg text-muted-foreground">
              ChatGPT writes it for you. Sooner teaches you to write it
              yourself.
            </p>
          </div>

          <div className="rounded-2xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted">
                  <th className="text-left px-5 py-3 font-semibold text-muted-foreground">
                    The old way
                  </th>
                  <th className="text-left px-5 py-3 font-semibold text-foreground">
                    Sooner
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  [
                    "Feedback after you submit",
                    "Feedback while you write",
                  ],
                  [
                    '"Needs more evaluation"',
                    '"What\'s the counter-argument here?"',
                  ],
                  [
                    "Same mistakes every essay",
                    "Caught and corrected in real time",
                  ],
                  [
                    "Private tutor at £80/hour",
                    "AI teaching at scale",
                  ],
                  [
                    "AI does your thinking",
                    "AI sharpens your thinking",
                  ],
                ].map(([old, ec], i) => (
                  <tr key={i} className="border-t border-border">
                    <td className="px-5 py-3 text-muted-foreground">{old}</td>
                    <td className="px-5 py-3 text-foreground font-medium">
                      {ec}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ───── THE PROOF ───── */}
      <section className="bg-surface-sunken py-24 md:py-32">
        <div className="mx-auto max-w-2xl px-6 text-center space-y-6">
          <p className="text-[0.7rem] font-semibold text-muted-foreground uppercase tracking-[0.2em]">
            One number we measure
          </p>
          <h2 className="font-heading text-3xl md:text-[2.75rem] leading-[1.1] tracking-tight">
            Time to self-correct.
          </h2>
          <div className="text-base md:text-lg text-muted-foreground leading-relaxed space-y-4">
            <p>
              Session one, the AI nudges you twelve times. Session five,
              it&apos;s seven. Session ten, you&apos;re catching the mistakes
              yourself before the nudge appears.
            </p>
            <p className="text-foreground font-medium">
              That&apos;s not AI dependency. That&apos;s a student becoming a
              better writer. The goal is for Sooner to make itself
              unnecessary.
            </p>
          </div>
        </div>
      </section>

      {/* ───── WHO THIS IS FOR ───── */}
      <section className="py-24 md:py-32">
        <div className="mx-auto max-w-4xl px-6 space-y-12">
          <h2 className="font-heading text-3xl md:text-[2.75rem] leading-[1.1] tracking-tight text-center">
            Built for everyone in the loop
          </h2>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                icon: GraduationCap,
                title: "Students",
                desc: "Stop making the same mistakes. Build the instinct to self-correct. Practice under real exam pressure with teaching that adapts to your weaknesses.",
                color: "var(--warm-blue)",
              },
              {
                icon: Users,
                title: "Parents",
                desc: "Not another AI that does the homework. A teacher that builds the skill. You'll see real progress — not just a polished essay someone else wrote.",
                color: "var(--warm-orange)",
              },
              {
                icon: School,
                title: "Schools",
                desc: "Scale essay teaching beyond what one teacher with 30 students can do. See exactly which students need help and where.",
                color: "var(--warm-lavender)",
              },
            ].map((a) => (
              <div
                key={a.title}
                className="rounded-3xl p-7 md:p-8"
                style={{ backgroundColor: a.color }}
              >
                <a.icon className="size-6 text-foreground/60 mb-4" />
                <h3 className="font-heading text-xl mb-2 text-foreground/90">
                  {a.title}
                </h3>
                <p className="text-sm leading-relaxed text-foreground/65">
                  {a.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── FINAL CTA ───── */}
      <section className="bg-surface-sunken py-24 md:py-32">
        <div className="mx-auto max-w-2xl px-6 text-center space-y-6">
          <h2 className="font-heading text-3xl md:text-[2.75rem] leading-[1.1] tracking-tight">
            Your next essay is the one where it starts to click.
          </h2>
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
            Pick a question. Set the timer. Write. See the difference in one
            session.
          </p>
          <div className="pt-2">
            <Link href="/login">
              <Button className="rounded-full px-8 h-12 text-base font-semibold gap-2 shadow-lg shadow-foreground/10 hover:shadow-xl hover:shadow-foreground/15 transition-all hover:-translate-y-0.5">
                Start practicing free
                <ArrowRight className="size-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-8">
        <div className="mx-auto max-w-4xl flex items-center justify-between">
          <Logo />
          <p className="text-xs text-muted-foreground">
            AI that teaches you to write. Then gets out of the way.
          </p>
        </div>
      </footer>
    </InfiniteGrid>
  );
}
