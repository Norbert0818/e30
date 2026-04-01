"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  const [hasVoted, setHasVoted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Létrehozunk egy függvényt, ami ellenőrzi a szervert
    const verifyVoteStatus = async () => {
      try {
        const res = await fetch("/api/vote");
        if (res.ok) {
          const data = await res.json();
          
          if (data.hasVoted) {
            // A szerveren megvan a szavazat
            setHasVoted(true);
            localStorage.setItem("userVoted", "true");
          } else {
            // AZ ADMIN RESETELT! (Nincs szavazat a szerveren)
            // Letöröljük a helyi adatokat is, hogy újra szavazhasson
            setHasVoted(false);
            localStorage.removeItem("userVoted");
            localStorage.removeItem("my_votes"); // Töröljük a megjegyzett rendszámokat is
          }
        }
      } catch (error) {
        // Ha valamiért nem elérhető a szerver, fallback a local storage-re
        const voted = localStorage.getItem("userVoted");
        if (voted) setHasVoted(true);
      } finally {
        setIsLoading(false);
      }
    };

    verifyVoteStatus();
  }, []);

  // Amíg a szerver válaszára várunk, ne mutassuk egyik gombot se (villogás elkerülése)
  if (isLoading) {
    return (
      <main className="min-h-[calc(100vh-80px)] bg-slate-50 flex items-center justify-center">
        <div className="text-xl font-bold text-slate-500 animate-pulse">Încărcare...</div>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-80px)] bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-3xl mx-auto text-center -mt-10 md:-mt-20">
        
        <div className="flex justify-center mb-8">
          <Image 
            src="/logo.jpg" 
            alt="BMW e30 Cluj" 
            width={280} 
            height={280} 
            className="rounded-full shadow-2xl border-4 border-slate-900"
            priority 
          />
        </div>
        
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-800 mb-6 tracking-tight leading-tight">
          Votează-ți <span className="text-blue-600">Favoritul</span>
        </h1>
        
        <div className="mt-8 md:mt-12 w-full bg-white p-6 md:p-10 rounded-3xl shadow-lg border border-slate-100">
          {hasVoted ? (
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-green-600 mb-4">Mulțumim! ✅</h2>
              <p className="text-lg text-slate-600 mb-6">Votul tău a fost înregistrat.</p>
              <Link 
                href="/vote" 
                className="inline-block w-full sm:w-auto bg-blue-600 text-white font-black text-lg md:text-2xl px-6 md:px-12 py-4 md:py-6 rounded-2xl shadow-xl hover:bg-blue-700 hover:shadow-2xl transition-all transform hover:-translate-y-1"
              >
                🗳️ Mergi la Buletinul de Vot
              </Link>
            </div>
          ) : (
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-4">Bun venit! 👋</h2>
              <p className="text-base md:text-lg text-slate-600 mb-8">
                Apasă pe butonul de mai jos pentru a vota. Nu este necesară autentificarea!
              </p>
              <Link 
                href="/vote" 
                className="inline-block w-full sm:w-auto bg-blue-600 text-white font-black text-lg md:text-2xl px-6 md:px-12 py-4 md:py-6 rounded-2xl shadow-xl hover:bg-blue-700 hover:shadow-2xl transition-all transform hover:-translate-y-1"
              >
                🗳️ Mergi la Buletinul de Vot
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}