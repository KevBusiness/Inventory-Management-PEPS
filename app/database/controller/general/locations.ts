import db from "../../prisma.server";

export async function getAllLocations() {
  try {
    return await db.location.findMany();
  } catch (error) {
    console.log(error);
    return null;
  }
}
