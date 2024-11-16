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
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
