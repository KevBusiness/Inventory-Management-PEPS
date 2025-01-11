import db from "~/database/prisma.server";

export async function getNotifications() {
  return await db.notification.findMany({
    include: {
      seenBy: true,
      user: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}
