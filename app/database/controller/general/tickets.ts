import db from "../../prisma.server";

/**
 * Esta función obtiene los datos necesarios para mostrar el componente `TicketCard` en las páginas.
 * Recupera todos los tickets disponibles (`status: "Disponible"`) y, por cada ticket, incluye información
 * sobre las flores asociadas (stock actual, cantidad de flores marchitas, cantidad inicial) y las ventas
 * realizadas (total de ventas).
 *
 * @returns Una lista de tickets disponibles con la información relacionada a flores y ventas, o `null` en caso de error.
 */

export async function getAllTickets() {
  try {
    return await db.ticket.findMany({
      where: {
        status: "Disponible",
      },
      include: {
        flowers: {
          select: {
            currentStockFresh: true,
            currentwiltedFlowers: true,
            initialAmount: true,
            current_price: true,
          },
        },
        sales: {
          select: {
            total: true,
          },
        },
      },
    });
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function getTicket(id: string) {
  try {
    return await db.ticket.findUnique({
      where: {
        id: +id,
      },
      include: {
        flowers: {
          include: {
            location: {
              select: {
                id: true,
                name: true,
              },
            },
            flowerBox: {
              select: {
                name: true,
                currentWiltedPrice: true,
                min: true,
                location: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  } catch (error) {
    console.log(error);
    return null;
  }
}
