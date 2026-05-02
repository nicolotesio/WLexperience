import Link from 'next/link';

const links = [
  { href: '/', label: 'Live Blog' },
  { href: '/report', label: 'Resoconto' },
];

export default function Navbar() {
  return (
    <header className="flex flex-col gap-4 rounded-[2rem] border border-slate-200 bg-white/90 px-5 py-4 shadow-soft backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between sm:px-7">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-600">WL-EXPERIENCE</p>
        <p className="mt-1 text-lg font-semibold text-slate-900">Diario alimentare condiviso</p>
      </div>
      <nav className="flex flex-wrap items-center gap-3 text-sm font-medium text-slate-700">
        {links.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-full px-4 py-2 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-200"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
