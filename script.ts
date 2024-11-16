import db from "./app/database/prisma.server";
import bcrypt from "bcryptjs";

async function main() {
  console.log("Seeding...");

  // Crear usuarios de ejemplo
  await db.user.create({
    data: {
      name: "Usuario",
      lastname: "Ejemplo",
      credential: 123456,
      password: await bcrypt.hash("123456", 10),
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
