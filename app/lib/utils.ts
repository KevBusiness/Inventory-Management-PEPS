import { Flower } from "@prisma/client";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Schema } from "zod";

export function getErrorsFromSchema(schema: Schema, data: Record<string, any>) {
  let errors = schema.safeParse(data).error?.errors;
  const x = errors?.map((error) => ({
    message: error.message,
    path: error.path.join("."),
  }));
  return x;
}

export function formatToDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("es-MX", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

export function formatToMXN(amount: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(amount);
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateUniqueCode(): number {
  const timestamp = Date.now();
  const randomNum = Math.floor(Math.random() * 1000000);
  const code = (timestamp + randomNum) % 1000000;
  return code;
}

export function generateFolioNumber(length: number = 8): number {
  let folioNumber = "";
  for (let i = 0; i < length; i++) {
    folioNumber += Math.floor(Math.random() * 10).toString();
  }
  return parseInt(folioNumber, 10);
}

export function calculateProfitOrLossPercentage(
  costValue: number,
  salesValue: number
) {
  if (salesValue > costValue) {
    let profit = ((salesValue - costValue) / costValue) * 100;
    return profit.toFixed(0);
  } else {
    let loss = ((costValue - salesValue) / costValue) * 100;
    return -loss.toFixed(0);
  }
}
