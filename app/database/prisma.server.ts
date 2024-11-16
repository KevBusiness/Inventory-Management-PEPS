// src/lib/prisma.server.ts
import { PrismaClient } from "@prisma/client";

// En producción, solo deberías crear una instancia del PrismaClient
// y reutilizarla, ya que Prisma tiene una limitación de conexiones a la DB.
let prisma: PrismaClient;

// Si estamos en un entorno de desarrollo, creamos una nueva instancia en cada solicitud
// en producción reutilizamos la misma instancia para evitar problemas de agotamiento de conexiones.
if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient(); // Prisma en producción
} else {
  // En desarrollo es mejor crear una nueva instancia para cada request
  // solo si no está ya inicializada
  if (!(global as any)._prisma) {
    (global as any)._prisma = new PrismaClient();
  }
  prisma = (global as any)._prisma;
}

export default prisma;
