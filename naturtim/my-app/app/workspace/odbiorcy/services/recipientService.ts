import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";
import { RecipientLogService } from "./recipientLogService";

export async function getRecipients() {
  const recipients = await prisma.recipient.findMany({
    orderBy: { id: 'asc' },
  });
  
  return recipients.map(recipient => ({
    id: recipient.id,
    name: recipient.name,
  }));
}

export async function createRecipient(data: { name: string }, request?: NextRequest) {
  const recipient = await prisma.recipient.create({
    data: {
      name: data.name.trim(),
    },
  });
  
  // Logowanie utworzenia odbiorcy
  if (request) {
    await RecipientLogService.logRecipientCreation(request, recipient.id, recipient.name);
  }
  
  return recipient;
}

export async function canDeleteRecipient(id: number) {
  const recipientWithBatches = await prisma.recipient.findUnique({
    where: { id },
    include: { productionBatches: true },
  });
  
  return !recipientWithBatches?.productionBatches.length;
}

export async function deleteRecipient(id: number, request?: NextRequest) {
  // Pobierz informacje o odbiorcy przed usunięciem
  const recipient = await prisma.recipient.findUnique({
    where: { id }
  });
  
  const deletedRecipient = await prisma.recipient.delete({
    where: { id },
  });
  
  // Logowanie usunięcia odbiorcy
  if (request && recipient) {
    await RecipientLogService.logRecipientDeletion(request, id, recipient.name);
  }
  
  return deletedRecipient;
} 