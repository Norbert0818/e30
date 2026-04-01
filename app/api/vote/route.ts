import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";
import { headers } from "next/headers";

// Segédfüggvény az azonosítóhoz
function getUserId(session: any, reqHeaders: Headers) {
  if (session?.user?.id) return (session.user as any).id;
  
  // Ha nincs session, az IP cím alapján generálunk egy "guest" ID-t
  // Ez segít, hogy egy gépről (elvileg) csak egyszer szavazzanak az adatbázis szerint is
  const forwarded = reqHeaders.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0] : "127.0.0.1";
  return `guest_${ip.replace(/[:.]/g, "_")}`;
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const reqHeaders = await headers();
  const userId = getUserId(session, reqHeaders);

  // Szavazás állapota ellenőrzése
  const setting = await prisma.setting.findFirst();
  if (setting && !setting.isVotingOpen) {
    return NextResponse.json({ error: "Votarea este închisă!" }, { status: 403 });
  }

  const { categoryId, answer } = await req.json();

  if (!answer || answer.trim() === "") {
    return NextResponse.json({ error: "Răspunsul nu poate fi gol" }, { status: 400 });
  }

  const formattedAnswer = answer.toUpperCase().replace(/[\s-]/g, '');
  const plateRegex = /^[A-Z]{1,2}\d{2,3}[A-Z]{3}$/;
  
  if (!plateRegex.test(formattedAnswer)) {
    return NextResponse.json({ error: "Format invalid!" }, { status: 400 });
  }

  try {
    // Ellenőrizzük az adatbázisban, hogy ez az ID (IP vagy User) szavazott-e már ide
    const existingVote = await prisma.vote.findUnique({
      where: { userId_categoryId: { userId, categoryId } }
    });

    if (existingVote) {
      return NextResponse.json({ error: "Ai votat deja în această categorie!" }, { status: 400 });
    }

    const vote = await prisma.vote.create({
      data: { userId, categoryId, answer: formattedAnswer }
    });
    
    return NextResponse.json(vote);
  } catch (error) {
    console.error("VOTE_ERROR:", error);
    return NextResponse.json({ error: "Eroare la salvare" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  
  // A törlést Szigorítjuk: Csak admin törölhessen, vagy ha úgy döntöttél, 
  // hogy a felhasználó mégis módosíthat, akkor vedd ki a role ellenőrzést.
  const userRole = (session?.user as any)?.role;
  const isAdmin = userRole === "admin" || userRole === "superadmin";

  if (!isAdmin) {
    return NextResponse.json({ error: "Nu ai permisiunea de a șterge voturi!" }, { status: 403 });
  }

  const { categoryId, userId: targetUserId } = await req.json();

  try {
    await prisma.vote.delete({
      where: { userId_categoryId: { userId: targetUserId, categoryId } }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Eroare la ștergere" }, { status: 500 });
  }
}