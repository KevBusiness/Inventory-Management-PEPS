import db from "../prisma.server";

type Entrie = {
  date: Date;
  type: string;
  amount: number;
  value: number;
  currentAmount?: number;
  currentValue?: number;
  ticketId: number;
};

type Transaction = {
  date: string;
  entries: Entrie[];
};

type Accumulator = {
  currentAmount: number;
  currentValue: number;
  previousDate: Date;
  items: Transaction[];
};

export async function getPeps() {
  const [tickets, outputs] = await db.$transaction([
    db.ticket.findMany({
      where: {
        process: true,
      },
      include: {
        flowers: true,
      },
    }),
    db.output.findMany({
      select: {
        createdAt: true,
        ticketId: true,
        total: true,
        sales: {
          select: {
            quantity: true,
          },
        },
      },
    }),
  ]);

  const x = tickets.map((ticket) => ({
    date: ticket.deliveryDate!,
    type: "Entrada",
    amount: ticket.flowers.reduce(
      (acc, flower) => acc + flower.initialAmount,
      0
    ),
    value: ticket.flowers.reduce(
      (acc, flower) =>
        acc +
        (flower.currentStockFresh + (flower.currentwiltedFlowers || 0)) *
          flower.current_price,
      0
    ),
    ticketId: ticket.id,
  }));

  const y = outputs.map((output) => ({
    date: output.createdAt,
    type: "Salida",
    amount: output.sales.reduce((acc, sale) => acc + sale.quantity, 0),
    value: output.total,
    ticketId: output.ticketId,
  }));
  const mergedData = [...x, ...y] as Entrie[];
  const result = mergedData
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .reduce<Accumulator>(
      (acc, item) => {
        if (item.type === "Entrada") {
          acc.currentAmount += item.amount;
          acc.currentValue += item.value;
        } else {
          acc.currentAmount -= item.amount;
          acc.currentValue -= item.value;
        }

        item.currentAmount = acc.currentAmount;
        item.currentValue = acc.currentValue;

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
        currentValue: 0,
        previousDate: new Date(),
        items: [],
      }
    );
  const sortedData = result.items.map((item) => {
    return item.entries.length > 1 ? item.entries : item.entries[0];
  });
  return sortedData;
}
