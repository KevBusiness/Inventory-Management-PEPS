import { User } from "@prisma/client";
import db from "~/database/prisma.server";
import type { UpdatedFlowers } from "~/lib/types";
import { formatToMXN } from "~/lib/utils";

export async function createIndividualSale(
  flowers: UpdatedFlowers[],
  ticket: string,
  user: User
) {
  const output = await db.output.create({
    data: {
      createdBy: user?.id!,
      ticketId: Number(ticket!),
      total: 0,
    },
  });
  flowers.forEach(async (flower) => {
    const flower_updated = await db.flower.update({
      where: {
        id: flower.id,
      },
      data: {
        currentStockFresh: {
          decrement: flower.type === "fresh" ? flower.value : 0,
        },
        currentwiltedFlowers: {
          decrement: flower.type === "wilted" ? flower.value : 0,
        },
      },
    });
    await db.saleTransaction.create({
      data: {
        flowerId: flower_updated.id,
        price:
          flower.type === "fresh" ? flower_updated.current_price : flower.price,
        quantity: flower.value,
        quality: flower.type === "fresh" ? "Fresca" : "Marchita",
        outputId: output.id,
      },
    });
  });
  await db.output.update({
    where: {
      id: output.id,
    },
    data: {
      total: flowers.reduce(
        (acc: number, flower: UpdatedFlowers) =>
          acc + flower.value * flower.price,
        0
      ),
    },
  });
  const ticketFound = await db.ticket.findUnique({
    where: {
      id: +ticket!,
    },
    include: {
      flowers: {
        select: {
          currentStockFresh: true,
          currentwiltedFlowers: true,
        },
      },
    },
  });
  if (
    ticketFound?.flowers.reduce(
      (acc, flower) =>
        acc + (flower.currentStockFresh + (flower.currentwiltedFlowers || 0)),
      0
    ) === 0
  ) {
    await db.ticket.update({
      where: {
        id: ticketFound.id,
      },
      data: {
        status: "Agotado",
      },
    });
  }
  await db.notification.create({
    data: {
      concept: "Venta individual exitosa.",
      activity: `Se realizo una venta de ${formatToMXN(
        flowers.reduce(
          (acc: number, flower: UpdatedFlowers) =>
            acc + flower.value * flower.price,
          0
        )
      )} individual exitosa.`,
      createdBy: user.id,
    },
  });
}
