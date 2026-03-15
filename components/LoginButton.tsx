// components/LoginButton.tsx
"use client";

import { signIn } from "next-auth/react";

export default function LoginButton() {
  return (
    <button 
      onClick={() => signIn("google")}
      className="mt-6 inline-block w-full sm:w-auto bg-blue-600 text-white font-black text-lg px-8 py-4 rounded-xl shadow-md hover:bg-blue-700 hover:shadow-lg transition-all transform hover:-translate-y-1"
    >
      Autentificare cu Google
    </button>
  );
}