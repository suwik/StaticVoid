import Link from "next/link";
import {
  ArrowRight,
  Users,
  School,
  TrendingDown,
  Clock,
  BarChart3,
  Shield,
  BookOpen,
  GraduationCap,
  CheckCircle2,
  Building2,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { InfiniteGrid } from "@/components/ui/the-infinite-grid";

export const metadata = {
  title: "Sooner for Schools — Real-Time Essay Coaching at Scale",
  description:
    "Scale essay coaching to every student, every session. AI that teaches students to self-correct — not write for them. Built for IB, A-levels, SAT, and university entrance exams.",
};

export default function BusinessPage() {
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
        <Link href="/">
          <Logo />
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors"
          >
            For Students
          </Link>
          <a href="#contact">
            <Button className="rounded-full px-5 h-9 text-sm font-semibold">
              Get in touch
            </Button>
          </a>
        </div>
      </header>

      {/* ───── HERO ───── */}
      <section className="flex flex-col items-center justify-center px-6 pt-20 pb-28 md:pt-28 md:pb-36">
        <div className="text-center space-y-6 max-w-3xl">
          <p className="text-[0.7rem] font-semibold text-muted-foreground uppercase tracking-[0.2em]">
            For schools &amp; institutions
          </p>
          <h1 className="font-heading text-[2.75rem] md:text-[4rem] leading-[1.08] tracking-tight">
            Every student gets a writing coach.
            <br />
            <span className="text-muted-foreground">Not just the ones who can afford one.</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Sooner sits beside your students while they write — reading every paragraph,
            nudging when arguments go off track, staying silent when they don&apos;t.
            Real-time essay coaching that scales to every classroom.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <a href="#contact">
              <Button className="rounded-full px-8 h-12 text-base font-semibold gap-2 shadow-lg shadow-foreground/10 hover:shadow-xl hover:shadow-foreground/15 transition-all hover:-translate-y-0.5">
                Book a pilot
                <ArrowRight className="size-4" />
              </Button>
            </a>
            <a
              href="#how-it-helps"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              See how it works
            </a>
          </div>
        </div>
      </section>

      {/* ───── THE PROBLEM FOR SCHOOLS ───── */}
      <section className="bg-surface-sunken py-24 md:py-32">
        <div className="mx-auto max-w-2xl px-6 space-y-8">
          <h2 className="font-heading text-3xl md:text-[2.75rem] leading-[1.1] tracking-tight text-center">
            One teacher. Thirty essays. Zero real-time feedback.
          </h2>
          <div className="text-base md:text-lg text-muted-foreground leading-relaxed space-y-4">
            <p>
              Your teachers know exactly what great essay coaching looks like.
              They do it every day — sitting beside a student, reading their argument unfold,
              asking the right question at the right moment.
            </p>
            <p>
              The problem isn&apos;t knowledge. It&apos;s physics. One teacher cannot read
              over thirty shoulders at once. So most students write alone, submit, wait days,
              and get feedback they&apos;ve already forgotten the context for.
            </p>
            <p className="text-foreground font-medium">
              The students who improve fastest are the ones with a tutor beside them.
              That&apos;s a resource problem, not a teaching problem. Sooner fixes the resource problem.
            </p>
          </div>
        </div>
      </section>

      {/* ───── HOW SOONER HELPS ───── */}
      <section id="how-it-helps" className="py-24 md:py-32 scroll-mt-16">
        <div className="mx-auto max-w-4xl px-6 space-y-12">
          <div className="text-center space-y-3">
            <h2 className="font-heading text-3xl md:text-[2.75rem] leading-[1.1] tracking-tight">
              What changes when every student has a coach
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Sooner doesn&apos;t replace your teachers. It gives every student
              the experience only one-on-one tutoring provides.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {[
              {
                icon: Clock,
                title: "Real-time, not after the fact",
                desc: "AI reads each paragraph as the student writes it, evaluating against the actual mark scheme. Nudges arrive in the moment — while the student still remembers their reasoning.",
                color: "var(--warm-blue)",
              },
              {
                icon: BookOpen,
                title: "Questions, never answers",
                desc: "\"What's the counter-argument here?\" not \"Write about X.\" Students think and fix it themselves. The skill transfers to the exam hall where there's no AI.",
                color: "var(--warm-orange)",
              },
              {
                icon: TrendingDown,
                title: "Measures what matters",
                desc: "We track nudges per session. Session 1: twelve. Session 10: the student catches mistakes before the AI does. Fewer nudges = real learning, not AI dependency.",
                color: "var(--warm-lavender)",
              },
              {
                icon: BarChart3,
                title: "Teacher dashboard",
                desc: "See which students need help, which skill areas are weakest across your cohort, and where self-correction is improving. Prioritise your time where it matters most.",
                color: "var(--warm-blue)",
              },
              {
                icon: Shield,
                title: "Mark scheme aligned",
                desc: "Every nudge maps to your assessment criteria — IB, A-level, SAT, university entrance. Not generic writing tips. Exam-specific coaching.",
                color: "var(--warm-orange)",
              },
              {
                icon: GraduationCap,
                title: "Time-aware coaching",
                desc: "Thorough early on. High-impact only when time runs low. Silent in the final minute. Mirrors how a great tutor manages a timed essay session.",
                color: "var(--warm-lavender)",
              },
            ].map((item) => (
              <div key={item.title} className="flex gap-4">
                <div
                  className="flex items-center justify-center size-10 rounded-2xl shrink-0"
                  style={{ backgroundColor: item.color }}
                >
                  <item.icon className="size-5 text-foreground/70" />
                </div>
                <div>
                  <h3 className="font-heading text-lg mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── UNIT ECONOMICS / ROI ───── */}
      <section className="bg-surface-sunken py-24 md:py-32">
        <div className="mx-auto max-w-3xl px-6 space-y-12">
          <div className="text-center space-y-3">
            <h2 className="font-heading text-3xl md:text-[2.75rem] leading-[1.1] tracking-tight">
              The maths is simple.
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Private essay tutoring costs £50–100/hour. Most families can&apos;t afford it.
              The ones that can get an unfair advantage. Sooner levels the field.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            {[
              {
                label: "Private tutoring",
                value: "£50–100",
                sub: "per hour",
                color: "var(--warm-orange)",
              },
              {
                label: "Sooner per student",
                value: "~£5",
                sub: "per month",
                color: "var(--warm-blue)",
              },
              {
                label: "Students per teacher",
                value: "30+",
                sub: "coached simultaneously",
                color: "var(--warm-lavender)",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-3xl p-7 text-center"
                style={{ backgroundColor: stat.color }}
              >
                <p className="text-[2.5rem] md:text-[3rem] font-heading text-foreground/90 leading-none">
                  {stat.value}
                </p>
                <p className="text-sm text-foreground/60 mt-1">{stat.sub}</p>
                <p className="text-xs font-medium text-foreground/50 mt-3 uppercase tracking-wider">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 md:p-8 space-y-4">
            <h3 className="font-heading text-xl">For schools, the case is clear:</h3>
            <ul className="space-y-3">
              {[
                "Students who currently get zero essay coaching now get it every session",
                "Students who get feedback days late now get it in real time",
                "Teachers see cohort-wide weakness patterns instead of marking 30 essays blind",
                "Parents see measurable improvement — fewer nudges per session, not a polished essay someone else wrote",
              ].map((point) => (
                <li key={point} className="flex gap-3 items-start">
                  <CheckCircle2 className="size-4 mt-1 shrink-0 text-foreground/50" />
                  <span className="text-sm md:text-base text-muted-foreground leading-relaxed">
                    {point}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ───── DISTRIBUTION PARTNERS ───── */}
      <section className="py-24 md:py-32">
        <div className="mx-auto max-w-3xl px-6 space-y-12">
          <div className="text-center space-y-3">
            <h2 className="font-heading text-3xl md:text-[2.75rem] leading-[1.1] tracking-tight">
              Already moving forward with
            </h2>
            <p className="text-lg text-muted-foreground">
              Schools that prepare students for the world&apos;s most competitive exams.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Swan School */}
            <div className="rounded-3xl border border-border bg-card p-7 md:p-8 space-y-4">
              <div className="flex items-center gap-3">
                <div
                  className="flex items-center justify-center size-10 rounded-2xl"
                  style={{ backgroundColor: "var(--warm-blue)" }}
                >
                  <Building2 className="size-5 text-foreground/70" />
                </div>
                <div>
                  <h3 className="font-heading text-lg">The Swan School</h3>
                  <p className="text-xs text-muted-foreground">Warsaw, Poland</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Poland&apos;s first school offering comprehensive preparation for
                Oxford, Cambridge, Harvard, and Stanford. Operating since 2014,
                teaching IB, A-levels, SAT, critical thinking, and application essays.
                Their entire model is built around the exact skill Sooner teaches:
                writing better under pressure.
              </p>
              <p className="text-sm text-foreground/80 font-medium">
                They already do this with human tutors, one-on-one.
                Sooner scales that to every student, every session.
              </p>
            </div>

            {/* We University */}
            <div className="rounded-3xl border border-border bg-card p-7 md:p-8 space-y-4">
              <div className="flex items-center gap-3">
                <div
                  className="flex items-center justify-center size-10 rounded-2xl"
                  style={{ backgroundColor: "var(--warm-lavender)" }}
                >
                  <Building2 className="size-5 text-foreground/70" />
                </div>
                <div>
                  <h3 className="font-heading text-lg">We University</h3>
                  <p className="text-xs text-muted-foreground">Warsaw, Poland</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Early adopter in the AI-enabled education space.
                Recognised the gap between generic AI writing tools that do the work
                for students and tools that actually build the skill.
                Moving forward with Sooner as a complementary resource for their programmes.
              </p>
              <p className="text-sm text-foreground/80 font-medium">
                Both institutions have been briefed and given the green light to implement.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ───── HOW SCHOOLS USE IT ───── */}
      <section className="bg-surface-sunken py-24 md:py-32">
        <div className="mx-auto max-w-2xl px-6 space-y-8">
          <h2 className="font-heading text-3xl md:text-[2.75rem] leading-[1.1] tracking-tight text-center">
            How schools adopt Sooner
          </h2>

          <div className="space-y-6">
            {[
              {
                step: "1",
                title: "Pilot with one class",
                desc: "Pick a cohort preparing for essay-based exams. Students use Sooner during study periods or at home. Teachers see the data immediately.",
              },
              {
                step: "2",
                title: "Measure the shift",
                desc: "Track nudges per session declining. Track self-correction rates rising. Compare with control groups or prior cohorts. The signal is clear within weeks.",
              },
              {
                step: "3",
                title: "Roll out across departments",
                desc: "IB, A-levels, SAT prep, university application essays, any subject with extended writing. One platform, every exam board, every student.",
              },
            ].map((s) => (
              <div key={s.step} className="flex gap-4">
                <div className="flex items-center justify-center size-8 rounded-full bg-foreground text-background text-sm font-semibold shrink-0">
                  {s.step}
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

      {/* ───── MARKET CONTEXT ───── */}
      <section className="py-24 md:py-32">
        <div className="mx-auto max-w-2xl px-6 space-y-8">
          <h2 className="font-heading text-3xl md:text-[2.75rem] leading-[1.1] tracking-tight text-center">
            The market nobody&apos;s serving.
          </h2>
          <div className="text-base md:text-lg text-muted-foreground leading-relaxed space-y-4">
            <p>
              Every AI tutoring platform on the market does one of two things:
              answers questions or grades finished work. None sit alongside the student
              during a timed essay and teach in real time.
            </p>
            <p>
              Essay coaching is entirely unserved by technology. It&apos;s still human tutors,
              one-on-one, at premium hourly rates — or it doesn&apos;t happen at all.
            </p>
            <p className="text-foreground font-medium">
              The global private tutoring market is valued at $130–150 billion in 2025.
              Over a hundred million students sit essay-based exams every year globally.
              The gap is massive and obvious.
            </p>
          </div>
        </div>
      </section>

      {/* ───── CONTACT CTA ───── */}
      <section id="contact" className="bg-surface-sunken py-24 md:py-32 scroll-mt-16">
        <div className="mx-auto max-w-2xl px-6 text-center space-y-6">
          <h2 className="font-heading text-3xl md:text-[2.75rem] leading-[1.1] tracking-tight">
            Let&apos;s run a pilot.
          </h2>
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
            Pick one class. One exam. Two weeks. We&apos;ll show you what
            real-time essay coaching does to self-correction rates.
            No commitment, no cost for the pilot.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a href="mailto:patryk@sooner.coach">
              <Button className="rounded-full px-8 h-12 text-base font-semibold gap-2 shadow-lg shadow-foreground/10 hover:shadow-xl hover:shadow-foreground/15 transition-all hover:-translate-y-0.5">
                <Mail className="size-4" />
                patryk@sooner.coach
              </Button>
            </a>
          </div>
          <p className="text-sm text-muted-foreground">
            Or reach out directly — we&apos;re based in Warsaw and happy to meet in person.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-8">
        <div className="mx-auto max-w-4xl flex items-center justify-between">
          <Link href="/">
            <Logo />
          </Link>
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              For Students
            </Link>
            <p className="text-xs text-muted-foreground">
              AI that teaches writing. Then gets out of the way.
            </p>
          </div>
        </div>
      </footer>
    </InfiniteGrid>
  );
}
