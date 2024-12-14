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
              ticket: {
                select: {
                  process: true,
                },
              },
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
          process: true,
        },
        select: {
          id: true,
          total: true,
          deliveryDate: true,
        },
      }),
    ]);

    const filteredFlowers = flowers
      .map((flower) => {
        // Filtramos las flores dentro de cada grupo de flores donde ticket.process es true
        const filteredFlowerDetails = flower.flowers.filter(
          (flowerDetail) => flowerDetail.ticket.process === true
        );

        // Si hay flores filtradas, mantenemos el objeto con el nombre y código, junto con las flores filtradas
        if (filteredFlowerDetails.length > 0) {
          return {
            name: flower.name,
            code: flower.code,
            flowers: filteredFlowerDetails,
          };
        }

        // Si no hay flores con ticket.process true, no devolvemos ese grupo de flores
        return null;
      })
      .filter((flower) => flower !== null);

    const processedFlowers = filteredFlowers.map((item) => ({
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
