import type { User } from "@prisma/client";
import { prisma } from "~/utils/db.server";
import { json } from "@remix-run/node";

export type { User } from "@prisma/client";

export async function getUsers() {
  const users = await prisma.user.findMany();
  return json(users);
}

export async function getUserById(id: User["id"]) {
  return prisma.user.findUnique({ where: { id } });
}

export async function getUserByEmail(email: User["email"]) {
  return prisma.user.findUnique({ where: { email } });
}

export async function deleteUserByEmail(email: User["email"]) {
  return prisma.user.delete({ where: { email } });
}