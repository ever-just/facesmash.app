import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex flex-col justify-center text-center flex-1 px-4 py-16 max-w-4xl mx-auto">
      <div className="text-6xl mb-6">😎</div>
      <h1 className="text-4xl font-extrabold mb-4 tracking-tight">
        FaceSmash Developer Docs
      </h1>
      <p className="text-lg text-fd-muted-foreground mb-8 max-w-2xl mx-auto">
        Add passwordless facial recognition to any app. FaceSmash handles face detection,
        quality analysis, template matching, and identity verification — all running in the browser.
      </p>

      <div className="grid gap-4 sm:grid-cols-2 max-w-xl mx-auto w-full">
        <Link
          href="/docs"
          className="flex flex-col items-center gap-2 rounded-xl border bg-fd-card p-6 text-fd-card-foreground shadow-sm transition-colors hover:bg-fd-accent"
        >
          <span className="text-2xl">📖</span>
          <span className="font-semibold">Getting Started</span>
          <span className="text-sm text-fd-muted-foreground">
            Learn the basics and integrate FaceSmash
          </span>
        </Link>

        <Link
          href="/docs/api-reference"
          className="flex flex-col items-center gap-2 rounded-xl border bg-fd-card p-6 text-fd-card-foreground shadow-sm transition-colors hover:bg-fd-accent"
        >
          <span className="text-2xl">🔌</span>
          <span className="font-semibold">API Reference</span>
          <span className="text-sm text-fd-muted-foreground">
            REST API endpoints and SDK methods
          </span>
        </Link>

        <Link
          href="/docs/sdk"
          className="flex flex-col items-center gap-2 rounded-xl border bg-fd-card p-6 text-fd-card-foreground shadow-sm transition-colors hover:bg-fd-accent"
        >
          <span className="text-2xl">📦</span>
          <span className="font-semibold">JavaScript SDK</span>
          <span className="text-sm text-fd-muted-foreground">
            Drop-in components for React and vanilla JS
          </span>
        </Link>

        <Link
          href="/docs/guides"
          className="flex flex-col items-center gap-2 rounded-xl border bg-fd-card p-6 text-fd-card-foreground shadow-sm transition-colors hover:bg-fd-accent"
        >
          <span className="text-2xl">🛠️</span>
          <span className="font-semibold">Guides</span>
          <span className="text-sm text-fd-muted-foreground">
            Step-by-step tutorials and best practices
          </span>
        </Link>
      </div>

      <p className="text-sm text-fd-muted-foreground mt-12">
        Built by{' '}
        <Link href="https://everjust.co" className="font-medium underline" target="_blank">
          EVERJUST
        </Link>
      </p>
    </div>
  );
}
