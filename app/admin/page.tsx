"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [categories, setCategories] = useState<any[]>([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isVotingOpen, setIsVotingOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;
    const userRole = (session?.user as any)?.role;
    if (!session || (userRole !== "admin" && userRole !== "superadmin")) {
      router.push("/");
      return;
    }
    fetchData();
  }, [session, status, router]);

  const fetchData = async () => {
    const res = await fetch("/api/admin");
    if (res.ok) {
      const data = await res.json();
      setCategories(data.categories);
      setIsVotingOpen(data.isVotingOpen);
    }
    setIsLoading(false);
  };

  const handleAction = async (action: string, payload: any = {}) => {
    if (action === "DELETE_CATEGORY" && !confirm("Sigur dorești să ștergi această întrebare? Toate voturile aferente se vor pierde!")) return;
    if (action === "ADD_CATEGORY" && !payload.name.trim()) return;

    // Resetálás megerősítése
    if (action === "RESET_VOTES") {
      const isSure = confirm("🚨 ATENȚIE MAXIMĂ 🚨\n\nEști absolut sigur că vrei să ȘTERGI TOATE VOTURILE?\nAceastă acțiune este ireversibilă!");
      if (!isSure) return;
    }

    const res = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, payload })
    });

    if (res.ok) {
      if (action === "TOGGLE_VOTING") {
        const data = await res.json();
        setIsVotingOpen(data.isVotingOpen);
        toast.success(data.isVotingOpen ? "Votarea este DESCHISĂ!" : "Votarea este ÎNCHISĂ!");
        router.refresh();
      } else if (action === "RESET_VOTES") {
        toast.success("Toate voturile au fost șterse cu succes!");
        router.refresh();
      } else {
        fetchData();
        if (action === "ADD_CATEGORY") {
          setNewCategoryName("");
          toast.success("Întrebare adăugată!");
        } else {
          toast.success("Întrebare ștearsă!");
        }
      }
    } else {
      toast.error("A apărut o eroare în timpul operațiunii.");
    }
  };

  if (isLoading) return <div className="p-8 text-center text-xl font-bold">Încărcare...</div>;

  return (
    <div className="max-w-5xl mx-auto p-6 py-12">
      <Toaster position="top-center" />
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl md:text-4xl font-black text-slate-800">🛠️ Panel Admin</h1>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {/* Szavazás kapcsoló */}
          <button 
            onClick={() => handleAction("TOGGLE_VOTING", { isVotingOpen: !isVotingOpen })}
            className={`px-6 py-3 rounded-xl font-black text-white shadow-lg transition transform hover:scale-105 flex-1 ${
              isVotingOpen ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"
            }`}
          >
            {isVotingOpen ? "🟢 VOTARE DESCHISĂ" : "🔴 VOTARE ÎNCHISĂ"}
          </button>

          {/* ÚJ: Nullázás gomb a Results helyett */}
          <button 
            onClick={() => handleAction("RESET_VOTES")}
            className="px-6 py-3 rounded-xl font-black text-white shadow-lg transition transform hover:scale-105 flex-1 bg-red-600 hover:bg-red-700"
          >
            🗑️ RESETEAZĂ VOTURILE
          </button>
        </div>
      </div>

      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-lg border-4 border-slate-100">
        <div className="flex flex-col sm:flex-row gap-3 mb-8 w-full">
          <input 
            type="text" 
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="Introdu o întrebare nouă..." 
            className="w-full border-2 border-slate-200 rounded-xl p-4 outline-none focus:border-blue-500 text-lg font-medium"
          />
          <button 
            onClick={() => handleAction("ADD_CATEGORY", { name: newCategoryName })}
            className="w-full sm:w-auto bg-blue-600 text-white font-bold px-8 py-4 rounded-xl hover:bg-blue-700 shrink-0 shadow-md transition"
          >
            Adăugare
          </button>
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-bold text-slate-500 mb-4 uppercase tracking-wider">Întrebări active ({categories.length})</h2>
          {categories.length === 0 ? (
            <div className="text-center p-6 text-slate-400 font-bold bg-slate-50 rounded-xl">Nu există încă întrebări.</div>
          ) : (
            categories.map(cat => (
              <div key={cat.id} className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-200 gap-4">
                <span className="font-bold text-slate-700 text-lg break-words min-w-0">{cat.name}</span>
                <button 
                  onClick={() => handleAction("DELETE_CATEGORY", { id: cat.id })}
                  className="text-red-500 bg-red-100 px-4 py-2 rounded-lg hover:bg-red-200 text-sm font-bold shrink-0 transition"
                >
                  Ștergere
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}