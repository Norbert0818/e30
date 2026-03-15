// app/vote/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { redirect } from "next/navigation";
import VoteClient from "./VoteClient";

export const dynamic = "force-dynamic";

export default async function VotePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/"); 

  const userId = (session.user as any).id;
  const categories = await prisma.category.findMany({ where: { isActive: true }, orderBy: { createdAt: "asc" } });
  const userVotes = await prisma.vote.findMany({ where: { userId: userId } });

  // LEKÉRJÜK A KAPCSOLÓT
  const setting = await prisma.setting.findFirst();
  const isVotingOpen = setting ? setting.isVotingOpen : true;

  // ÁTADJUK AZ isVotingOpen VÁLTOZÓT IS
  return <VoteClient categories={categories} userVotes={userVotes} isVotingOpen={isVotingOpen} />;
}