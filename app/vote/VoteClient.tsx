// app/vote/VoteClient.tsx
"use client";

import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";

export default function VoteClient({ categories, userVotes, isVotingOpen }: { categories: any[], userVotes: any[], isVotingOpen: boolean }) {
  
  // 1. Eltároljuk a MÁR LEADOTT szavazatokat
  const [submittedVotes, setSubmittedVotes] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    userVotes.forEach(vote => { initial[vote.categoryId] = vote.answer; });
    return initial;
  });

  // 2. Eltároljuk az épp gépelt szövegeket (csak amíg nem küldi be)
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  const handleVote = async (categoryId: string) => {
    if (!isVotingOpen) {
      toast.error("Votarea este închisă!");
      return;
    }

    const rawAnswer = answers[categoryId];
    if (!rawAnswer || rawAnswer.trim() === "") {
      toast.error("Te rugăm să introduci un număr de înmatriculare!");
      return;
    }

    const formattedAnswer = rawAnswer.toUpperCase().replace(/[\s-]/g, '');
    const plateRegex = /^[A-Z]{1,2}\d{2,3}[A-Z]{3}$/;
    
    if (!plateRegex.test(formattedAnswer)) {
      toast.error("Număr de înmatriculare invalid! Format: SJ15TRH sau B115KJH");
      return;
    }

    setLoading(prev => ({ ...prev, [categoryId]: true }));

    const res = await fetch("/api/vote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ categoryId, answer: formattedAnswer })
    });

    if (res.ok) {
      toast.success("Vot salvat!");
      // Áttesszük a LEADOTT szavazatok közé
      setSubmittedVotes(prev => ({ ...prev, [categoryId]: formattedAnswer }));
      // Kiürítjük a gépelős mezőt
      setAnswers(prev => ({ ...prev, [categoryId]: "" }));
    } else {
      const errorData = await res.json();
      toast.error(errorData.error || "A apărut o eroare.");
    }

    setLoading(prev => ({ ...prev, [categoryId]: false }));
  };

  const handleDelete = async (categoryId: string) => {
    if (!isVotingOpen) {
      toast.error("Votarea este închisă!");
      return;
    }

    setLoading(prev => ({ ...prev, [categoryId]: true }));

    const res = await fetch("/api/vote", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ categoryId })
    });

    if (res.ok) {
      toast.success("Vot șters! Acum poți trimite unul nou.");
      // Kiszedjük a LEADOTT szavazatok közül, így újra megjelenik a beviteli mező!
      const newSubmitted = { ...submittedVotes };
      delete newSubmitted[categoryId];
      setSubmittedVotes(newSubmitted);
    } else {
      const errorData = await res.json();
      toast.error(errorData.error || "A apărut o eroare.");
    }

    setLoading(prev => ({ ...prev, [categoryId]: false }));
  };

  return (
    <div className="max-w-3xl mx-auto p-6 py-12">
      <Toaster position="top-center" />
      <h1 className="text-4xl md:text-5xl font-black text-slate-800 mb-4 text-center">🗳️ Buletin de Vot</h1>
      
      {!isVotingOpen ? (
        <div className="bg-red-100 border-2 border-red-500 text-red-700 p-6 rounded-2xl mb-10 text-center shadow-md">
          <h2 className="text-2xl font-black mb-2">Votarea este momentan închisă! 🛑</h2>
          <p className="font-bold">Nu mai poți trimite răspunsuri noi sau modifica cele existente.</p>
        </div>
      ) : (
        <p className="text-center text-slate-500 mb-10 text-lg">Introdu răspunsurile tale la întrebările de mai jos!</p>
      )}

      <div className="space-y-6">
        {categories.map(cat => {
          const hasVoted = !!submittedVotes[cat.id]; // Szavazott-e már ide?
          const votedAnswer = submittedVotes[cat.id];

          return (
            <div key={cat.id} className={`bg-white p-6 md:p-8 rounded-3xl shadow-lg border-2 transition ${!isVotingOpen ? 'border-red-100 opacity-80' : hasVoted ? 'border-green-200' : 'border-slate-100 hover:border-blue-100'}`}>
              <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-6">{cat.name}</h2>
              
              {hasVoted ? (
                // 1. ÁLLAPOT: MÁR SZAVAZOTT (Rendszámtábla nézet)
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-50 p-4 rounded-2xl border-2 border-green-200">
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <span className="text-green-600 font-bold hidden sm:block shrink-0">✓ Votul tău:</span>
                    
                    {/* Román rendszámtábla dizájn */}
                    <div className="flex items-center border-2 border-slate-400 rounded-md overflow-hidden shadow-sm bg-white w-full sm:w-auto">
                      <div className="bg-blue-700 w-8 h-12 flex flex-col justify-between items-center py-1 shrink-0">
                        <span className="text-white font-bold text-[9px] mt-auto">RO</span>
                      </div>
                      <div className="h-12 px-4 flex-1 flex items-center justify-center font-black text-xl tracking-widest text-black">
                        {votedAnswer}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(cat.id)}
                    disabled={loading[cat.id] || !isVotingOpen}
                    className={`px-6 py-3 rounded-xl font-bold transition shadow-sm w-full sm:w-auto shrink-0 ${!isVotingOpen ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-red-100 text-red-600 hover:bg-red-200 active:scale-95'}`}
                  >
                    {loading[cat.id] ? "În curs..." : "Ștergere"}
                  </button>
                </div>
              ) : (
                // 2. ÁLLAPOT: MÉG NEM SZAVAZOTT (Üres beviteli mező)
                <div className="flex flex-col sm:flex-row gap-4">
                  <input
                    type="text"
                    value={answers[cat.id] || ""}
                    onChange={(e) => {
                      const cleanValue = e.target.value.toUpperCase().replace(/[\s-]/g, '');
                      setAnswers({ ...answers, [cat.id]: cleanValue });
                    }}
                    placeholder="Ex: SJ15TRH"
                    disabled={!isVotingOpen}
                    maxLength={7}
                    className="flex-1 border-2 border-slate-200 rounded-xl p-4 outline-none focus:border-blue-500 font-bold text-xl text-center md:text-left bg-slate-50 disabled:bg-slate-200 disabled:cursor-not-allowed uppercase tracking-widest"
                  />
                  <button
                    onClick={() => handleVote(cat.id)}
                    disabled={loading[cat.id] || !isVotingOpen || !answers[cat.id]} // Letiltva ha üres a mező
                    className={`text-white font-bold px-8 py-4 rounded-xl transition shadow-md shrink-0 active:scale-95 ${(!isVotingOpen || !answers[cat.id]) ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                  >
                    {loading[cat.id] ? "Salvare..." : "Salvare"}
                  </button>
                </div>
              )}

            </div>
          );
        })}

        {categories.length === 0 && (
          <div className="text-center p-12 bg-white rounded-3xl shadow-md border border-slate-100">
            <p className="text-slate-500 font-bold text-xl">În prezent nu există întrebări active.</p>
          </div>
        )}
      </div>
    </div>
  );
}