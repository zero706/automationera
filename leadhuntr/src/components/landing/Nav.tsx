import Link from "next/link";

export function Nav() {
  return (
    <nav className="sticky top-0 z-30 backdrop-blur-xl bg-background/70 border-b border-border">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 font-display font-bold text-lg"
        >
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <span className="text-gradient">LeadHuntr</span>
        </Link>
        <div className="hidden md:flex items-center gap-7 text-sm text-text-secondary">
          <a href="#how" className="hover:text-text-primary transition-colors">
            How it works
          </a>
          <a
            href="#pricing"
            className="hover:text-text-primary transition-colors"
          >
            Pricing
          </a>
          <a href="#faq" className="hover:text-text-primary transition-colors">
            FAQ
          </a>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="text-sm text-text-secondary hover:text-text-primary px-3"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="text-sm font-medium bg-primary hover:bg-primary-600 text-white px-4 h-9 rounded-lg flex items-center transition-all shadow-glow"
          >
            Start free
          </Link>
        </div>
      </div>
    </nav>
  );
}
