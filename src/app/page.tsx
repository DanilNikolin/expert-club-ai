// D:\expert-club-ai\expert-club-ai\src\app\page.tsx
'use client';

import Link from 'next/link';
import { Users, MessageSquare, ArrowRight, Zap, Target } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { Section } from '@/components/landing/Section';
import { SectionHeader } from '@/components/landing/SectionHeader';
import { CardBase } from '@/components/landing/CardBase';
import { StepCard } from '@/components/landing/StepCard';
import { FeatureCard } from '@/components/landing/FeatureCard';
import { CtaRow } from '@/components/landing/CtaRow';
import { FixedCtaBar } from '@/components/landing/FixedCtaBar';
import { TimelineConnector } from '@/components/landing/TimelineConnector';

/* --------------------------------- Page ---------------------------------- */

export default function HomePage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-bg-main text-text-secondary"
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <span className="animate-pulse">Loading...</span>
      </div>
    );
  }

  const isAuthed = Boolean(user);

  return (
    <main className="min-h-screen bg-bg-main text-text-main relative isolate">
      <a href="#content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 bg-bg-surface text-text-main px-3 py-2 rounded">
        Skip to content
      </a>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(to_right,rgba(255,255,255,0.6)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.6)_1px,transparent_1px)] [background-size:32px_32px] [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />
      </div>

      {/* Hero */}
      <Section className="pt-20 pb-14 text-center">
        <div id="content" className="max-w-5xl mx-auto">

          <h1 className="flex flex-col items-center gap-y-3 text-4xl md:text-6xl font-pixel uppercase mb-8">
            <span className="inline-block md:whitespace-nowrap rounded-md bg-bg-surface/50 px-4 py-2 text-accent-primary">
              Build your AI Team.
            </span>
            <span className="inline-block md:whitespace-nowrap rounded-md bg-bg-surface/50 px-4 py-2 text-accent-primary">
              Give them a goal.
            </span>
            <span className="inline-block md:whitespace-nowrap rounded-md bg-bg-surface/50 px-4 py-2 text-accent-secondary">
              Say &apos;Go!&apos;.
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-text-secondary mb-10 max-w-3xl mx-auto">
            This is your sandbox. Create an AI genius, a critic, an idiot — anyone. They will debate your task, and you will direct the process.
          </p>

          <CtaRow isAuthed={isAuthed} />
        </div>
      </Section>

      {/* Divider */}
      <div className="mx-auto w-full max-w-6xl px-4">
        <div className="h-px w-full bg-accent-primary/30" />
      </div>

      {/* How it works */}
      <Section aria-labelledby="how" className="relative">
        <SectionHeader>How if works</SectionHeader>

        <div className="flex flex-col gap-6 md:hidden">
          <StepCard
            step={1}
            icon={Users}
            color="primary"
            title="Create Experts"
            description="Assemble a team from scratch in a powerful constructor or choose ready-made ones."
          />
          <StepCard
            step={2}
            icon={MessageSquare}
            color="secondary"
            title="Formulate Task"
            description="Describe your idea. Our AI Concierge will help turn it into a clear brief for the team."
          />
          <StepCard
            step={3}
            icon={Zap}
            color="success"
            title="Start Debate"
            description="Watch your AI experts argue, agree, and seek the truth, following their assigned characters."
          />
          <StepCard
            step={4}
            icon={Target}
            color="danger"
            title="Get Conclusions"
            description="In the end — the essence on one screen. No fluff. Only key arguments, risks, and a step-by-step plan."
          />
        </div>

        {/* --- DESKTOP VERSION (our new rigid grid) --- */}
        <div className="hidden md:grid md:grid-cols-[4fr_1fr_4fr_1fr_4fr_1fr_4fr] md:items-stretch md:gap-x-4">
          <StepCard
            step={1}
            icon={Users}
            color="primary"
            title="Create Experts"
            description="Assemble a team from scratch in a powerful constructor or choose ready-made ones."
          />
          <TimelineConnector />
          <StepCard
            step={2}
            icon={MessageSquare}
            color="secondary"
            title="Formulate Task"
            description="Describe your idea. Our AI Concierge will help turn it into a clear brief for the team."
          />
          <TimelineConnector />
          <StepCard
            step={3}
            icon={Zap}
            color="success"
            title="Start Debate"
            description="Watch your AI experts argue, agree, and seek the truth, following their assigned characters."
          />
          <TimelineConnector />
          <StepCard
            step={4}
            icon={Target}
            color="danger"
            title="Get Conclusions"
            description="In the end — the essence on one screen. No fluff. Only key arguments, risks, and a step-by-step plan."
          />
        </div>
      </Section>

      {/* Why it works */}
      <Section aria-labelledby="why">
        <SectionHeader>Why it works</SectionHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          <FeatureCard
            icon={Users}
            color="primary"
            title="Power in Debate"
            text="Roles with opposing mindsets. Instead of one answer — a spectrum of solutions with criticism and defense."
          />
          <FeatureCard
            icon={MessageSquare}
            color="secondary"
            title="Real Dialogue"
            text="Models argue with each other, clarify theses, escalate arguments. Facts, logic, and strategy."
          />
          <FeatureCard
            icon={Target}
            color="success"
            title="You are the Director"
            text="Composition, rules, rounds — according to the task. Intervene at the right moment and guide the dispute to the goal."
          />
        </div>
      </Section>

      {/* Final CTA */}
      <Section className="pb-24">
        <div className="max-w-4xl mx-auto text-center">
          <CardBase color="primary" className="p-10 md:p-12 bg-bg-surface border-2 border-accent-primary/40">
            <h2 className="text-3xl md:text-4xl font-pixel text-accent-primary uppercase mb-4">
              Ready to test the hypothesis?
            </h2>
            <p className="text-xl text-text-secondary mb-8">
              Run a debate — get a clear plan and a list of risks. Short, to the point, actionable.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAuthed ? (
                <Link href="/discussion/new" className="focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary/60 rounded-lg">
                  <Button size="default" className="w-full px-10 py-4 text-lg">
                    Create Discussion
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              ) : (
                <Link href="/signup" className="focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary/60 rounded-lg">
                  <Button size="default" className="w-full px-10 py-4 text-lg">
                    Start for Free
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              )}
            </div>

            <p className="text-sm text-text-secondary mt-4">
              Free forever (dev mode)
            </p>
          </CardBase>
        </div>
      </Section>

      {/* Mobile sticky CTA */}
      <FixedCtaBar isAuthed={isAuthed} />
    </main>
  );
}