import { Flower, User } from "@prisma/client";
import db from "~/database/prisma.server";
import { formatToMXN } from "~/lib/utils";
// PASOS:
// 1. Buscar las flores mas viejas en la base de datos y restarlas
// 2. Crear una nueva venta con el producto Id
// Ejemplo de data:
// [
//   {
//     id: 2,
//     name: "Ramo de rosas de 24",
//     price: 400,
//     picture: "ramo-24-rosas.webp",
//     flowers: '[{"id":1,"name":"Rosas","amount":24}]',
//     select: true,
//     amount: 1,
//   },
// ];

type Data = {
  id: number;
  name: string;
  price: number;
  picture: string;
  flowers:
    | {
        id: number;
        name: string;
        amount: number;
      }[]
    | string;
  select: boolean;
  amount: number;
};

export async function createSale(data: Data[], user: User) {
  try {
    let oldestFlowers: any[] = [];
    const promises = data.map(async (item) => {
      item.flowers = JSON.parse(item.flowers as string);

      if (!Array.isArray(item.flowers)) throw new Error("No es un array");

      const flowerPromises = item.flowers.map(async (flower) => {
        const flowerBox = await db.flowerBox.findFirst({
          where: {
            id: flower.id,
          },
          select: {
            flowers: true,
            name: true,
          },
        });

        const flowerFound = flowerBox?.flowers
          .sort(
            (a, b) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          )
          .filter((f) => f.currentStockFresh > flower.amount)[0];

        if (flowerFound) {
          await db.flower.update({
            where: {
              id: flowerFound.id,
            },
            data: {
              currentStockFresh: {
                decrement: flower.amount * item.amount,
              },
            },
          });
          oldestFlowers.push({
            amount: flower.amount * item.amount,
            loteId: flowerFound.ticketId,
            name: flowerBox.name,
            product: item.name,
            sellAmount: item.amount,
            currentPrice: flowerFound.current_price,
          });
        }
      });

      // Esperamos a que todas las promesas de flowers se resuelvan
      await Promise.all(flowerPromises);

      const totalQuantity =
        item.flowers.reduce((acc, flower) => acc + flower.amount, 0) || 0;

      await db.saleTransaction.create({
        data: {
          price: item.price,
          quantity: totalQuantity * item.amount,
          priceIndividual: oldestFlowers.reduce(
            (acc, flower) => acc + flower.currentPrice * flower.amount,
            0
          ),
          quality: "Fresca",
          productId: item.id,
          createdBy: user.id,
        },
      });
      await db.notification.create({
        data: {
          concept: `Venta del producto - ${item.name} - exitosa.`,
          activity: `Se realizo la venta de ${
            item.amount
          } producto/s por la cantidad de ${formatToMXN(
            item.price * item.amount
          )}`,
          createdBy: user.id,
        },
      });
    });

    // Esperamos a que todas las promesas de data se resuelvan
    await Promise.all(promises);
    return oldestFlowers;
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}
