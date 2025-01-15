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
        currentWiltedPrice: true,
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
      locations: item.flowers.reduce(
        (acc, flower) => {
          const { location, currentStockFresh, currentwiltedFlowers } = flower;
          if (location) {
            const { name, id } = location;
            const sortedName = name.trim();
            const groupFound = acc.locations.find((group) => group.id === id);
            if (groupFound) {
              groupFound.amount +=
                currentStockFresh + (currentwiltedFlowers || 0);
            } else {
              acc.locations.push({
                id,
                name: sortedName,
                amount: currentStockFresh + (currentwiltedFlowers || 0),
              });
            }
          }
          return acc;
        },
        {
          locations: [] as any[],
        }
      ).locations,
      total: item.flowers.reduce(
        (acc, flower) =>
          acc +
          flower.currentStockFresh * flower.current_price +
          (flower.currentwiltedFlowers || 0) * (item.currentWiltedPrice ?? 0),
        0
      ),
    }));
  } catch (error) {
    console.log(error);
    return null;
  }
}
