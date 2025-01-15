import db from "~/database/prisma.server";
import { User } from "@prisma/client";
import { getAllLocations } from "~/controllers/locations.server";
import { getTicket } from "~/database/controller/general/tickets";
import AdjustInventory from "~/routes/new.adjust-inventory";

type FlowerData = {
  id: number;
  name: string;
  oldFresh: number;
  oldWilted: number;
  oldAlert: number;
  currentFresh: number | null;
  currentWilted: number | null;
  currentAlert: number | null;
  location: string | null;
  reason: string;
  incorrect: boolean;
  adjustment: number;
  type: string;
};

export async function getData(ticketId: string) {
  const [locations, ticket] = await Promise.all([
    await getAllLocations(),
    await getTicket(ticketId),
  ]);
  return { locations, ticket };
}

export async function updateFlower(
  values: FlowerData[],
  ticketId: number,
  user: User
) {
  try {
    const inventoryAdjustment = await db.inventoryAdjustment.create({
      data: {
        createdBy: user.id,
        ticketId,
      },
    });
    const flowerPromises = values.map(async (flower) => {
      const { incorrect, adjustment, currentFresh, currentWilted } = flower;
      const flowerFound = await db.flower.findUnique({
        where: {
          id: flower.id,
        },
        include: {
          flowerBox: {
            select: {
              min: true,
              currentWiltedPrice: true,
            },
          },
        },
      });

      if (incorrect) {
        // PERDIDAS
        const total =
          flower.type === "Frescas"
            ? Math.abs(adjustment) * flowerFound?.current_price!
            : Math.abs(adjustment) * flowerFound?.flowerBox.currentWiltedPrice!;
        await db.$transaction([
          db.flowerHistory.create({
            data: {
              wiltedQuantity: flower.oldWilted,
              freshQuantity: flower.oldFresh,
              flowerId: flower.id,
            },
          }),
          db.flower.update({
            where: {
              id: flower.id,
            },
            data: {
              currentStockFresh: currentFresh
                ? currentFresh
                : flowerFound?.currentStockFresh,
              currentwiltedFlowers: currentWilted
                ? currentWilted
                : flowerFound?.currentwiltedFlowers,
              locationId: flower.location
                ? +flower.location
                : flowerFound?.locationId,
              min: flower.currentAlert
                ? flower.currentAlert
                : flowerFound?.flowerBox.min,
            },
          }),
          db.adjustTransaction.create({
            data: {
              adjustInventoryId: inventoryAdjustment.id,
              type: flower.type,
              total,
              reason: flower.reason,
              amount: Math.abs(adjustment),
              flowerId: flower.id,
            },
          }),
        ]);
      } else {
        // VENTAS DATOS SENSIBLES Y NO SENSIBLES
        if (adjustment < 0) {
          // Vendiendo
          const total =
            flower.type === "Frescas"
              ? Math.abs(adjustment) * flowerFound?.current_price!
              : Math.abs(adjustment) *
                flowerFound?.flowerBox.currentWiltedPrice!;
          await db.$transaction([
            db.flowerHistory.create({
              data: {
                wiltedQuantity: flower.oldWilted,
                freshQuantity: flower.oldFresh,
                flowerId: flower.id,
              },
            }),
            db.flower.update({
              where: {
                id: flower.id,
              },
              data: {
                currentStockFresh: currentFresh
                  ? currentFresh
                  : flowerFound?.currentStockFresh,
                currentwiltedFlowers: currentWilted
                  ? currentWilted
                  : flowerFound?.currentwiltedFlowers,
                locationId: flower.location
                  ? +flower.location
                  : flowerFound?.locationId,
                min: flower.currentAlert
                  ? flower.currentAlert
                  : flowerFound?.flowerBox.min,
              },
            }),
            db.adjustTransaction.create({
              data: {
                adjustInventoryId: inventoryAdjustment.id,
                flowerId: flower.id,
                total,
                amount: Math.abs(adjustment),
                type: flower.type,
              },
            }),
            db.saleTransaction.create({
              data: {
                flowerId: flower.id,
                price:
                  flower.type === "Frescas"
                    ? flowerFound?.current_price!
                    : flowerFound?.flowerBox.currentWiltedPrice!,
                quantity: Math.abs(adjustment),
                quality: flower.type === "Frescas" ? "Fresca" : "Marchita",
                ticketId,
              },
            }),
          ]);
        } else {
          // De frescas a marchitas o no sensibles
          const currentAmountFlowers = flower.oldFresh + flower.oldWilted;
          const prevAmountFlowers =
            (flower.currentFresh || 0) + (flower.currentWilted || 0);
          if (prevAmountFlowers === currentAmountFlowers) {
            const freshRest = flower.oldFresh - (flower.currentFresh || 0);
            const wiltedRest = flower.oldWilted - (flower.currentWilted || 0);
            const totalFresh = freshRest * flowerFound?.current_price!;
            const totalWilted =
              wiltedRest * flowerFound?.flowerBox.currentWiltedPrice!;
            await db.$transaction([
              db.flowerHistory.create({
                data: {
                  wiltedQuantity: flower.oldWilted,
                  freshQuantity: flower.oldFresh,
                  flowerId: flower.id,
                },
              }),
              db.flower.update({
                where: {
                  id: flower.id,
                },
                data: {
                  currentStockFresh: currentFresh
                    ? currentFresh
                    : flowerFound?.currentStockFresh,
                  currentwiltedFlowers: currentWilted
                    ? currentWilted
                    : flowerFound?.currentwiltedFlowers,
                  locationId: flower.location
                    ? +flower.location
                    : flowerFound?.locationId,
                  min: flower.currentAlert
                    ? flower.currentAlert
                    : flowerFound?.flowerBox.min,
                },
              }),
              db.adjustTransaction.create({
                data: {
                  adjustInventoryId: inventoryAdjustment.id,
                  flowerId: flower.id,
                  total: totalFresh + totalWilted,
                  amount: 0,
                  type: flower.type,
                  reason: "De frescas a marchitas",
                },
              }),
            ]);
            return;
          }
          await db.$transaction([
            db.flowerHistory.create({
              data: {
                wiltedQuantity: flower.oldWilted,
                freshQuantity: flower.oldFresh,
                flowerId: flower.id,
              },
            }),
            db.flower.update({
              where: {
                id: flower.id,
              },
              data: {
                currentStockFresh: currentFresh
                  ? currentFresh
                  : flowerFound?.currentStockFresh,
                currentwiltedFlowers: currentWilted
                  ? currentWilted
                  : flowerFound?.currentwiltedFlowers,
                locationId: flower.location
                  ? +flower.location
                  : flowerFound?.locationId,
                min: flower.currentAlert
                  ? flower.currentAlert
                  : flowerFound?.flowerBox.min,
              },
            }),
          ]);
        }
      }
    });
    await Promise.all(flowerPromises);
  } catch (error) {
    console.log(error);
    return null;
  }
}
