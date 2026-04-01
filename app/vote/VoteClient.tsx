"use client";

import { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";

export default function VoteClient({ categories, userVotes, isVotingOpen }: { categories: any[], userVotes: any[], isVotingOpen: boolean }) {
  
  const [submittedVotes, setSubmittedVotes] = useState<Record<string, string>>({});
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  // BETÖLTÉS: Megnézzük a localStorage-ban, mit szavazott korábban
  useEffect(() => {
    const localData = localStorage.getItem("my_votes");
    const savedVotes = localData ? JSON.parse(localData) : {};
    
    // Összefésüljük: amit a szerver küld (ha van session) + amit a gépén találtunk
    const initial: Record<string, string> = { ...savedVotes };
    userVotes.forEach(vote => { initial[vote.categoryId] = vote.answer; });
    
    setSubmittedVotes(initial);
  }, [userVotes]);

  const handleVote = async (categoryId: string) => {
    if (!isVotingOpen) {
      toast.error("Votarea este închisă!");
      return;
    }

    const rawAnswer = answers[categoryId];
    if (!rawAnswer || rawAnswer.trim() === "") {
      toast.error("Te rugăm să introduci un număr!");
      return;
    }

    const formattedAnswer = rawAnswer.toUpperCase().replace(/[\s-]/g, '');
    const plateRegex = /^[A-Z]{1,2}\d{2,3}[A-Z]{3}$/;
    
    if (!plateRegex.test(formattedAnswer)) {
      toast.error("Format invalid! (Ex: SJ15TRH)");
      return;
    }

    setLoading(prev => ({ ...prev, [categoryId]: true }));

    try {
      const res = await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryId, answer: formattedAnswer })
      });

      if (res.ok) {
        toast.success("Vot salvat!");
        
        // MENTÉS HELYI TÁRHELYRE
        const newVotes = { ...submittedVotes, [categoryId]: formattedAnswer };
        setSubmittedVotes(newVotes);
        localStorage.setItem("my_votes", JSON.stringify(newVotes));
        localStorage.setItem("userVoted", "true"); // A főoldalnak is jelezzük
        
        setAnswers(prev => ({ ...prev, [categoryId]: "" }));
      } else {
        const errorData = await res.json();
        toast.error(errorData.error || "Eroare la salvare.");
      }
    } catch (err) {
      toast.error("Eroare de rețea.");
    } finally {
      setLoading(prev => ({ ...prev, [categoryId]: false }));
    }
  };

  const handleDelete = async (categoryId: string) => {
    // Ha akarod, kiiktathatod a törlést, hogy ne lehessen módosítani
    toast.error("Votul nu mai poate fi modificat odată trimis!");
    // Ha mégis szeretnéd hagyni, írj, és visszatesszük a törlés logikáját!
  };

  return (
    <div className="max-w-3xl mx-auto p-6 py-12">
      <Toaster position="top-center" />
      <h1 className="text-4xl md:text-5xl font-black text-slate-800 mb-4 text-center">🗳️ Buletin de Vot</h1>
      
      {!isVotingOpen && (
        <div className="bg-red-100 border-2 border-red-500 text-red-700 p-6 rounded-2xl mb-10 text-center">
          <h2 className="text-2xl font-black mb-2">Votarea este închisă! 🛑</h2>
        </div>
      )}

      <div className="space-y-6">
        {categories.map(cat => {
          const hasVoted = !!submittedVotes[cat.id];
          const votedAnswer = submittedVotes[cat.id];

          return (
            <div key={cat.id} className={`bg-white p-6 md:p-8 rounded-3xl shadow-lg border-2 transition ${hasVoted ? 'border-green-200 bg-green-50/30' : 'border-slate-100'}`}>
              <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-6">{cat.name}</h2>
              
              {hasVoted ? (
                <div className="flex items-center border-2 border-slate-400 rounded-md overflow-hidden bg-white w-fit mx-auto sm:mx-0 shadow-md">
                  <div className="bg-blue-700 w-8 h-12 flex flex-col justify-end items-center py-1">
                    <span className="text-white font-bold text-[9px]">RO</span>
                  </div>
                  <div className="h-12 px-6 flex items-center font-black text-2xl tracking-widest text-black">
                    {votedAnswer}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-4">
                  <input
                    type="text"
                    value={answers[cat.id] || ""}
                    onChange={(e) => setAnswers({ ...answers, [cat.id]: e.target.value.toUpperCase() })}
                    placeholder="SJ15TRH"
                    disabled={!isVotingOpen}
                    className="flex-1 border-2 border-slate-200 rounded-xl p-4 outline-none focus:border-blue-500 font-bold text-xl text-center md:text-left bg-slate-50 uppercase tracking-widest"
                  />
                  <button
                    onClick={() => handleVote(cat.id)}
                    disabled={loading[cat.id] || !isVotingOpen || !answers[cat.id]}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-4 rounded-xl transition shadow-md disabled:bg-slate-300"
                  >
                    {loading[cat.id] ? "..." : "Votează"}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}