import { Authenticator } from "remix-auth";
import { FormStrategy } from "remix-auth-form";
import { AuthorizationError } from "remix-auth";
import { User } from "@prisma/client";
import bcrypt from "bcryptjs";
import db from "../database/prisma.server";
import { sessionStorage } from "~/services/user.session.server";
import { loginValidation } from "~/schemas/user.schema";
import { getErrorsFromSchema } from "~/lib/utils";
import type { ErrorsFromValidations } from "~/lib/types";

export let authenticator = new Authenticator<User | null>(sessionStorage);

authenticator.use(
  new FormStrategy(async ({ form }) => {
    let user: User | null = null;
    let errors: ErrorsFromValidations[] = [];
    const credential = form.get("credential_user") as unknown as string;
    const password = form.get("password_user") as unknown as string | undefined;
    errors =
      getErrorsFromSchema(loginValidation, { credential, password }) || [];
    if (errors.length > 0) {
      throw new AuthorizationError(JSON.stringify(errors));
    }
    user = await db.user.findUnique({
      where: { credential: parseInt(credential) },
    });
    if (!user) {
      errors?.push({
        message: "Usuario no encontrado.",
        path: "user_not_found",
      });
    }

    if (password && user) {
      const passwordMath = await bcrypt.compare(password, user.password);
      if (!passwordMath) {
        errors?.push({
          message: "Contraseña incorrecta.",
          path: "invalid_password",
        });
      }
    }
    if (errors.length > 0) {
      throw new AuthorizationError(JSON.stringify(errors));
    }
    return user;
  }),
  "user-pass"
);
