import db from "./app/database/prisma.server";
import bcrypt from "bcryptjs";
// import { faker } from "@faker-js/faker";

async function main() {
  await db.user.create({
    data: {
      name: "Kevin",
      lastname: "Felix",
      credential: 123456,
      password: await bcrypt.hash("password", 10),
      role: "Owner",
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
