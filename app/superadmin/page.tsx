// app/superadmin/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";

export default function SuperadminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const currentUserId = (session?.user as any)?.id;

  useEffect(() => {
    if (status === "loading") return;
    const userRole = (session?.user as any)?.role;
    // Ha nem superadmin, repül a főoldalra
    if (!session || userRole !== "superadmin") {
      router.push("/");
      return;
    }
    fetchUsers();
  }, [session, status, router]);

  const fetchUsers = async () => {
    const res = await fetch("/api/superadmin");
    if (res.ok) {
      const data = await res.json();
      setUsers(data);
    }
    setIsLoading(false);
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    const res = await fetch("/api/superadmin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, newRole })
    });

    if (res.ok) {
      toast.success("Permisiuni modificate cu succes!");
      fetchUsers(); // Frissítjük a listát
    } else {
      const errorData = await res.json();
      toast.error(errorData.error || "A apărut o eroare.");
    }
  };

  if (isLoading) return <div className="p-8 text-center text-xl font-bold">Încărcare...</div>;

  return (
    <div className="max-w-5xl mx-auto p-6 py-12">
      <Toaster position="top-center" />
      <h1 className="text-3xl md:text-4xl font-black text-slate-800 mb-8 flex items-center gap-3">
        <span>👑</span> Panel Superadmin
      </h1>

      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-lg border-4 border-purple-100">
        <h2 className="text-xl font-bold text-slate-700 mb-6">Gestionare Utilizatori</h2>

        <div className="space-y-4">
          {users.map((user) => (
            <div key={user.id} className="flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-50 p-4 rounded-2xl border border-slate-200 gap-4">
              
              <div className="flex items-center gap-4">
                <img 
                  src={user.image || "https://www.gravatar.com/avatar/?d=mp"} 
                  alt={user.name} 
                  className="w-12 h-12 rounded-full border border-slate-300 shadow-sm"
                />
                <div>
                  <div className="font-bold text-slate-800 text-lg">{user.name || "Anonim"}</div>
                  <div className="text-sm text-slate-500">{user.email}</div>
                </div>
              </div>

              <div className="w-full md:w-auto flex items-center gap-3">
                {user.id === currentUserId && (
                  <span className="text-xs font-bold text-purple-600 bg-purple-100 px-2 py-1 rounded uppercase tracking-wider">Ești tu</span>
                )}
                
                <select
                  value={user.role}
                  onChange={(e) => handleRoleChange(user.id, e.target.value)}
                  disabled={user.id === currentUserId} // Saját magát nem módosíthatja
                  className={`p-3 rounded-xl border-2 outline-none font-bold transition w-full md:w-48 cursor-pointer
                    ${user.role === 'superadmin' ? 'bg-purple-50 text-purple-700 border-purple-200 focus:border-purple-500' : 
                      user.role === 'admin' ? 'bg-amber-50 text-amber-700 border-amber-200 focus:border-amber-500' : 
                      'bg-slate-50 text-slate-700 border-slate-200 focus:border-blue-500'}
                    ${user.id === currentUserId ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  <option value="user">Utilizator (User)</option>
                  <option value="admin">Administrator</option>
                  <option value="superadmin">Superadmin 👑</option>
                </select>
              </div>

            </div>
          ))}
        </div>
      </div>
    </div>
  );
}