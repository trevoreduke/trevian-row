"use client";
import { useAuth } from "@/lib/useAuth";
import LoginForm from "./LoginForm";
import Nav from "./Nav";
import PushSetup from "./PushSetup";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { user, loading, check } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-950">
        <div className="text-4xl animate-pulse">🚣</div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm onLogin={check} />;
  }

  if (user.status === "pending") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-950 to-blue-800 px-4">
        <div className="bg-white rounded-2xl p-8 max-w-sm text-center shadow-xl">
          <div className="text-5xl mb-4">⏳</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Waiting for Approval</h2>
          <p className="text-gray-600">
            A coach needs to approve your account before you can access the app.
          </p>
        </div>
      </div>
    );
  }

  if (user.status === "denied") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-950 to-blue-800 px-4">
        <div className="bg-white rounded-2xl p-8 max-w-sm text-center shadow-xl">
          <div className="text-5xl mb-4">🚫</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">Contact a coach if you think this is a mistake.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <PushSetup />
      {children}
      <Nav user={user} />
    </div>
  );
}
