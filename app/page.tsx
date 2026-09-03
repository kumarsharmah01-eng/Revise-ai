import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* ================= NAVBAR ================= */}

      <nav className="border-b border-slate-800">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          {/* LOGO */}

          <Link href="/" className="text-2xl font-bold tracking-tight">
            Revise<span className="text-cyan-400">AI</span>
          </Link>

          {/* NAV LINKS */}

          <div className="hidden items-center gap-8 md:flex">
            <Link
              href="#features"
              className="text-sm text-slate-300 transition hover:text-white"
            >
              Features
            </Link>

            <Link
              href="#how-it-works"
              className="text-sm text-slate-300 transition hover:text-white"
            >
              How it works
            </Link>

            <Link
              href="/login"
              className="text-sm text-slate-300 transition hover:text-white"
            >
              Login
            </Link>

            <Link
              href="/signup"
              className="rounded-lg bg-cyan-400 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ================= HERO ================= */}

      <section className="relative overflow-hidden">
        {/* Background Glow */}

        <div className="absolute left-1/2 top-20 -z-0 h-96 w-96 -translate-x-1/2 rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-6 py-28 text-center">
          {/* Badge */}

          <div className="mx-auto mb-7 inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-300">
            AI-powered learning platform
          </div>

          {/* Heading */}

          <h1 className="mx-auto max-w-4xl text-5xl font-bold leading-tight tracking-tight md:text-7xl">
            Study smarter.
            <br />
            <span className="text-cyan-400">Revise better.</span>
          </h1>

          {/* Description */}

          <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-slate-400">
            Upload your notes, PDFs or images and let Revise AI transform them
            into personalized revision material, quizzes and interview
            questions.
          </p>

          {/* Buttons */}

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/signup"
              className="rounded-xl bg-cyan-400 px-7 py-3.5 font-semibold text-slate-950 transition hover:bg-cyan-300"
            >
              Start Learning Free →
            </Link>

            <Link
              href="#features"
              className="rounded-xl border border-slate-700 px-7 py-3.5 font-semibold text-slate-200 transition hover:border-slate-500"
            >
              Explore Features
            </Link>
          </div>
        </div>
      </section>

      {/* ================= FEATURES ================= */}

      <section
        id="features"
        className="border-t border-slate-800 bg-slate-900/40"
      >
        <div className="mx-auto max-w-7xl px-6 py-24">
          {/* Heading */}

          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-cyan-400">
              Everything you need
            </p>

            <h2 className="mt-3 text-3xl font-bold md:text-4xl">
              Your AI study companion
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-slate-400">
              Revise AI helps you understand, practice and prepare using your
              own study material.
            </p>
          </div>

          {/* Feature Cards */}

          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* CARD 1 */}

            <FeatureCard
              icon="📚"
              title="AI Revision"
              description="Upload your notes and let AI create concise, exam-focused revision material."
            />

            {/* CARD 2 */}

            <FeatureCard
              icon="🧠"
              title="Smart Quizzes"
              description="Generate personalized quizzes from your PDFs, notes and study material."
            />

            {/* CARD 3 */}

            <FeatureCard
              icon="🎯"
              title="Interview Prep"
              description="Practice technical and HR questions and get AI-powered feedback."
            />

            {/* CARD 4 */}

            <FeatureCard
              icon="📊"
              title="Performance Analysis"
              description="Track your scores and discover your strongest and weakest topics."
            />

            {/* CARD 5 */}

            <FeatureCard
              icon="📄"
              title="PDF & Image Support"
              description="Upload study material and let Revise AI understand it for you."
            />

            {/* CARD 6 */}

            <FeatureCard
              icon="⚡"
              title="Personalized Learning"
              description="Your progress helps Revise AI understand what you need to practice next."
            />
          </div>
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}

      <section id="how-it-works">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-cyan-400">
              Simple process
            </p>

            <h2 className="mt-3 text-3xl font-bold md:text-4xl">
              How Revise AI works
            </h2>
          </div>

          <div className="mt-14 grid gap-10 md:grid-cols-3">
            {/* STEP 1 */}

            <Step
              number="01"
              title="Upload"
              description="Upload your PDF, notes or study images."
            />

            {/* STEP 2 */}

            <Step
              number="02"
              title="Let AI Understand"
              description="Revise AI analyzes your material and creates useful learning content."
            />

            {/* STEP 3 */}

            <Step
              number="03"
              title="Learn & Improve"
              description="Revise, take quizzes and improve your weak areas."
            />
          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}

      <section className="border-t border-slate-800">
        <div className="mx-auto max-w-4xl px-6 py-24 text-center">
          <h2 className="text-4xl font-bold md:text-5xl">
            Ready to study smarter?
          </h2>

          <p className="mx-auto mt-5 max-w-xl text-slate-400">
            Turn your study material into an intelligent learning experience.
          </p>

          <Link
            href="/signup"
            className="mt-8 inline-block rounded-xl bg-cyan-400 px-8 py-4 font-semibold text-slate-950 transition hover:bg-cyan-300"
          >
            Create Your Account →
          </Link>
        </div>
      </section>

      {/* ================= FOOTER ================= */}

      <footer className="border-t border-slate-800">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
          <p>© 2026 Revise AI. All rights reserved.</p>

          <p>Learn smarter. Prepare better.</p>
        </div>
      </footer>
    </main>
  );
}

/* =====================================================
   FEATURE CARD COMPONENT
===================================================== */

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950 p-7 transition duration-300 hover:-translate-y-1 hover:border-cyan-400/40">
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-400/10 text-2xl">
        {icon}
      </div>

      <h3 className="text-xl font-semibold">{title}</h3>

      <p className="mt-3 leading-7 text-slate-400">{description}</p>
    </div>
  );
}

/* =====================================================
   STEP COMPONENT
===================================================== */

function Step({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-cyan-400 text-lg font-bold text-slate-950">
        {number}
      </div>

      <h3 className="mt-6 text-xl font-semibold">{title}</h3>

      <p className="mt-3 leading-7 text-slate-400">{description}</p>
    </div>
  );
}
