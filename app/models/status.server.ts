import type { Ticket } from "@prisma/client";
import { prisma } from "~/utils/db.server";

export type Status = { technicianId: string; statusId: string, createdAt: string, updatedAt: string; type: string; Tickets: Ticket[]; };

export async function getStatuses() {
  return await prisma.status.findMany({
    select: { technicianId: true, statusId: true, createdAt: true, updatedAt: true, type: true, Tickets: true },
    orderBy: { type: 'asc' }
  });
}

export async function getStatus(statusId: string | undefined) {
  return await prisma.status.findUnique({ where: { statusId } });
}

export async function deleteStatus(statusId: string | undefined) {
  return await prisma.status.delete({ where: { statusId } });
}