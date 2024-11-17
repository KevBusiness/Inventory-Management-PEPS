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
