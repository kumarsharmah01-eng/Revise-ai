export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold">
          Revise<span className="text-blue-500">AI</span>
        </h1>

        <div className="hidden md:flex items-center gap-8 text-sm text-gray-300">
          <a href="#features" className="hover:text-white transition">
            Features
          </a>

          <a href="#how-it-works" className="hover:text-white transition">
            How It Works
          </a>

          <a
            href="/login"
            className="px-5 py-2 rounded-lg border border-gray-700 hover:bg-gray-900 transition"
          >
            Login
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto text-center px-6 pt-24 pb-32">
        <p className="text-blue-400 font-medium tracking-widest text-sm mb-6">
          AI-POWERED LEARNING
        </p>

        <h2 className="text-5xl md:text-7xl font-bold leading-tight">
          Study Smarter.
          <br />
          <span className="text-blue-500">Revise Better.</span>
          <br />
          Perform Better.
        </h2>

        <p className="max-w-2xl mx-auto mt-8 text-gray-400 text-lg leading-relaxed">
          Turn your notes and study material into personalized revision content,
          quizzes, and interview questions using AI.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-10">
          <button className="px-7 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 transition font-medium">
            Get Started
          </button>

          <button className="px-7 py-3 rounded-xl border border-gray-700 hover:bg-gray-900 transition font-medium">
            See How It Works
          </button>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <p className="text-blue-400 text-sm font-medium">FEATURES</p>

          <h2 className="text-4xl font-bold mt-3">
            Everything You Need to Prepare
          </h2>

          <p className="text-gray-400 mt-5">
            One platform for revision, quizzes and interviews.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="p-8 rounded-2xl border border-gray-800 bg-gray-950 hover:border-gray-600 transition">
            <div className="text-3xl mb-5">📚</div>

            <h3 className="text-xl font-semibold mb-3">Smart Revision</h3>

            <p className="text-gray-400 leading-relaxed">
              Upload your study material and let AI create personalized revision
              content.
            </p>
          </div>

          <div className="p-8 rounded-2xl border border-gray-800 bg-gray-950 hover:border-gray-600 transition">
            <div className="text-3xl mb-5">🧠</div>

            <h3 className="text-xl font-semibold mb-3">AI Quiz Generator</h3>

            <p className="text-gray-400 leading-relaxed">
              Generate quizzes from your notes and test your understanding
              instantly.
            </p>
          </div>

          <div className="p-8 rounded-2xl border border-gray-800 bg-gray-950 hover:border-gray-600 transition">
            <div className="text-3xl mb-5">🎤</div>

            <h3 className="text-xl font-semibold mb-3">
              Interview Preparation
            </h3>

            <p className="text-gray-400 leading-relaxed">
              Practice AI-generated interview questions based on your selected
              topic.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <p className="text-blue-400 text-sm font-medium">HOW IT WORKS</p>

          <h2 className="text-4xl font-bold mt-3">From Notes to Preparation</h2>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          {[
            ["01", "Upload", "Upload your PDF or study material."],
            ["02", "AI Analyzes", "Revise AI understands your content."],
            ["03", "Practice", "Generate quizzes and interview questions."],
            ["04", "Improve", "Analyze your performance and improve."],
          ].map(([number, title, description]) => (
            <div
              key={number}
              className="p-6 border border-gray-800 rounded-2xl bg-gray-950"
            >
              <span className="text-blue-500 font-bold">{number}</span>

              <h3 className="text-xl font-semibold mt-5">{title}</h3>

              <p className="text-gray-400 mt-3">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-6 py-32 text-center">
        <h2 className="text-4xl md:text-5xl font-bold">
          Ready to Study Smarter?
        </h2>

        <p className="text-gray-400 mt-6 text-lg">
          Start preparing with AI instead of spending hours organizing your
          study material.
        </p>

        <button className="mt-8 px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 transition font-medium">
          Start Revising
        </button>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8 text-center text-gray-500">
        <p>© 2026 Revise AI. All rights reserved.</p>
      </footer>
    </main>
  );
}
