import type { Note } from "@prisma/client";
import type { LoaderFunction } from "@remix-run/node";
import { json } from '@remix-run/node';
import { prisma } from "~/utils/db.server";
import { getUserId } from "~/utils/session.server";

export type Ticket = { author: string, authorId: string, ticketProduct: string; ticketProductId: string; ticketStatus: string; ticketStatusId: string; ticketId: string, createdAt: string; updatedAt: string; title: string, description: string; Notes: Note[]; };

export async function getTickets() {
  const tickets = await prisma.ticket.findMany({
    select: {
      author: true,
      authorId: true,
      ticketProduct: true,
      ticketProductId: true,
      ticketStatus: true,
      ticketStatusId: true,
      ticketId: true,
      createdAt: true,
      updatedAt: true,
      title: true,
      description: true,
      Notes: true
    },
    orderBy: { updatedAt: 'desc' }
  });

  return tickets;
}

export async function getTicketProductDevice(ticketProductId: string) {
  const device = await prisma.product.findUnique({
    where: { productId: ticketProductId }
  });

  return device;
}

export async function getTicketStatusType(ticketStatusId: string) {
  const type = await prisma.status.findUnique({
    where: { statusId: ticketStatusId }
  });

  return type;
}

export async function getTicketListingByUserId(userId: string | undefined) {
  const ticketsByUserId = userId ? await prisma.ticket.findMany({
    select: { authorId: true, ticketId: true, title: true, createdAt: true, updatedAt: true, ticketStatus: true, ticketProduct: true },
    where: { authorId: userId },
    orderBy: { updatedAt: 'desc' }
  }) : 'No ticket available';

  return ticketsByUserId;
};