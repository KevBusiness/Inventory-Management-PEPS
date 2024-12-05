import db from "./app/database/prisma.server";
import bcrypt from "bcryptjs";
import { faker } from "@faker-js/faker";

async function main() {
  console.log("Seeding...");

  const users = [];
  // make 2 users
  for (let i = 0; i < 2; i++) {
    const user = await db.user.create({
      data: {
        name: faker.person.firstName(),
        lastname: faker.person.lastName(),
        credential: faker.number.int({ min: 100000, max: 999999 }),
        password: await bcrypt.hash("password", 10),
        role: "Owner",
      },
    });
    users.push(user);
  }
  // // make 20 flowers categories
  // const categories = [];
  // for (let i = 0; i < 20; i++) {
  //   const category = await db.flowerCategory.create({
  //     data: {
  //       name: faker.commerce.productName(),
  //     },
  //   });
  //   categories.push(category);
  // }

  // // make 10 tickets
  // const tickets = [];
  // for (let i = 0; i < 8; i++) {
  //   const createdAt = faker.date.recent({ days: 75 });
  //   const ticket = await db.ticket.create({
  //     data: {
  //       revenue: 0,
  //       status: "Disponible",
  //       type: "Entregado",
  //       userId: users[faker.number.int({ min: 0, max: 1 })].id,
  //       createdAt: createdAt,
  //       updatedAt: faker.date.between({ from: createdAt, to: new Date() }),
  //     },
  //   });
  //   tickets.push(ticket);
  // }

  // // for (let i = 0; i < 4; i++) {
  // //   const createdAt = faker.date.recent({ days: 10 });
  // //   const ticket = await db.ticket.create({
  // //     data: {
  // //       status: "Cerrado",
  // //       type: "Venta",
  // //       userId: users[faker.number.int({ min: 0, max: 1 })].id,
  // //       createdAt: faker.date.recent({ days: 10 }),
  // //       updatedAt: faker.date.between({ from: createdAt, to: new Date() }),
  // //     },
  // //   });
  // //   tickets.push(ticket);
  // // }

  // for (let i = 0; i < 40; i++) {
  //   const amount = faker.number.int({ min: 500, max: 20000 });
  //   const amountSell = faker.number.int({ min: 0, max: amount });
  //   const createdAt = faker.date.recent({ days: 10 });

  //   await db.flower.create({
  //     data: {
  //       freshQuantity: amount,
  //       wiltedQuantity: 0,
  //       price: faker.number.int({ min: 0, max: 100 }),
  //       min_amount: faker.number.int(300),
  //       createdAt: createdAt,
  //       updatedAt: faker.date.between({ from: createdAt, to: new Date() }),
  //       flowerCategoryId: categories[faker.number.int({ min: 0, max: 19 })].id,
  //       ticketId: tickets[faker.number.int({ min: 0, max: 7 })].id,
  //     },
  //   });
  // }

  // for (let i = 0; i < 30; i++) {
  //   const amount = faker.number.int({ min: 500, max: 20000 });
  //   const amountSell = faker.number.int({ min: 0, max: amount });
  //   const createdAt = faker.date.recent({ days: 10 });

  //   await db.flower.create({
  //     data: {
  //       freshQuantity: amount,
  //       wiltedQuantity: 0,
  //       price: faker.number.int({ min: 0, max: 100 }),
  //       min_amount: faker.number.int(300),
  //       createdAt: createdAt,
  //       updatedAt: faker.date.between({ from: createdAt, to: new Date() }),
  //       flowerCategoryId: categories[faker.number.int({ min: 0, max: 19 })].id,
  //       ticketId: tickets[faker.number.int({ min: 0, max: 7 })].id,
  //     },
  //   });
  // }

  // for (let i = 0; i < 15; i++) {
  //   const amount = faker.number.int({ min: 500, max: 20000 });
  //   const amountSell = faker.number.int({ min: 0, max: amount });
  //   const createdAt = faker.date.recent({ days: 10 });

  //   await db.flower.create({
  //     data: {
  //       freshQuantity: amount,
  //       wiltedQuantity: amount / 2,
  //       price: faker.number.int({ min: 0, max: 100 }),
  //       min_amount: faker.number.int(300),
  //       createdAt: createdAt,
  //       updatedAt: faker.date.between({ from: createdAt, to: new Date() }),
  //       flowerCategoryId: categories[faker.number.int({ min: 0, max: 19 })].id,
  //       ticketId: tickets[faker.number.int({ min: 0, max: 7 })].id,
  //     },
  //   });
  // }

  console.log("Completed...");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
