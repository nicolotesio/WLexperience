"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/', label: 'Live Blog' },
  { href: '/report', label: 'Resoconto' },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="flex flex-col gap-4 rounded-[2rem] border border-slate-200 bg-white/90 px-5 py-4 shadow-soft backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between sm:px-7">
      <div>
        {/* Titolo Grande, in Grassetto e con Sfumatura Viola */}
        <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-brand-600 via-brand-500 to-purple-400">
          WL-EXPERIENCE
        </h1>
        {/* Sottotitolo: text-lg, colore scuro, ma NON in grassetto */}
        <p className="mt-0.5 text-lg text-slate-700">
          Diario alimentare condiviso
        </p>
      </div>
      
      {/* Nav: w-full su mobile per permettere ai link di espandersi */}
      <nav className="flex flex-col w-full items-center gap-2 text-base font-bold text-slate-700 sm:flex-row sm:w-auto">
        {links.map((item) => {
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                w-full text-center rounded-full px-5 py-2.5 text-lg transition-all duration-200 
                sm:w-auto focus:outline-none focus:ring-2 focus:ring-brand-200 active:scale-95
                ${isActive 
                  ? 'bg-brand-600 text-white shadow-md' 
                  : 'hover:bg-brand-50 hover:text-brand-700'
                }
              `}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}