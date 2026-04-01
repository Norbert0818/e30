"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession, signIn, signOut } from "next-auth/react";
import { useState } from "react";

export default function Navbar() {
  const { data: session } = useSession();
  const role = (session?.user as any)?.role;
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const closeMenu = () => setIsMenuOpen(false);

  const isAdminOrSuperadmin = role === "admin" || role === "superadmin";

  return (
    <nav className="bg-slate-900 text-white shadow-lg sticky top-0 z-50">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex justify-between items-center h-20">
          
          {/* BAL OLDAL: Logo ÉS Asztali Linkek */}
          <div className="flex items-center gap-4 lg:gap-8">
            <Link href="/" onClick={closeMenu} className="flex items-center gap-3 text-xl md:text-2xl font-black text-blue-400 shrink-0 hover:opacity-80 transition">
              <Image 
                src="/logo_bg.png" 
                alt="Logo" 
                width={40} 
                height={40} 
                className="rounded-full border border-slate-700"
              />
              <span className="text-lg md:text-xl font-black text-white shrink-0">BMW E30 Cluj & Brothers</span>
            </Link>

            {/* Asztali menü */}
            <div className="hidden md:flex items-center gap-4 lg:gap-6 font-bold text-slate-300">
              <Link href="/vote" className="hover:text-white transition">🗳️ Votare</Link>
              
              {/* CSAK ADMINOKNAK LÁTHATÓ LINKEK */}
              {isAdminOrSuperadmin && (
                <>
                  <Link href="/results" className="hover:text-white transition">🏆 Rezultate</Link>
                  <Link href="/admin" className="hover:text-amber-400 text-amber-500 transition">🛠️ Admin</Link>
                </>
              )}
              
              {role === "superadmin" && (
                <Link href="/superadmin" className="hover:text-purple-400 text-purple-400 transition">👑 SuperAdmin</Link>
              )}
            </div>
          </div>

          {/* JOBB OLDAL: Profil ÉS Kilépés / Belépés gomb */}
          <div className="flex items-center gap-4">
            {session ? (
              <div className="hidden md:flex items-center gap-4">
                <div className="text-right">
                  <div className="font-bold text-sm leading-tight">{session.user?.name}</div>
                  <div className="text-xs text-slate-400 hidden lg:block">{session.user?.email}</div>
                </div>
                <img src={session.user?.image || ""} alt="Avatar" className="w-10 h-10 rounded-full border-2 border-blue-500 shrink-0" />
                <button onClick={() => signOut({ callbackUrl: '/' })} className="bg-red-500/10 text-red-500 border border-red-500 px-4 py-2 rounded-lg hover:bg-red-500 hover:text-white transition font-bold text-sm shrink-0">
                  Deconectare
                </button>
              </div>
            ) : (
              <div className="hidden md:block">
                <button onClick={() => signIn("google")} className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-bold transition shadow-lg">
                  Autentificare
                </button>
              </div>
            )}

            {/* Mobil Hamburger Gomb */}
            <button 
              className="md:hidden p-2 text-slate-300 hover:text-white"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobil menü lenyíló része */}
      {isMenuOpen && (
        <div className="md:hidden bg-slate-800 border-t border-slate-700">
          <div className="px-4 pt-2 pb-6 space-y-2 flex flex-col">
            
            {/* Publikus linkek */}
            <Link href="/vote" onClick={closeMenu} className="block px-4 py-4 text-lg font-bold text-slate-200 bg-slate-700/50 rounded-xl hover:bg-slate-700 mt-2">🗳️ Votare</Link>

            {!session ? (
              <button onClick={() => { closeMenu(); signIn("google"); }} className="w-full bg-blue-600 text-white text-center px-4 py-4 rounded-xl font-bold mt-4">
                Autentificare cu Google
              </button>
            ) : (
              <>
                <div className="flex items-center gap-3 p-4 bg-slate-900 rounded-xl mb-4 mt-4">
                  <img src={session.user?.image || ""} alt="Avatar" className="w-12 h-12 rounded-full border-2 border-blue-500 shrink-0" />
                  <div className="min-w-0">
                    <div className="font-bold text-white truncate">{session.user?.name}</div>
                    <div className="text-xs text-slate-400 truncate">{session.user?.email}</div>
                  </div>
                </div>
                
                {/* CSAK ADMINOKNAK LÁTHATÓ LINKEK (MOBIL) */}
                {isAdminOrSuperadmin && (
                  <>
                    <Link href="/results" onClick={closeMenu} className="block px-4 py-4 text-lg font-bold text-slate-200 bg-slate-700/50 rounded-xl hover:bg-slate-700">🏆 Rezultate</Link>
                    <Link href="/admin" onClick={closeMenu} className="block px-4 py-4 text-lg font-bold text-amber-400 bg-slate-700/50 rounded-xl hover:bg-slate-700">🛠️ Panel Admin</Link>
                  </>
                )}
                
                {role === "superadmin" && (
                  <Link href="/superadmin" onClick={closeMenu} className="block px-4 py-4 text-lg font-bold text-purple-400 bg-slate-700/50 rounded-xl hover:bg-slate-700">👑 SuperAdmin</Link>
                )}

                <button onClick={() => { closeMenu(); signOut({ callbackUrl: '/' }); }} className="w-full text-center px-4 py-4 mt-4 text-lg font-bold text-red-400 border-2 border-red-500/30 rounded-xl hover:bg-red-500/10">
                  Deconectare
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}