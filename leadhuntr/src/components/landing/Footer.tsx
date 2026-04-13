import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border py-12">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <div className="col-span-2">
            <Link
              href="/"
              className="flex items-center gap-2 font-display font-bold text-lg mb-3"
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
            <p className="text-sm text-text-secondary max-w-xs">
              Reddit lead generation for SaaS founders and solopreneurs. Find
              high-intent prospects while you sleep.
            </p>
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-wider text-text-tertiary font-semibold mb-3">
              Product
            </h4>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li>
                <a href="#how" className="hover:text-text-primary">
                  How it works
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-text-primary">
                  Pricing
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-text-primary">
                  FAQ
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-wider text-text-tertiary font-semibold mb-3">
              Account
            </h4>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li>
                <Link href="/login" className="hover:text-text-primary">
                  Sign in
                </Link>
              </li>
              <li>
                <Link href="/signup" className="hover:text-text-primary">
                  Create account
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-text-tertiary">
          <span>© {new Date().getFullYear()} LeadHuntr. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-text-primary">
              Privacy
            </a>
            <a href="#" className="hover:text-text-primary">
              Terms
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
