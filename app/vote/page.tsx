import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import VoteClient from "./VoteClient";

export const dynamic = "force-dynamic";

export default async function VotePage() {
  const session = await getServerSession(authOptions);
  
  // Ha be van jelentkezve, használjuk az ID-ját, ha nincs, akkor "guest"
  // Megjegyzés: Az API oldalon is engedélyezni kell majd a guest szavazást!
  const userId = (session?.user as any)?.id || "guest";

  const categories = await prisma.category.findMany({ 
    where: { isActive: true }, 
    orderBy: { createdAt: "asc" } 
  });

  // Csak akkor kérjük le az adatbázisból a szavazatokat, ha be van jelentkezve
  const userVotes = session ? await prisma.vote.findMany({ where: { userId: userId } }) : [];

  const setting = await prisma.setting.findFirst();
  const isVotingOpen = setting ? setting.isVotingOpen : true;

  return <VoteClient categories={categories} userVotes={userVotes} isVotingOpen={isVotingOpen} />;
}