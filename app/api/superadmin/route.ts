// app/api/superadmin/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  const userRole = (session?.user as any)?.role;
  
  if (!session || userRole !== "superadmin") {
    return NextResponse.json({ error: "Acces exclusiv pentru Superadmini!" }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    orderBy: { email: 'asc' },
    select: { id: true, name: true, email: true, image: true, role: true }
  });
  
  return NextResponse.json(users);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const userRole = (session?.user as any)?.role;
  const currentUserId = (session?.user as any)?.id;
  
  if (!session || userRole !== "superadmin") {
    return NextResponse.json({ error: "Acces exclusiv pentru Superadmini!" }, { status: 403 });
  }

  const { userId, newRole } = await req.json();

  // Biztonsági védelem: saját magad jogát ne tudd átállítani
  if (userId === currentUserId) {
    return NextResponse.json({ error: "Nu îți poți retrage propriile permisiuni!" }, { status: 400 });
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: newRole }
    });
    return NextResponse.json(updatedUser);
  } catch (error) {
    return NextResponse.json({ error: "Eroare în timpul modificării" }, { status: 500 });
  }
}