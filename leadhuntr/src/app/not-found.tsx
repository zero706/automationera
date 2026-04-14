import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4 mesh-bg">
      <div className="text-center">
        <div className="text-7xl font-bold font-display text-gradient mb-3">
          404
        </div>
        <h1 className="text-2xl font-bold font-display mb-2">Page not found</h1>
        <p className="text-text-secondary mb-6">
          The page you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link
          href="/"
          className="inline-flex items-center bg-primary hover:bg-primary-600 text-white font-medium px-5 h-10 rounded-lg shadow-glow"
        >
          Back home
        </Link>
      </div>
    </main>
  );
}
