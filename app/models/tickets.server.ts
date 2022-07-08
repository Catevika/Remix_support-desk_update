import { prisma } from "~/utils/db.server";

export async function getTickets() {
  return await prisma.ticket.findMany({
    include: {author: {select: {id: true, username: true, email: true}}, ticketStatus: {select: {type: true}}, ticketProduct: {select: {device: true}}, Notes: true}
  });
}

export async function getTicket(ticketId: string | undefined) {
  return ticketId ? await prisma.ticket.findUnique({
    include: {author: {select: {id: true, username: true, email: true}}, ticketStatus: {select: {type: true}}, ticketProduct: {select: {device: true}}, Notes: true}, where: { ticketId }
  }) : undefined;
}

export async function getTicketListingByUserId(userId: string | undefined) {
  return userId ? await prisma.ticket.findMany({
    select: { author: {select: {id: true, username: true, email: true}}, authorId: true, ticketId: true, title: true, createdAt: true, updatedAt: true, ticketStatus: true, ticketProduct: true },
    where: { authorId: userId },
    orderBy: { updatedAt: 'desc' }
  }) : 'No ticket available';
};

export async function deleteTicket(ticketId: string | undefined) {
  return await prisma.ticket.delete({ where: { ticketId } });
}