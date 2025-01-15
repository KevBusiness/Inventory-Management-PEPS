import db from "../prisma.server";

type Transaction = {
  date: Date;
  type: string;
  amount: number;
  total: number;
  ticket: number;
  currentAmount?: number;
  currentTotal?: number;
};

type FlowerEntry = {
  id: number;
  name: string;
  amount: number;
};

const getStockPeps = async () => {
  const [sales, tickets, adjusts] = await db.$transaction([
    db.saleTransaction.findMany({
      select: {
        saleDate: true,
        price: true,
        quantity: true,
        ticketId: true,
        priceIndividual: true,
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
    db.ticket.findMany({
      where: {
        process: true,
      },
      include: {
        flowers: {
          include: {
            flowerBox: {
              select: {
                currentPrice: true,
              },
            },
          },
        },
      },
      orderBy: {
        deliveryDate: "asc",
      },
    }),
    db.adjustTransaction.findMany({
      include: {
        inventory: {
          select: {
            ticketId: true,
          },
        },
      },
      orderBy: {
        adjustDate: "asc",
      },
    }),
  ]);
  return { sales, tickets, adjusts };
};

export const getSortedStockData = async () => {
  const { sales, tickets, adjusts } = await getStockPeps();
  const sortedSales = sales.map((sale) => {
    if (sale.product) {
      return {
        date: sale.saleDate,
        type: "Salida",
        amount: sale.quantity,
        total: sale.priceIndividual,
        ticket: sale.ticketId!,
      };
    }
    return {
      date: sale.saleDate,
      type: "Salida",
      amount: sale.quantity,
      total: sale.quantity * sale.price,
      ticket: sale.ticketId!,
    };
  }) as Transaction[];
  const sortedTickets = tickets.map((ticket) => ({
    date: ticket.deliveryDate!,
    type: "Entrada",
    amount: ticket.flowers.reduce(
      (acc, flower) => acc + flower.initialAmount,
      0
    ),
    total: ticket.flowers.reduce(
      (acc, flower) => acc + flower.initialAmount * flower.current_price,
      0
    ),
    ticket: ticket.id,
  })) as Transaction[];
  const sortedAdjusts = adjusts
    .filter((adjs) => adjs.reason !== null)
    .map((adjs) => ({
      date: adjs.adjustDate,
      type: "Perdida",
      amount: adjs.amount,
      total: adjs.total,
      ticket: adjs.inventory.ticketId,
    })) as Transaction[];
  const stockTransactions = [
    ...sortedSales,
    ...sortedTickets,
    ...sortedAdjusts,
  ];
  const name = stockTransactions
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .reduce(
      (acc, item) => {
        if (item.type === "Entrada") {
          acc.currentAmount += item.amount;
          acc.currentTotal += item.total;
        } else {
          acc.currentAmount -= item.amount;
          acc.currentTotal -= item.total;
        }

        item.currentAmount = acc.currentAmount;
        item.currentTotal = acc.currentTotal;

        const formattedDate = item.date.toISOString().split("T")[0];

        const existingGroup = acc.items.find(
          (group) => group.date === formattedDate
        );

        if (existingGroup) {
          existingGroup.entries.push(item);
        } else {
          acc.items.push({ date: formattedDate, entries: [item] });
        }

        acc.previousDate = item.date;
        return acc;
      },
      {
        currentAmount: 0,
        currentTotal: 0,
        previousDate: new Date(),
        items: [] as any[],
      }
    );
  const sortedData = name.items.map((item) => {
    return item.entries.length > 1 ? item.entries : item.entries[0];
  });
  return sortedData;
};
