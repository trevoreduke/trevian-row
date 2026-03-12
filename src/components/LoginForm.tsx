"use client";
import { useState } from "react";

export default function LoginForm({ onLogin }: { onLogin: () => void }) {
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, name }),
    });
    setSending(false);
    if (res.ok) {
      setStep("code");
    } else {
      const data = await res.json();
      setError(data.error || "Something went wrong");
    }
  }

  async function handleCode(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setError("");
    const res = await fetch("/api/auth/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code }),
    });
    setSending(false);
    if (res.ok) {
      onLogin();
    } else {
      const data = await res.json();
      setError(data.error || "Invalid code");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-950 to-blue-800 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-6xl mb-3">🚣</div>
          <h1 className="text-3xl font-black text-white tracking-tight">TREVIAN OAR</h1>
          <p className="text-blue-300 text-sm mt-1">New Trier Crew</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-xl">
          {step === "email" ? (
            <form onSubmit={handleEmail} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Smith"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@newtrier.org"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={sending}
                className="w-full py-3 bg-blue-900 text-white font-bold rounded-xl hover:bg-blue-800 disabled:opacity-50 transition-colors"
              >
                {sending ? "Sending..." : "Get Login Code"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleCode} className="space-y-4">
              <p className="text-sm text-gray-600 text-center">
                Check your email for a 6-digit code
              </p>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                placeholder="000000"
                className="w-full px-4 py-4 rounded-xl border border-gray-200 text-center text-2xl tracking-[0.5em] font-mono focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                autoFocus
              />
              <button
                type="submit"
                disabled={sending || code.length !== 6}
                className="w-full py-3 bg-blue-900 text-white font-bold rounded-xl hover:bg-blue-800 disabled:opacity-50 transition-colors"
              >
                {sending ? "Verifying..." : "Sign In"}
              </button>
              <button
                type="button"
                onClick={() => { setStep("email"); setCode(""); }}
                className="w-full text-sm text-gray-500 hover:text-gray-700"
              >
                Use a different email
              </button>
            </form>
          )}
          {error && <p className="mt-3 text-sm text-red-600 text-center">{error}</p>}
        </div>
      </div>
    </div>
  );
}
