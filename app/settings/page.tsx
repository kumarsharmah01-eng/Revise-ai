"use client";

import { useState } from "react";

const settingsSections = [
  {
    title: "ACCOUNT",
    items: [
      { id: "profile", label: "My Profile", icon: "👤" },
      { id: "learning", label: "Learning Preferences" },
    ],
  },
  {
    title: "PERSONALIZATION",
    items: [
      { id: "appearance", label: "Appearance" },
      { id: "ai", label: "AI Preferences" },
      { id: "notifications", label: "Notifications" },
    ],
  },
  {
    title: "SECURITY",
    items: [{ id: "security", label: "Security & Privacy" }],
  },
  {
    title: "SUPPORT",
    items: [{ id: "help", label: "Help & Support" }],
  },
];

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState("profile");

  const activeItem = settingsSections
    .flatMap((section) => section.items)
    .find((item) => item.id === activeSection);

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      {/* SETTINGS HEADER */}

      <header className="border-b border-gray-800 px-6 py-6 md:px-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Settings</h1>

              <p className="text-gray-400 mt-2 text-sm">
                Manage your account and customize your Revise AI experience.
              </p>
            </div>

            <div className="hidden sm:flex items-center gap-2 text-sm text-gray-400">
              <span className="text-blue-500">Revise</span>
              <span className="text-white font-semibold">AI</span>
              <span className="text-gray-600">/</span>
              <span>Settings</span>
            </div>
          </div>
        </div>
      </header>

      {/* SETTINGS CONTENT */}

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8">
          {/* SIDEBAR */}

          <aside className="h-fit bg-gray-950 border border-gray-800 rounded-2xl p-4">
            <div className="mb-5 px-3">
              <h2 className="text-sm font-semibold text-gray-400">
                SETTINGS MENU
              </h2>
            </div>

            {settingsSections.map((section) => (
              <div key={section.title} className="mb-6">
                <p className="text-xs font-semibold text-gray-600 px-3 mb-3 tracking-wider">
                  {section.title}
                </p>

                <div className="space-y-1">
                  {section.items.map((item) => {
                    const isActive = activeSection === item.id;

                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveSection(item.id)}
                        className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-left transition ${
                          isActive
                            ? "bg-blue-600/15 text-blue-400 border border-blue-500/20"
                            : "text-gray-400 hover:bg-gray-900 hover:text-white"
                        }`}
                      >
                        <span className="text-lg">{item.icon}</span>

                        <span className="font-medium">{item.label}</span>

                        {isActive && (
                          <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* SIDEBAR FOOTER */}

            <div className="border-t border-gray-800 pt-4 px-3">
              <p className="text-xs text-gray-500">Revise AI</p>

              <p className="text-xs text-gray-600 mt-1">
                Personal Learning Dashboard
              </p>
            </div>
          </aside>

          {/* MAIN SETTINGS PANEL */}

          <section className="min-w-0">
            <div className="mb-6">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold">{activeItem?.label}</h2>

                <span className="text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1 rounded-full">
                  Settings
                </span>
              </div>

              <p className="text-gray-500 text-sm mt-2">
                Manage your {activeItem?.label.toLowerCase()} settings.
              </p>
            </div>

            {/* PROFILE */}

            {activeSection === "profile" && (
              <div className="bg-gray-950 border border-gray-800 rounded-2xl p-6">
                <h3 className="text-lg font-semibold mb-2">
                  Personal Information
                </h3>

                <p className="text-gray-500 text-sm mb-6">
                  Manage your personal account information.
                </p>

                <div className="flex items-center gap-5 mb-8">
                  <div className="w-20 h-20 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-2xl font-bold text-blue-400">
                    U
                  </div>

                  <div>
                    <h4 className="font-medium">Profile Picture</h4>

                    <p className="text-sm text-gray-500 mt-1">
                      Your profile picture will appear across Revise AI.
                    </p>

                    <button className="text-blue-400 text-sm mt-3 hover:text-blue-300">
                      Upload Picture
                    </button>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">
                      Full Name
                    </label>

                    <input
                      type="text"
                      placeholder="Enter your full name"
                      className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">
                      Email Address
                    </label>

                    <input
                      type="email"
                      placeholder="Enter your email"
                      disabled
                      className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-gray-500 outline-none cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="mt-8 flex justify-end">
                  <button className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 transition font-medium text-sm">
                    Save Changes
                  </button>
                </div>
              </div>
            )}

            {/* PLACEHOLDER FOR OTHER SECTIONS */}

            {activeSection !== "profile" && (
              <div className="bg-gray-950 border border-gray-800 rounded-2xl p-10 text-center">
                <div className="text-4xl mb-4">{activeItem?.icon}</div>

                <h3 className="text-xl font-semibold">{activeItem?.label}</h3>

                <p className="text-gray-500 text-sm mt-3">
                  This section will be implemented in the next development step.
                </p>

                <span className="inline-block mt-6 px-4 py-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs">
                  Coming Soon
                </span>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
