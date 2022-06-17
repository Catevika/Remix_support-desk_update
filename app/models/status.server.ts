import type { Ticket } from "@prisma/client";
import { prisma } from "~/utils/db.server";

export type Status = { technicianId: string; statusId: string, createdAt: Date, updatedAt: Date; type: string; Tickets: Ticket[]; };

export async function getStatuses() {
  const statuses = await prisma.status.findMany({
    select: { technicianId: true, statusId: true, createdAt: true, updatedAt: true, type: true, Tickets: true },
    orderBy: { type: 'asc' }
  });

  return statuses;
}