"use client";

import { useEffect, useState } from "react";

const API = "http://localhost:5000/api/auth";

interface UserSettings {
  learningPreferences: {
    goal: string;
    subjects: string[];
    studyLevel: string;
  };
  appearance: {
    theme: "dark" | "light";
  };
  aiPreferences: {
    summaryLength: "short" | "medium" | "detailed";
    quizDifficulty: "easy" | "medium" | "hard";
    questionCount: number;
  };
  notifications: {
    emailUpdates: boolean;
    studyReminders: boolean;
  };
}

const defaultSettings: UserSettings = {
  learningPreferences: {
    goal: "Exam Preparation",
    subjects: [],
    studyLevel: "Beginner",
  },
  appearance: {
    theme: "dark",
  },
  aiPreferences: {
    summaryLength: "medium",
    quizDifficulty: "medium",
    questionCount: 10,
  },
  notifications: {
    emailUpdates: true,
    studyReminders: true,
  },
};

const sections = [
  { id: "profile", label: "My Profile", icon: "👤" },
  { id: "learning", label: "Learning", icon: "📚" },
  { id: "appearance", label: "Appearance", icon: "🎨" },
  { id: "ai", label: "AI Preferences", icon: "🤖" },
  { id: "notifications", label: "Notifications", icon: "🔔" },
  { id: "security", label: "Security", icon: "🔒" },
  { id: "support", label: "Help & Support", icon: "💬" },
];

export default function SettingsPanel() {
  const [activeTab, setActiveTab] = useState("profile");

  const [user, setUser] = useState({
    name: "",
    email: "",
    emailVerified: false,
    createdAt: "",
  });

  const [settings, setSettings] = useState<UserSettings>(defaultSettings);

  const [subjectInput, setSubjectInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Load logged-in user's data
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setError("Please log in again.");
          return;
        }

        const response = await fetch(`${API}/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load profile");
        }

        const currentUser = data.user;

        setUser({
          name: currentUser.name || "",
          email: currentUser.email || "",
          emailVerified: currentUser.emailVerified || false,
          createdAt: currentUser.createdAt || "",
        });

        setSettings({
          learningPreferences: {
            ...defaultSettings.learningPreferences,
            ...(currentUser.settings?.learningPreferences || {}),
          },
          appearance: {
            ...defaultSettings.appearance,
            ...(currentUser.settings?.appearance || {}),
          },
          aiPreferences: {
            ...defaultSettings.aiPreferences,
            ...(currentUser.settings?.aiPreferences || {}),
          },
          notifications: {
            ...defaultSettings.notifications,
            ...(currentUser.settings?.notifications || {}),
          },
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  // Update individual settings
  const updateSettings = (
    section: keyof UserSettings,
    key: string,
    value: string | number | boolean,
  ) => {
    setSettings((previous) => ({
      ...previous,
      [section]: {
        ...previous[section],
        [key]: value,
      },
    }));
  };

  // Add a learning subject
  const addSubject = () => {
    const subject = subjectInput.trim();

    if (
      !subject ||
      settings.learningPreferences.subjects.some(
        (item) => item.toLowerCase() === subject.toLowerCase(),
      )
    ) {
      return;
    }

    setSettings((previous) => ({
      ...previous,
      learningPreferences: {
        ...previous.learningPreferences,
        subjects: [...previous.learningPreferences.subjects, subject],
      },
    }));

    setSubjectInput("");
  };

  // Remove a learning subject
  const removeSubject = (subject: string) => {
    setSettings((previous) => ({
      ...previous,
      learningPreferences: {
        ...previous.learningPreferences,
        subjects: previous.learningPreferences.subjects.filter(
          (item) => item !== subject,
        ),
      },
    }));
  };

  // Save settings
  const saveSettings = async () => {
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Please log in again.");
      }

      const response = await fetch(`${API}/settings`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: user.name,
          settings,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to save settings");
      }

      if (data.user) {
        setUser((previous) => ({
          ...previous,
          name: data.user.name || previous.name,
        }));
      }

      setMessage("Your settings have been saved successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500";

  const cardClass =
    "rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6";

  const renderSelect = (
    label: string,
    value: string | number,
    options: (string | number)[],
    onChange: (value: string) => void,
  ) => (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-300">
        {label}
      </label>

      <select
        className={inputClass}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );

  const renderToggle = (
    label: string,
    description: string,
    checked: boolean,
    onChange: (value: boolean) => void,
  ) => (
    <div className="flex items-center justify-between gap-4 border-b border-slate-800 py-4 last:border-0">
      <div>
        <p className="font-medium text-white">{label}</p>
        <p className="mt-1 text-sm text-slate-400">{description}</p>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
          checked ? "bg-blue-600" : "bg-slate-700"
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
            checked ? "left-6" : "left-1"
          }`}
        />
      </button>
    </div>
  );

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center text-slate-400">
        Loading your settings...
      </div>
    );
  }

  return (
    <div className="space-y-6 text-white">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-medium text-blue-400">PERSONALIZATION</p>
          <h2 className="mt-1 text-2xl font-bold">Settings</h2>
          <p className="mt-2 text-sm text-slate-400">
            Manage your account and customize your learning experience.
          </p>
        </div>

        <button
          onClick={saveSettings}
          disabled={saving}
          className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {/* Messages */}
      {message && (
        <div className="rounded-xl border border-green-800 bg-green-950/40 p-4 text-sm text-green-400">
          ✓ {message}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-800 bg-red-950/40 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Settings Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[240px_1fr]">
        {/* Sidebar */}
        <aside className="h-fit rounded-2xl border border-slate-800 bg-slate-900 p-3">
          <p className="px-3 py-3 text-xs font-semibold tracking-wider text-slate-500">
            SETTINGS MENU
          </p>

          <div className="space-y-1">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveTab(section.id)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition ${
                  activeTab === section.id
                    ? "bg-blue-600/15 font-semibold text-blue-400"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <span>{section.icon}</span>
                {section.label}
              </button>
            ))}
          </div>
        </aside>

        {/* Main Content */}
        <main className="min-w-0 space-y-5">
          {/* PROFILE */}
          {activeTab === "profile" && (
            <section className={cardClass}>
              <h3 className="text-lg font-semibold">My Profile</h3>
              <p className="mt-1 text-sm text-slate-400">
                Your personal account information.
              </p>

              <div className="mt-6 flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600/20 text-2xl font-bold text-blue-400">
                  {user.name.charAt(0).toUpperCase() || "U"}
                </div>

                <div>
                  <p className="text-lg font-semibold">{user.name}</p>
                  <p className="text-sm text-slate-400">{user.email}</p>
                </div>
              </div>

              <div className="mt-6 space-y-5">
                <div>
                  <label className="mb-2 block text-sm text-slate-300">
                    Full Name
                  </label>

                  <input
                    className={inputClass}
                    value={user.name}
                    onChange={(e) =>
                      setUser((previous) => ({
                        ...previous,
                        name: e.target.value,
                      }))
                    }
                    placeholder="Enter your name"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-slate-300">
                    Email Address
                  </label>

                  <input
                    className={`${inputClass} cursor-not-allowed opacity-60`}
                    value={user.email}
                    disabled
                  />

                  <p className="mt-2 text-xs text-slate-500">
                    Email address cannot be changed here.
                  </p>
                </div>

                <div className="flex items-center justify-between rounded-xl bg-slate-950 p-4">
                  <div>
                    <p className="text-sm font-medium">Email Verification</p>
                    <p className="mt-1 text-xs text-slate-400">
                      Account verification status
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      user.emailVerified
                        ? "bg-green-500/10 text-green-400"
                        : "bg-yellow-500/10 text-yellow-400"
                    }`}
                  >
                    {user.emailVerified ? "Verified" : "Not Verified"}
                  </span>
                </div>

                <div className="text-sm text-slate-400">
                  Account created:{" "}
                  {user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString()
                    : "Not available"}
                </div>
              </div>
            </section>
          )}

          {/* LEARNING */}
          {activeTab === "learning" && (
            <section className={cardClass}>
              <h3 className="text-lg font-semibold">Learning Preferences</h3>
              <p className="mt-1 text-sm text-slate-400">
                Customize your learning goals and subjects.
              </p>

              <div className="mt-6 space-y-5">
                {renderSelect(
                  "Learning Goal",
                  settings.learningPreferences.goal,
                  [
                    "Exam Preparation",
                    "Interview Preparation",
                    "Skill Development",
                    "General Learning",
                  ],
                  (value) =>
                    updateSettings("learningPreferences", "goal", value),
                )}

                {renderSelect(
                  "Study Level",
                  settings.learningPreferences.studyLevel,
                  ["Beginner", "Intermediate", "Advanced"],
                  (value) =>
                    updateSettings("learningPreferences", "studyLevel", value),
                )}

                <div>
                  <label className="mb-2 block text-sm text-slate-300">
                    Your Subjects
                  </label>

                  <div className="flex gap-2">
                    <input
                      className={inputClass}
                      value={subjectInput}
                      onChange={(e) => setSubjectInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addSubject();
                        }
                      }}
                      placeholder="Add a subject..."
                    />

                    <button
                      type="button"
                      onClick={addSubject}
                      className="rounded-xl bg-blue-600 px-5 font-semibold hover:bg-blue-500"
                    >
                      Add
                    </button>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {settings.learningPreferences.subjects.map((subject) => (
                      <span
                        key={subject}
                        className="flex items-center gap-2 rounded-lg border border-blue-500/20 bg-blue-500/10 px-3 py-2 text-sm text-blue-300"
                      >
                        {subject}

                        <button
                          type="button"
                          onClick={() => removeSubject(subject)}
                          className="text-blue-300 hover:text-red-400"
                          aria-label={`Remove ${subject}`}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* APPEARANCE */}
          {activeTab === "appearance" && (
            <section className={cardClass}>
              <h3 className="text-lg font-semibold">Appearance</h3>
              <p className="mt-1 text-sm text-slate-400">
                Choose how Revise AI looks.
              </p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {(["dark", "light"] as const).map((theme) => (
                  <button
                    key={theme}
                    onClick={() => updateSettings("appearance", "theme", theme)}
                    className={`rounded-2xl border p-5 text-left transition ${
                      settings.appearance.theme === theme
                        ? "border-blue-500 bg-blue-500/10"
                        : "border-slate-700 bg-slate-950 hover:border-slate-500"
                    }`}
                  >
                    <div
                      className={`mb-4 h-20 rounded-xl border ${
                        theme === "dark"
                          ? "border-slate-700 bg-slate-800"
                          : "border-slate-300 bg-slate-100"
                      }`}
                    />

                    <p className="font-semibold capitalize">{theme} Mode</p>

                    <p className="mt-1 text-xs text-slate-400">
                      {theme === "dark"
                        ? "A comfortable dark interface."
                        : "A bright and clean interface."}
                    </p>

                    {settings.appearance.theme === theme && (
                      <p className="mt-3 text-xs font-semibold text-blue-400">
                        ✓ Selected
                      </p>
                    )}
                  </button>
                ))}
              </div>

              <p className="mt-4 text-xs text-slate-500">
                Theme selection is saved to your account. Applying the selected
                theme across the entire dashboard requires connecting it to your
                global theme styles.
              </p>
            </section>
          )}

          {/* AI PREFERENCES */}
          {activeTab === "ai" && (
            <section className={cardClass}>
              <h3 className="text-lg font-semibold">AI Preferences</h3>
              <p className="mt-1 text-sm text-slate-400">
                Customize how Revise AI generates learning content.
              </p>

              <div className="mt-6 space-y-5">
                {renderSelect(
                  "Summary Length",
                  settings.aiPreferences.summaryLength,
                  ["short", "medium", "detailed"],
                  (value) =>
                    updateSettings("aiPreferences", "summaryLength", value),
                )}

                {renderSelect(
                  "Quiz Difficulty",
                  settings.aiPreferences.quizDifficulty,
                  ["easy", "medium", "hard"],
                  (value) =>
                    updateSettings("aiPreferences", "quizDifficulty", value),
                )}

                {renderSelect(
                  "Number of Quiz Questions",
                  settings.aiPreferences.questionCount,
                  [5, 10, 15, 20],
                  (value) =>
                    updateSettings(
                      "aiPreferences",
                      "questionCount",
                      Number(value),
                    ),
                )}
              </div>
            </section>
          )}

          {/* NOTIFICATIONS */}
          {activeTab === "notifications" && (
            <section className={cardClass}>
              <h3 className="text-lg font-semibold">Notifications</h3>
              <p className="mt-1 text-sm text-slate-400">
                Control your notification preferences.
              </p>

              <div className="mt-5">
                {renderToggle(
                  "Email Updates",
                  "Receive important updates through email.",
                  settings.notifications.emailUpdates,
                  (value) =>
                    updateSettings("notifications", "emailUpdates", value),
                )}

                {renderToggle(
                  "Study Reminders",
                  "Receive reminders to continue studying.",
                  settings.notifications.studyReminders,
                  (value) =>
                    updateSettings("notifications", "studyReminders", value),
                )}
              </div>

              <p className="mt-4 text-xs text-slate-500">
                These preferences are saved in your account. Actual email and
                reminder delivery needs a notification service.
              </p>
            </section>
          )}

          {/* SECURITY */}
          {activeTab === "security" && (
            <section className={cardClass}>
              <h3 className="text-lg font-semibold">Security & Privacy</h3>
              <p className="mt-1 text-sm text-slate-400">
                Information about your account security.
              </p>

              <div className="mt-6 space-y-4">
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                  <p className="font-medium">Password</p>
                  <p className="mt-1 text-sm text-slate-400">
                    Your password is securely stored as a hash.
                  </p>
                  <p className="mt-3 text-xs text-slate-500">
                    Password changes are not yet available in Settings.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                  <p className="font-medium">Authentication</p>
                  <p className="mt-1 text-sm text-slate-400">
                    Your account uses token-based authentication.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                  <p className="font-medium">Account Privacy</p>
                  <p className="mt-1 text-sm text-slate-400">
                    Your preferences are associated with your authenticated
                    account.
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* SUPPORT */}
          {activeTab === "support" && (
            <section className={cardClass}>
              <h3 className="text-lg font-semibold">Help & Support</h3>
              <p className="mt-1 text-sm text-slate-400">
                Need help using Revise AI?
              </p>

              <div className="mt-6 space-y-4">
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                  <p className="font-medium">Getting Started</p>
                  <p className="mt-1 text-sm text-slate-400">
                    Upload your study material to generate summaries and
                    quizzes.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                  <p className="font-medium">Account Issues</p>
                  <p className="mt-1 text-sm text-slate-400">
                    Check that you are logged in with your registered email.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                  <p className="font-medium">Feedback</p>
                  <p className="mt-1 text-sm text-slate-400">
                    Your feedback can help improve Revise AI.
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={saveSettings}
              disabled={saving}
              className="rounded-xl bg-blue-600 px-7 py-3 font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
