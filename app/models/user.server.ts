import type { User } from "@prisma/client";
import { prisma } from "~/utils/db.server";

export type { User } from "@prisma/client";

export async function getUsers() {
  return await prisma.user.findMany();
}

export async function getUserById(id: User["id"]) {
  return prisma.user.findUnique({ where: { id } });
}

export async function getUserByEmail(email: User["email"]) {
  return prisma.user.findUnique({ where: { email } });
}
