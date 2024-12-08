import db from "../prisma.server";
export async function getData() {
  try {
    const [flowers, sales, tickets] = await db.$transaction([
      db.flowerBox.findMany({
        select: {
          name: true,
          code: true,
          flowers: {
            select: {
              currentStockFresh: true,
              currentwiltedFlowers: true,
            },
          },
        },
      }),
      db.output.findMany({
        select: {
          ticketId: true,
          total: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      }),
      db.ticket.findMany({
        where: {
          status: "Disponible",
        },
        select: {
          id: true,
          total: true,
          deliveryDate: true,
        },
      }),
    ]);

    const processedFlowers = flowers.map((item) => ({
      name: item.name,
      currentFresh: item.flowers.reduce(
        (acc, flower) => acc + flower.currentStockFresh,
        0
      ),
      currentWilted: item.flowers.reduce(
        (acc, flower) => acc + (flower.currentwiltedFlowers || 0),
        0
      ),
    }));

    return { flowers: processedFlowers, sales, tickets };
  } catch (err) {
    console.log(err);
    return null;
  }
}
