"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User } from "@/lib/useAuth";

const tabs = [
  { href: "/feed", label: "Feed", icon: "📣" },
  { href: "/crew", label: "Crew Call", icon: "🚣" },
  { href: "/directory", label: "Team", icon: "👥" },
];

const adminTabs = [
  { href: "/lineup", label: "Lineup", icon: "⚡" },
  { href: "/admin", label: "Admin", icon: "⚙️" },
];

const coxswainTabs = [
  { href: "/lineup", label: "Lineup", icon: "⚡" },
];

export default function Nav({ user }: { user: User }) {
  const pathname = usePathname();
  const allTabs =
    user.role === "coach"
      ? [...tabs, ...adminTabs]
      : user.role === "coxswain"
      ? [...tabs, ...coxswainTabs]
      : tabs;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-bottom">
      <div className="flex justify-around max-w-lg mx-auto">
        {allTabs.map((tab) => {
          const active = pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center py-2 px-3 text-xs transition-colors ${
                active ? "text-blue-900 font-bold" : "text-gray-500"
              }`}
            >
              <span className="text-xl mb-0.5">{tab.icon}</span>
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
