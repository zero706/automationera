import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import type { Profile } from "@/types";

interface HeaderProps {
  profile: Profile;
}

export function Header({ profile }: HeaderProps) {
  const initials = (profile.full_name ?? profile.email)
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="sticky top-0 z-20 h-16 flex items-center justify-between px-6 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <div className="md:hidden font-display font-bold text-gradient">
          LeadHuntr
        </div>
        <div className="hidden md:block text-sm text-text-secondary">
          Welcome back,{" "}
          <span className="text-text-primary">
            {profile.full_name ?? profile.email.split("@")[0]}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Badge variant={profile.plan === "free" ? "outline" : "primary"}>
          {profile.plan}
        </Badge>
        {profile.plan === "free" && (
          <Link
            href="/dashboard/billing"
            className="text-xs text-primary-300 hover:text-primary-200 font-medium"
          >
            Upgrade →
          </Link>
        )}
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-xs font-bold text-white">
          {initials}
        </div>
      </div>
    </header>
  );
}
