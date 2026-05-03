import Link from 'next/link';

const links = [
  { href: '/', label: 'Live Blog' },
  { href: '/report', label: 'Resoconto' },
];

export default function Navbar() {
  return (
    <header className="flex flex-col gap-4 rounded-[2rem] border border-slate-200 bg-white/90 px-5 py-4 shadow-soft backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between sm:px-7">
      <div>
        {/* Titolo Grande, in Grassetto e con Sfumatura Viola */}
        <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-brand-600 via-brand-500 to-purple-400">
          WL-EXPERIENCE
        </h1>
        {/* Sottotitolo: stessa grandezza (text-lg) del testo in HomePage, ma font-bold e più scuro */}
        <p className="mt-0.5 text-lg font-bold text-slate-700">
          Diario alimentare condiviso
        </p>
      </div>
      <nav className="flex flex-wrap items-center gap-2 text-base font-bold text-slate-700">
        {links.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-full px-5 py-2.5 text-lg transition-all duration-200 hover:bg-brand-50 hover:text-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-200 active:scale-95"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}