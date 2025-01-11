import db from "../database/prisma.server";
import capitalize from "lodash/capitalize";

interface Flower {
  currentStockFresh: number;
  currentwiltedFlowers: number | null;
  flowerBoxId: number;
  ticketId: number;
  flowerBox: {
    name: string;
  };
}

interface LocationData {
  name: string;
  Flowers: Flower[];
  FlowerBox: any; // Ajusta según el tipo de FlowerBox
  defaultLocation?: boolean | null;
}

interface GroupedFlower {
  flowerBoxId: number;
  currentStockFresh: number;
  currentwiltedFlowers: number;
  name: string;
}

interface SortedLocationData {
  name: string;
  groupedFlowers: GroupedFlower[];
  defaultLocation?: boolean | null;
}

export async function getAllLocations() {
  try {
    return await db.location.findMany();
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function getSortedLocations() {
  try {
    const data: LocationData[] = await db.location.findMany({
      select: {
        name: true,
        defaultLocation: true,
        Flowers: {
          where: {
            ticket: {
              process: true,
            },
          },
          select: {
            currentStockFresh: true,
            currentwiltedFlowers: true,
            flowerBoxId: true,
            ticketId: true,
            flowerBox: {
              select: {
                name: true,
              },
            },
          },
        },
        FlowerBox: true,
      },
    });

    const sortedData: SortedLocationData[] = data.map(
      ({ name, Flowers, defaultLocation }) => {
        // Agrupar las flores por flowerBoxId
        const flowersGroupedByBox = Flowers.reduce<
          Record<number, GroupedFlower>
        >((acc, flower) => {
          const {
            flowerBoxId,
            currentStockFresh,
            currentwiltedFlowers,
            flowerBox: { name },
          } = flower;

          // Si ya existe ese flowerBoxId en el acumulador, sumamos los valores
          if (acc[flowerBoxId]) {
            acc[flowerBoxId].currentStockFresh += currentStockFresh;
            if (currentwiltedFlowers !== null) {
              acc[flowerBoxId].currentwiltedFlowers += currentwiltedFlowers;
            }
          } else {
            // Si no existe, inicializamos el objeto
            acc[flowerBoxId] = {
              name,
              flowerBoxId,
              currentStockFresh,
              currentwiltedFlowers: currentwiltedFlowers ?? 0, // Aseguramos que no sea null
            };
          }

          return acc;
        }, {});

        // Convertir el objeto acumulado en un array de objetos
        const groupedFlowers: GroupedFlower[] =
          Object.values(flowersGroupedByBox);

        return {
          name,
          groupedFlowers,
          defaultLocation,
        };
      }
    );

    return sortedData;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function createLocation(
  name: string,
  defaultLocation: string | null,
  createdBy: number
) {
  try {
    let sortedName: string = "";
    if (!name) throw new Error("Name not found.");
    name.split(" ").forEach((word) => {
      sortedName += " " + capitalize(word);
    });

    const location = await db.location.create({
      data: {
        name: sortedName,
        defaultLocation: defaultLocation ? true : null,
      },
    });

    await db.notification.create({
      data: {
        concept: "Nueva ubicacion",
        activity: `Ubicación ${sortedName} creada.`,
        createdBy: createdBy,
      },
    });

    return location;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function deleteLocation(id: number, userId: number) {
  try {
    const locationFound = await db.location.findUnique({
      where: {
        id,
      },
    });

    await db.location.delete({
      where: {
        id,
      },
    });

    await db.notification.create({
      data: {
        concept: "Ubicacion eliminada",
        activity: `La ubicacion ${locationFound?.name} a sido eliminada.`,
        createdBy: userId,
      },
    });

    return { success: true };
  } catch (error) {
    console.log(error);
    return null;
  }
}
