import db from "../prisma.server";

export async function getCurrentStock() {
  try {
    const stock = await db.flowerBox.findMany({
      select: {
        name: true,
        code: true,
        min: true,
        flowers: {
          where: {
            ticket: {
              process: true,
            },
          },
          select: {
            location: true,
            currentStockFresh: true,
            currentwiltedFlowers: true,
            current_price: true,
            ticket: {
              select: {
                process: true,
              },
            },
          },
        },
      },
    });
    return stock.map((item) => ({
      name: item.name,
      code: item.code,
      currentAmout: item.flowers.reduce(
        (acc, flower) => acc + flower.currentStockFresh,
        0
      ),
      currentWilted: item.flowers.reduce(
        (acc, flower) => acc + (flower.currentwiltedFlowers || 0),
        0
      ),
      min: item.min,
      locations: item.flowers.join("location").length > 0 ? true : false,
      total: item.flowers.reduce(
        (acc, flower) => acc + flower.currentStockFresh * flower.current_price,
        0
      ),
    }));
  } catch (error) {
    console.log(error);
    return null;
  }
}
