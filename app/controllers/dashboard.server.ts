import db from "~/database/prisma.server";

export async function getData() {
  try {
    const [transactions, flowers, tickets] = await db.$transaction([
      db.saleTransaction.findMany({
        select: {
          saleDate: true,
          price: true,
          quantity: true,
          productId: true,
          product: {
            select: {
              flowers: true,
            },
          },
        },
        orderBy: {
          saleDate: "asc",
        },
      }),
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
      db.ticket.findMany({
        where: {
          process: true,
        },
        orderBy: {
          deliveryDate: "asc",
        },
      }),
    ]);

    return {
      chartsData: {
        sales: {
          data: sortedTransactions(transactions),
        },
        inventory: { data: sortedTickets(tickets) },
      },
      flowers: sortedFlowers(flowers),
      tickets: tickets,
    };
  } catch (error) {
    console.log(error);
    db.$disconnect();
    process.exit(1);
  }
}

type FlowerFetch = {
  name: string;
  code: number | null;
  flowers: {
    currentStockFresh: number;
    currentwiltedFlowers: number | null;
    ticket: {
      process: boolean | null;
    };
  }[];
};

type EntryFlower = {
  id: number;
  name: string;
  amount: number;
};

function sortedFlowers(data: FlowerFetch[]) {
  return data
    .map((flower) => {
      const filteredFlowerDetails = flower.flowers.filter(
        (flowerDetail) => flowerDetail.ticket.process === true
      );

      if (filteredFlowerDetails.length > 0) {
        return {
          name: flower.name,
          code: flower.code,
          flowers: filteredFlowerDetails,
        };
      }
      return null;
    })
    .filter((flower) => flower !== null)
    .map((item) => ({
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
}

type DataByDate = {
  date: string;
  data: {
    price: number;
    quantity: number;
    saleDate: Date;
    productId: number | null;
    product: {
      flowers: string;
    };
  }[];
};

function sortedTickets(data: any[]) {
  const { items } = data.reduce(
    (acc, item) => {
      const currentDate = item.deliveryDate.toISOString().split("T")[0];

      const groupFound = acc.items.find(
        (group: { date: any }) => group.date === currentDate
      );

      if (groupFound) {
        groupFound.data.push(item);
      } else {
        acc.items.push({ date: currentDate, data: [item] });
      }

      return acc;
    },
    {
      items: [],
    }
  );
  const allData = items.map((item: any) => ({
    date: item.date,
    total: item.data.reduce((acc: any, x: any) => acc + x.total, 0),
  }));

  const allDataWithTicketId = items.map((item: any) => ({
    date: item.date,
    data: item.data,
  }));

  // Me quede en agregar los datos a los 2 campos mas;
  return [allData, allDataWithTicketId];
}

function groupDataByDate(data: any[]): DataByDate[] {
  const sortedData = data.reduce(
    (acc, item) => {
      const currentDate = item.saleDate.toISOString().split("T")[0];

      const groupFound = acc.items.find(
        (group: { date: any }) => group.date === currentDate
      );

      if (groupFound) {
        groupFound.data.push(item);
      } else {
        acc.items.push({ date: currentDate, data: [item] });
      }

      return acc;
    },
    {
      items: [],
    }
  );
  return sortedData.items;
}

function sortedTransactions(data: any[]) {
  const dataByDate = groupDataByDate(data); // Supongo que este método agrupa los datos por fecha

  const allData = dataByDate.map((item) => {
    const totalWithProductId = item.data
      .filter((x) => x.productId !== null) // Filtrar solo los que tienen productId
      .reduce((acc, x) => {
        try {
          if (x.product && x.product.flowers) {
            const flowers = JSON.parse(x.product.flowers) as EntryFlower[]; // Parseamos las flores
            const totalFlowers = flowers.reduce(
              (acc, flower) => acc + flower.amount,
              0
            );

            if (totalFlowers === 0) {
              return acc;
            }

            return acc + (x.quantity / totalFlowers) * x.price;
          } else {
            return acc + x.price * x.quantity;
          }
        } catch (error) {
          console.error("Error al procesar flores para el producto:", x);
          return acc;
        }
      }, 0);

    const totalWithoutProductId = item.data
      .filter((x) => x.productId === null)
      .reduce((acc, x) => acc + x.price * x.quantity, 0);

    return {
      date: item.date,
      total: totalWithProductId + totalWithoutProductId, // Sumamos ambos totales
    };
  });

  const onlySalesbyFlowers = dataByDate
    .map((item) => ({
      date: item.date,
      total: item.data
        .filter((item) => item.productId === null)
        .reduce((acc, x) => acc + x.price * x.quantity, 0),
    }))
    .filter((item) => item.total > 0);
  const onlySalesByProduct = dataByDate
    .map((item) => ({
      date: item.date,
      total: item.data
        .filter((item) => item.productId !== null)
        .reduce((acc, x) => {
          const flowers = JSON.parse(x.product.flowers) as EntryFlower[];
          const totalFlowers = flowers.reduce(
            (acc, flower) => acc + flower.amount,
            0
          );
          return acc + (x.quantity / totalFlowers) * x.price;
        }, 0),
    }))
    .filter((item) => item.total > 0);
  return [allData, onlySalesbyFlowers, onlySalesByProduct];
}
