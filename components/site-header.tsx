import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="site-header border-b border-slate-200 bg-white/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="brand-mark text-xl font-bold text-slate-900">
          Animal<span>Care</span>
        </Link>
        <nav className="site-nav hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
          <Link href="/providers">Find care</Link>
          <Link href="/ai">AI Care Navigator</Link>
          <Link href="/medical">Medical docs</Link>
          <Link href="/animals">Animal profile</Link>
        </nav>
        <Link
          href="/login"
          className="header-login rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
        >
          Login
        </Link>
      </div>
    </header>
  );
}
