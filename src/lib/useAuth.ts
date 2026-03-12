"use client";
import { useState, useEffect, useCallback } from "react";

export interface User {
  id: number;
  name: string;
  email: string;
  role: "coach" | "coxswain" | "rower";
  status: "pending" | "approved" | "denied";
  photo_url?: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const check = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      setUser(data.user || null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { check(); }, [check]);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
  };

  return { user, loading, check, logout };
}
