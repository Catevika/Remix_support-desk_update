import { prisma } from "~/utils/db.server";

export type Role = { roleId: string, roleType: string; authorId: string; createdAt: Date, updatedAt: Date; };

export async function getRoles() {
  const roles = await prisma.role.findMany({
    select: { roleId: true, roleType: true, authorId: true, createdAt: true, updatedAt: true },
    orderBy: { roleType: 'asc' }
  });

  return roles;
}