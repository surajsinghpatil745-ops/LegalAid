export default function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-navy text-slate-300">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <h3 className="mb-3 text-lg font-semibold text-white">LegalAID</h3>
            <p className="text-sm leading-relaxed">
              Empowering Indians with accessible legal knowledge. Know your rights, understand the law,
              and find help when you need it.
            </p>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white">
              Emergency Helplines
            </h3>
            <ul className="space-y-2 text-sm">
              <li>NALSA (Free Legal Aid): <strong className="text-white">15100</strong></li>
              <li>Police: <strong className="text-white">100</strong></li>
              <li>Women Helpline: <strong className="text-white">1091</strong></li>
              <li>Cyber Crime: <strong className="text-white">1930</strong></li>
            </ul>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white">
              Disclaimer
            </h3>
            <p className="text-sm leading-relaxed">
              LegalAID provides general legal information for educational purposes only. It is not a
              substitute for professional legal advice from a qualified advocate.
            </p>
          </div>
        </div>
        <div className="mt-8 border-t border-slate-700 pt-6 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} LegalAID. Built to make Indian law accessible to everyone.
        </div>
      </div>
    </footer>
  );
}
