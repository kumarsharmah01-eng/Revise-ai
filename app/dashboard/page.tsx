export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="flex min-h-screen">
        {/* =========================
            SIDEBAR
        ========================== */}

        <aside className="hidden w-64 border-r border-slate-800 bg-slate-900 md:block">
          {/* Logo */}

          <div className="border-b border-slate-800 px-6 py-6">
            <h1 className="text-2xl font-bold">
              Revise<span className="text-blue-500">AI</span>
            </h1>
          </div>

          {/* Navigation */}

          <nav className="space-y-2 p-4">
            <button className="flex w-full items-center gap-3 rounded-lg bg-blue-600 px-4 py-3 text-left font-medium">
              <span>🏠</span>
              <span>Dashboard</span>
            </button>

            <button className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-slate-400 transition hover:bg-slate-800 hover:text-white">
              <span>📚</span>
              <span>Revision</span>
            </button>

            <button className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-slate-400 transition hover:bg-slate-800 hover:text-white">
              <span>🧠</span>
              <span>AI Quiz</span>
            </button>

            <button className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-slate-400 transition hover:bg-slate-800 hover:text-white">
              <span>🎤</span>
              <span>Interview Prep</span>
            </button>

            <button className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-slate-400 transition hover:bg-slate-800 hover:text-white">
              <span>📄</span>
              <span>Materials</span>
            </button>

            <button className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-slate-400 transition hover:bg-slate-800 hover:text-white">
              <span>📊</span>
              <span>Progress</span>
            </button>
          </nav>

          {/* Bottom Section */}

          <div className="absolute bottom-0 w-64 border-t border-slate-800 p-4">
            <button className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-slate-400 transition hover:bg-slate-800 hover:text-white">
              <span>⚙️</span>
              <span>Settings</span>
            </button>

            <button className="mt-2 flex w-full items-center gap-3 rounded-lg px-4 py-3 text-slate-400 transition hover:bg-slate-800 hover:text-white">
              <span>🚪</span>
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* =========================
            MAIN AREA
        ========================== */}

        <section className="flex-1">
          <div className="p-8">
            <h2 className="text-3xl font-bold">Dashboard</h2>

            <p className="mt-2 text-slate-400">Your learning workspace</p>
          </div>
        </section>
      </div>
    </main>
  );
}
