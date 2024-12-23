import { User } from "@prisma/client";
import db from "../prisma.server";
import { getAllLocations } from "./general/locations.server";
import { getTicket } from "./general/tickets";

export async function getData(ticketId: string) {
  const [locations, ticket] = await Promise.all([
    await getAllLocations(),
    await getTicket(ticketId),
  ]);
  return { locations, ticket };
}

export async function UpdateInventory(
  values: any,
  user: User,
  ticketId: number
) {
  const data = sortedData(values);
  try {
    const inventoryAdjustment = await db.inventoryAdjustment.create({
      data: {
        createdBy: user.id,
        ticketId,
        total: 0,
      },
    });
    Object.values(data).forEach(async (item) => {
      const { flowerId } = item;
      const flowerFound = await db.flower.findUnique({
        where: {
          id: flowerId,
        },
        select: {
          id: true,
          initialAmount: true,
          currentStockFresh: true,
          currentwiltedFlowers: true,
          current_price: true,
        },
      });
      if (!flowerFound) throw new Error("Flower not found.");

      await db.$transaction([
        db.flower.update({
          where: {
            id: flowerId,
          },
          data: {
            locationId: item.location && item.location,
            currentStockFresh: item.currentFresh && item.currentFresh,
            currentwiltedFlowers: item.currentWilted && item.currentWilted,
            min: item.currentMin && item.currentMin,
          },
        }),
        db.adjustTransaction.create({
          data: {
            adjustInventoryId: inventoryAdjustment.id,
            flowerId,
            locationId: item.location && item.location,
            currentStockFresh: item.currentFresh && item.currentFresh,
            currentwiltedFlowers: item.currentWilted && item.currentWilted,
            min: item.currentMin && item.currentMin,
          },
        }),
        db.flowerHistory.create({
          data: {
            wiltedQuantity: flowerFound?.currentwiltedFlowers || 0,
            freshQuantity: flowerFound?.currentStockFresh,
            flowerId,
          },
        }),
      ]);
    });
  } catch (error) {
    console.log(error);
    return null;
  }
}

type Data = {
  [key: string]: any;
};

function sortedData(data: Data[]) {
  return data.reduce((acc, item) => {
    const { flowerId, action, value } = item;

    if (!acc[flowerId]) {
      acc[flowerId] = {
        flowerId,
      };
    }

    switch (action) {
      case "currentFresh":
        acc[flowerId]["currentFresh"] = value;
        break;
      case "currentWilted":
        acc[flowerId]["currentWilted"] = value;
        break;
      case "location":
        acc[flowerId]["location"] = value;
        break;
      case "currentMin":
        acc[flowerId]["currentMin"] = value;
        break;
      default:
        break;
    }

    return acc;
  }, {});
}
