import { z } from "zod";

const onlyNumbers = /^\d+$/;

const loginValidation = z.object({
  credential: z
    .string()
    .min(5, "Tu credencial es demasiado corta.")
    .regex(onlyNumbers, "Tu credencial debe contener solo números."),
  password: z.string().min(6, "Tu password debe ser minimo de 6 caracteres."),
});

export { loginValidation };
