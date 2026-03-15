// app/page.tsx
import Link from "next/link";
import Image from "next/image";
import { getServerSession } from "next-auth";
import { authOptions } from "../lib/auth";
import LoginButton from "../components/LoginButton"; // <--- BEIMPORTÁLJUK AZ ÚJ GOMBOT

export default async function Home() {
  const session = await getServerSession(authOptions);

  return (
    <main className="min-h-[calc(100vh-80px)] bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-3xl mx-auto text-center -mt-10 md:-mt-20">
        
        {/* ITT A LOGÓ! */}
        <div className="flex justify-center mb-8">
          <Image 
            src="/logo.jpg" 
            alt="BMW e30 Cluj & Brothers Meet" 
            width={280} 
            height={280} 
            className="rounded-full shadow-2xl border-4 border-slate-900"
            priority // Ez mondja meg a Next.js-nek, hogy ezt töltse be leggyorsabban
          />
        </div>
        
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-800 mb-6 tracking-tight leading-tight">
          Votează-ți <span className="text-blue-600">Favoritul</span>
        </h1>
        
        {session ? (
          <div className="mt-8 md:mt-12 w-full">
            <p className="text-lg md:text-2xl text-slate-600 mb-8 font-medium px-2">
              Salut, <span className="font-bold text-slate-800 break-words">{session.user?.name}</span>! <br className="hidden sm:block"/> Ești gata să îți exprimi voturile?
            </p>
            <Link 
              href="/vote" 
              className="inline-block w-full sm:w-auto bg-blue-600 text-white font-black text-lg md:text-2xl px-6 md:px-12 py-4 md:py-6 rounded-2xl shadow-xl hover:bg-blue-700 hover:shadow-2xl transition-all transform hover:-translate-y-2"
            >
              🗳️ Mergi la Buletinul de Vot
            </Link>
          </div>
        ) : (
          <div className="mt-8 md:mt-12 bg-white p-6 md:p-8 rounded-3xl shadow-lg border border-slate-100 w-full">
            <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-4">Bun venit pe platforma de votare! 👋</h2>
            <p className="text-base md:text-lg text-slate-600">
              Pentru a putea vota, te rugăm să te <strong>autentifici</strong> folosind contul tău Google făcând click pe butonul de mai jos.
            </p>
            
            {/* ITT JELENIK MEG AZ ÚJ GOMB */}
            <LoginButton />
            
          </div>
        )}

      </div>
    </main>
  );
}