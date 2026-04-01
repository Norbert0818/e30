import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  const userRole = (session?.user as any)?.role;
  if (!session || (userRole !== "admin" && userRole !== "superadmin")) {
    return NextResponse.json({ error: "Acces neautorizat" }, { status: 403 });
  }

  const categories = await prisma.category.findMany({ orderBy: { createdAt: 'desc' } });
  
  let setting = await prisma.setting.findFirst();
  if (!setting) {
    // Kiszedtük a felesleges areResultsPublic változót innen is
    setting = await prisma.setting.create({ data: { isVotingOpen: true } });
  }
  
  return NextResponse.json({ 
    categories, 
    isVotingOpen: setting.isVotingOpen
  });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const userRole = (session?.user as any)?.role;
  if (!session || (userRole !== "admin" && userRole !== "superadmin")) {
    return NextResponse.json({ error: "Acces neautorizat" }, { status: 403 });
  }

  const { action, payload } = await req.json();

  try {
    if (action === "ADD_CATEGORY") {
      const newCat = await prisma.category.create({ data: { name: payload.name, isActive: true } });
      return NextResponse.json(newCat);
    }
    
    if (action === "DELETE_CATEGORY") {
      await prisma.category.delete({ where: { id: payload.id } }); 
      return NextResponse.json({ success: true });
    }

    if (action === "TOGGLE_VOTING") {
      let setting = await prisma.setting.findFirst();
      if (!setting) {
         setting = await prisma.setting.create({ data: { isVotingOpen: true } });
      }
      setting = await prisma.setting.update({
        where: { id: setting!.id },
        data: { isVotingOpen: payload.isVotingOpen }
      });
      return NextResponse.json({ isVotingOpen: setting.isVotingOpen });
    }

    // ÚJ: SZAVAZATOK TÖRLÉSE (RESET_VOTES)
    if (action === "RESET_VOTES") {
      // Letöröl mindent a Vote táblából
      await prisma.vote.deleteMany({});
      return NextResponse.json({ success: true, message: "Voturile au fost resetate." });
    }

    return NextResponse.json({ error: "Acțiune necunoscută" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: "Eroare de server" }, { status: 500 });
  }
}