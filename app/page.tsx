"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  const [hasVoted, setHasVoted] = useState(false);

  useEffect(() => {
    const voted = localStorage.getItem("userVoted");
    if (voted) setHasVoted(true);
  }, []);

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
              <Link href="/results" className="inline-block bg-slate-800 text-white font-bold px-8 py-4 rounded-xl hover:bg-slate-900 transition-all">
                Vezi Rezultatele
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