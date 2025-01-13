import { NotificationView, User } from "@prisma/client";
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

export async function readNotifications(data: number[], user: User) {
  const promises = data.map(async (notificationId) => {
    return await db.notificationView.create({
      data: {
        userId: user.id,
        notificationId,
      },
    });
  });
  await Promise.all(promises);
}
