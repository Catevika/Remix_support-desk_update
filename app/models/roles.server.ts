import { prisma } from "~/utils/db.server";

export type Role = { roleId: string, roleType: string; authorId: string; createdAt: string, updatedAt: string; };

export async function getRoles() {
  return await prisma.role.findMany({});
}

export async function getRole(roleId: string | undefined) {
  return await prisma.role.findUnique({ where: { roleId } });
}

export async function deleteRole(roleId: string | undefined) {
  return await prisma.role.delete({ where: { roleId } });
}