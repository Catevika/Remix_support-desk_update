import type { Note } from "@prisma/client";
import {json} from '@remix-run/node';
import { prisma } from "~/utils/db.server";

export type Ticket = { author: string, authorId: string, ticketProduct: string; ticketProductId: string; ticketStatus: string; ticketStatusId: string; ticketId: string, createdAt: string; updatedAt: string; title: string, description: string; Notes: Note[]; };

export async function getTickets() {
  return await prisma.ticket.findMany();
}

export async function getTicket(ticketId: string | undefined) {
  return await prisma.ticket.findUnique({ where: { ticketId } });
}

export async function getTicketProductDevice(ticketProductId: string | undefined) {
  return await prisma.product.findUnique({
    where: { productId: ticketProductId }
  });
}

export async function getTicketStatusType(ticketStatusId: string | undefined) {
  return await prisma.status.findUnique({
    where: { statusId: ticketStatusId }
  });
}

export async function getTicketListingByUserId(userId: string | undefined) {
  return userId ? await prisma.ticket.findMany({
    select: { authorId: true, ticketId: true, title: true, createdAt: true, updatedAt: true, ticketStatus: true, ticketProduct: true },
    where: { authorId: userId },
    orderBy: { updatedAt: 'desc' }
  }) : 'No ticket available';
};