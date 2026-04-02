import { prisma } from "../../lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ResultsPage() {
  const session = await getServerSession(authOptions);

  const userRole = (session?.user as any)?.role;

    if (!session || (userRole !== "admin" && userRole !== "superadmin")) {
    redirect("/"); 
  }
  
  // Lekérjük az összes aktív kategóriát a hozzájuk tartozó szavazatokkal együtt
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    include: { votes: true }
  });

  const rankings = categories.map((category) => {
    const voteCounts: Record<string, number> = {};

    // Megszámoljuk a szavazatokat kategóriánként
    category.votes.forEach((vote) => {
      const answer = vote.answer.trim().toLowerCase();
      if (!voteCounts[answer]) voteCounts[answer] = 0;
      voteCounts[answer]++;
    });

    // Sorba rendezzük és vesszük az első 5 helyezettet
    const sortedAnswers = Object.entries(voteCounts)
      .map(([key, count]) => {
        // Megkeressük az eredeti formátumú választ (nem csupa kisbetűs)
        const originalVote = category.votes.find(v => v.answer.trim().toLowerCase() === key);
        return { answer: originalVote?.answer.trim() || key, count };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); 

    return {
      id: category.id,
      name: category.name,
      topAnswers: sortedAnswers,
      totalVotes: category.votes.length
    };
  });

  return (
    <div className="max-w-5xl mx-auto p-6 py-12">
      <h1 className="text-4xl md:text-5xl font-black text-slate-800 mb-2 text-center">
        🏆 Rezultate (TOP 5)
      </h1>
      <p className="text-center text-slate-500 mb-12 text-lg">
        Clasamentul actualizat în timp real!
      </p>

      <div className="space-y-8">
        {rankings.map((category) => (
          <div key={category.id} className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
            <div className="bg-slate-800 text-white p-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold">{category.name}</h2>
              <span className="bg-slate-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                {category.totalVotes} voturi în total
              </span>
            </div>

            <div className="p-6">
              {category.topAnswers.length === 0 ? (
                <p className="text-slate-500 italic text-center py-4">Nu s-au înregistrat încă voturi.</p>
              ) : (
                <div className="space-y-3">
                  {category.topAnswers.map((item, index) => {
                    let medal = <span className="text-slate-400 font-bold w-8 text-center">{index + 1}.</span>;
                    if (index === 0) medal = <span className="text-3xl">🥇</span>;
                    if (index === 1) medal = <span className="text-2xl">🥈</span>;
                    if (index === 2) medal = <span className="text-xl">🥉</span>;

                    return (
                      <div key={index} className={`flex items-center justify-between p-4 rounded-2xl transition-all ${index === 0 ? 'bg-amber-50 border-2 border-amber-200 shadow-sm' : 'bg-slate-50 border border-slate-100'}`}>
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="w-10 text-center flex justify-center shrink-0">{medal}</div>
                          <div className="font-bold text-slate-800 text-lg md:text-xl break-words uppercase tracking-widest">
                            {item.answer}
                          </div>
                        </div>

                        <div className="flex flex-col items-end shrink-0 pl-4">
                          <span className="text-2xl font-black text-blue-600">{item.count}</span>
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Voturi</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}