import { User } from "@prisma/client";
import db from "../prisma.server";
import { getAllLocations } from "./general/locations";
import { getTicket } from "./general/tickets";

export async function getData(ticketId: string) {
  const [locations, ticket] = await Promise.all([
    await getAllLocations(),
    await getTicket(ticketId),
  ]);
  return { locations, ticket };
}

export async function UpdateInventory(values: any, user: User) {
  const data = sortedData(values);
}

function sortedData(values: any): any {
  console.log(values);
  return null;
}
