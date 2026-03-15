// app/api/vote/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";

// SZAVAZAT LEADÁSA (Trimiterea votului)
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) return NextResponse.json({ error: "Nu ești autentificat" }, { status: 401 });

  const setting = await prisma.setting.findFirst();
  if (setting && !setting.isVotingOpen) {
    return NextResponse.json({ error: "Votarea este momentan închisă!" }, { status: 403 });
  }

  const userId = (session.user as any).id;
  const { categoryId, answer } = await req.json();

  if (!answer || answer.trim() === "") return NextResponse.json({ error: "Răspunsul nu poate fi gol" }, { status: 400 });

  const formattedAnswer = answer.toUpperCase().replace(/[\s-]/g, '');
  const plateRegex = /^[A-Z]{1,2}\d{2,3}[A-Z]{3}$/;
  
  if (!plateRegex.test(formattedAnswer)) {
    return NextResponse.json({ error: "Formatul numărului de înmatriculare este invalid!" }, { status: 400 });
  }

  try {
    // ELLENŐRZÉS: Szavazott-e már? (VERIFICARE: A votat deja?)
    const existingVote = await prisma.vote.findUnique({
      where: { userId_categoryId: { userId, categoryId } }
    });

    if (existingVote) {
      return NextResponse.json({ error: "Ai votat deja în această categorie! Șterge votul anterior mai întâi." }, { status: 400 });
    }

    // LÉTREHOZÁS (CREARE)
    const vote = await prisma.vote.create({
      data: { userId, categoryId, answer: formattedAnswer }
    });
    return NextResponse.json(vote);
  } catch (error) {
    return NextResponse.json({ error: "Eroare la salvarea votului" }, { status: 500 });
  }
}

// SZAVAZAT TÖRLÉSE (Ștergerea votului)
export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) return NextResponse.json({ error: "Nu ești autentificat" }, { status: 401 });

  const setting = await prisma.setting.findFirst();
  if (setting && !setting.isVotingOpen) {
    return NextResponse.json({ error: "Votarea este momentan închisă!" }, { status: 403 });
  }

  const userId = (session.user as any).id;
  const { categoryId } = await req.json();

  try {
    await prisma.vote.delete({
      where: { userId_categoryId: { userId, categoryId } }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Eroare în timpul ștergerii" }, { status: 500 });
  }
}