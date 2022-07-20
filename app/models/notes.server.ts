import { prisma } from "~/utils/db.server";

export type { Note } from "@prisma/client";

export async function getNoteByNoteId(noteId: string) {
  return prisma.note.findUnique({
    include: { noteUser: {select: {id: true, username: true, email: true}}, noteTicket: {select: {title: true, ticketProduct: {select: {device: true}}}}},
    where: { noteId }
  });
}

export async function getAllNotes() {
  return prisma.note.findMany({
    include: { noteUser: {select: {id: true, username: true, email: true}}, noteTicket: {select: {title: true, ticketProduct: {select: {device: true}}}}}
  })
}

export async function getNoteListingByTicketId(ticketId: string | undefined) {
  return ticketId ? await prisma.note.findMany({
    include: { noteUser: {select: {id: true, username: true, email: true}}, noteTicket: {select: {title: true, ticketProduct: {select: {device: true}}}}},
    where: { noteTicketId: ticketId },
    orderBy: { updatedAt: 'desc' }
  }) : null;
};

export async function getNotesBySearchTerm(query: string | undefined) {
  if(!query) {
    const notes = getAllNotes();
    return notes; 
  } else {
    const notes = await prisma.note.findMany({
      include: { noteUser: {select: {id: true, username: true, email: true}}, noteTicket: {select: {title: true, ticketProduct: {select: {device: true}}}}},
      where: {
        OR: [
        { noteTicket: {title: { contains: query, mode: 'insensitive' }, ticketProduct: {device: { contains: query, mode: 'insensitive' }}}},     
        { noteUser: {username: { contains: query, mode: 'insensitive' }}},    
        { text: { contains: query, mode: 'insensitive' }}
      ]
    }, orderBy: { updatedAt: 'desc'}});
  return notes;
  }
}

export async function deleteNote(noteId: string | undefined) {
  return await prisma.note.delete({ where: { noteId } })
}

export async function deleteAllNotes(ticketId: string | undefined) {
  return await prisma.note.deleteMany({ where: { noteTicketId: ticketId }})
}