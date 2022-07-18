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

export async function getTicketsBySearchTerm(query: string | undefined) {
  if(!query) {
    const tickets = getTickets();
    return tickets; 
  } else {
    const tickets = await prisma.ticket.findMany({
      include: {author: {select: {id: true, username: true, email: true}}, ticketStatus: {select: {type: true}}, ticketProduct: {select: {device: true}}},
      where: {
        OR: [
        { title: { contains: query, mode: 'insensitive' }},     
        { author: {username: { contains: query, mode: 'insensitive' }}},    
        { ticketStatus: {type: { contains: query, mode: 'insensitive' }}},    
        { ticketProduct: {device: { contains: query, mode: 'insensitive' }}}    
      ]
    }, orderBy: { updatedAt: 'desc' }});
  return tickets;
  }
}

export async function deleteTicket(ticketId: string | undefined) {
  return await prisma.ticket.delete({ where: { ticketId } });
}