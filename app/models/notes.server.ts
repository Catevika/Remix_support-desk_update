import { prisma } from "~/utils/db.server";

export type { Note } from "@prisma/client";

export async function getNotes(ticketId: string) {
  return await prisma.note.findMany({
    include: {noteUser: {select: {username: true}}, noteTicket: {select: {title: true}}},
    where: { noteTicketId: ticketId }
  });
}

export async function getNoteListingByTicketId(ticketId: string | undefined) {
  return ticketId ? await prisma.note.findMany({
    select: { noteUser: true, noteUserId: true, noteTicket: true, noteTicketId: true, noteId: true, text: true, createdAt: true, updatedAt: true },
    where: { noteTicketId: ticketId },
    orderBy: { updatedAt: 'desc' }
  }) : null;
};