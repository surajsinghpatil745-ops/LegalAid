import Link from "next/link";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/#scenarios", label: "Situations" },
  { href: "/documents", label: "Documents" },
  { href: "/ask", label: "Ask LegalAID" },
  { href: "/lawyers", label: "Find Legal Help" },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-saffron to-saffron-dark text-lg font-bold text-white shadow-sm">
            ⚖
          </span>
          <div>
            <span className="text-lg font-bold tracking-tight text-navy">LegalAID</span>
            <span className="hidden text-xs text-slate-500 sm:block">Your Personal Legal Guide</span>
          </div>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-navy"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
