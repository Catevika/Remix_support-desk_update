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

export async function getUsersBySearchTerm(query: string |null | undefined) {
  if(!query) {
    const users = getUsers();
    return users; 
  } else {
    const users = await prisma.user.findMany({
      where: {
        OR: [
        { username: { contains: query, mode: 'insensitive' }},
        { email: { contains: query, mode: 'insensitive' }},
        { service: { contains: query, mode: 'insensitive' }}
      ]
    }});
  return users;
  }
}