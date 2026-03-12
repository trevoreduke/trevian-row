"use client";
import { useEffect, useState } from "react";

export default function PushSetup() {
  const [supported, setSupported] = useState(true);
  const [permission, setPermission] = useState<string>("default");

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setSupported(false);
      return;
    }
    setPermission(Notification.permission);
    navigator.serviceWorker.register("/sw.js");
  }, []);

  async function enable() {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    });
    await fetch("/api/push-subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sub.toJSON()),
    });
    setPermission("granted");
  }

  if (!supported || permission === "granted") return null;

  return (
    <div className="max-w-lg mx-auto px-4 mb-4">
      <button
        onClick={enable}
        className="w-full py-3 bg-yellow-500 text-yellow-900 font-bold rounded-xl text-sm hover:bg-yellow-400 transition-colors"
      >
        Enable Push Notifications for Crew Calls
      </button>
    </div>
  );
}
