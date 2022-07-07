import { prisma } from "~/utils/db.server";

export type { Note } from "@prisma/client";

export async function getNoteByNoteId(noteId: string) {
  return prisma.note.findUnique({
    where: {
      noteId
    }
  });
}

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

export async function deleteNote(noteId: string | undefined) {
  return await prisma.note.delete({ where: { noteId } });
}