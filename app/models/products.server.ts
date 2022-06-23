import type { Ticket } from "@prisma/client";
import { prisma } from "~/utils/db.server";

export type Product = { authorId: string, createdAt: string; updatedAt: string; productId: string, device: string; Tickets: Ticket[]; };

export async function getProducts() {
  return await prisma.product.findMany({
    select: { authorId: true, createdAt: true, updatedAt: true, productId: true, device: true, Tickets: true },
    orderBy: { device: 'asc' }
  });
}

export async function getProduct(productId: string | undefined) {
  return await prisma.product.findUnique({ where: { productId } });
}

export async function deleteProduct(productId: string | undefined) {
  return await prisma.product.delete({ where: { productId } });
}