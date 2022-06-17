import { prisma } from "~/utils/db.server";

export type Service = { authorId: string, createdAt: string; updatedAt: string; serviceId: string, name: string; };

export async function getServices() {
  const services = await prisma.service.findMany({
    select: { authorId: true, createdAt: true, updatedAt: true, serviceId: true, name: true },
    orderBy: { name: 'asc' }
  });
  return services;
}