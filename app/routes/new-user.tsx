import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
  redirect,
} from "@remix-run/node";
import { Form, useLoaderData, useSubmit } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import {
  getNotifications,
  readNotifications,
} from "~/controllers/notifications.server";
import Layout from "~/layouts/main";
import { authenticator } from "~/services/auth.server";
import db from "~/database/prisma.server";
import { AlertCircle, Eye, EyeClosed } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { useState } from "react";
import { Switch } from "~/components/ui/switch";
import bcrypt from "bcryptjs";

export const meta: MetaFunction = () => {
  return [
    { title: "Nuevo usuario | Inventory Management" },
    {
      name: "description",
      content: "point of sale of the inventory management system",
    },
  ];
};

export async function action({ request }: ActionFunctionArgs) {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/",
  });
  if (!user) {
    throw new Error("User not found.");
  }
  if (user?.role !== "Owner" && user?.role !== "Supervisor") {
    throw new Response("Unauthorized", { status: 403 });
  }
  const formData = await request.formData();
  const ref = formData.get("ref") as string;
  if (ref) {
    const notifications = JSON.parse(
      formData.get("notifications") as string
    ) as number[];
    try {
      await readNotifications(notifications, user);
      return null;
    } catch (error) {
      console.log(error);
      return null;
    }
  }
  const name = formData.get("name_user") as string;
  const lastname = formData.get("lastname_user") as string;
  const password = formData.get("password_user") as string;
  const supervisor = formData.get("supervisor") as any;
  const hashPassword = await bcrypt.hash(password, 10);
  const role = supervisor === "true" ? "Supervisor" : "Employed";
  try {
    await db.user.create({
      data: {
        name,
        lastname,
        password: hashPassword,
        role,
        credential: Math.floor(100000 + Math.random() * 900000),
      },
    });
    await db.notification.create({
      data: {
        concept: "Nuevo usuario creado.",
        activity: `El usuario ${name} ${lastname} se creo con exito.`,
        createdBy: user.id,
      },
    });
    return redirect("/users");
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/",
  });
  if (user?.role !== "Supervisor" && user?.role !== "Owner") {
    return redirect("/dashboard");
  }
  try {
    const notifications = await getNotifications();
    return { user, notifications };
  } catch (error) {
    console.log(error);
    return null;
  }
}

export default function NewUser() {
  const data = useLoaderData<typeof loader>();
  const submit = useSubmit();
  const [showPassword, setShowPassword] = useState(false);
  const [isAdmin, setAdmin] = useState(false);
  return (
    <Layout user={data?.user!} notifications={data?.notifications}>
      <div className="mt-10 bg-white w-1/2 mx-auto rounded-md p-4 overflow-hidden shadow-2xl">
        <Form
          method="POST"
          className="h-full flex flex-col justify-between"
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            formData.append("supervisor_user", `${isAdmin}`);
            submit(formData, { method: "POST" });
          }}
        >
          <div>
            <h3 className="text-center font-bold text-2xl">Crear cuenta</h3>
            <p className="text-center text-sm mt-2">
              Rellena los campos correspondientes para crear una nueva cuenta.
            </p>
            <div className="space-y-4 my-4">
              <div className="flex gap-x-2">
                <div className="space-y-2 w-1/2">
                  <Label htmlFor="name_user">Nombre del usuario:</Label>
                  <Input
                    type="text"
                    name="name_user"
                    id="name_user"
                    placeholder="Ingrese el nombre de usuario"
                    className="h-12 font-light placeholder-shown:invalid:border-neutral-200 focus:invalid:ring-red-500 focus:invalid:ring-1 invalid:border-red-500 focus:valid:ring-1 focus:valid:ring-blue-500 valid:border-blue-500"
                    required
                  />
                  {/* <Alert key={error.path} variant={"destructive"}>
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error.message}</AlertDescription>
                      </Alert> */}
                  {/* <Alert key={error.path} variant={"destructive"}>
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error.message}</AlertDescription>
                      </Alert> */}
                </div>
                <div className="space-y-2 w-1/2">
                  <Label htmlFor="lastname_user">Apellido del usuario:</Label>
                  <Input
                    type="text"
                    name="lastname_user"
                    id="lastname_user"
                    placeholder="Ingrese el apellido del usuario"
                    className="h-12 font-light placeholder-shown:invalid:border-neutral-200 focus:invalid:ring-red-500 focus:invalid:ring-1 invalid:border-red-500 focus:valid:ring-1 focus:valid:ring-blue-500 valid:border-blue-500"
                    required
                  />
                  {/* <Alert key={error.path} variant={"destructive"}>
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error.message}</AlertDescription>
                      </Alert> */}
                  {/* <Alert key={error.path} variant={"destructive"}>
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error.message}</AlertDescription>
                      </Alert> */}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password_user">contraseña:</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    name="password_user"
                    id="password_user"
                    placeholder="Ingrese su contraseña"
                    className="h-12 font-light pr-10 placeholder-shown:invalid:border-neutral-200 focus:invalid:ring-red-500 focus:invalid:ring-1 invalid:border-red-500 focus:valid:ring-1 focus:valid:ring-blue-500 valid:border-blue-500"
                    required
                  />
                  <div className="absolute top-4 right-3">
                    {!showPassword ? (
                      <EyeClosed
                        className="h-5 w-5 text-neutral-800 cursor-pointer"
                        onClick={() => setShowPassword(!showPassword)}
                      />
                    ) : (
                      <Eye
                        className="h-5 w-5 text-neutral-800 cursor-pointer"
                        onClick={() => setShowPassword(!showPassword)}
                      />
                    )}
                  </div>
                </div>
                {/* {issues &&
                  issues
                    .filter((error) => error.path === "password")
                    .map((error) => (
                      <Alert key={error.path} variant={"destructive"}>
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error.message}</AlertDescription>
                      </Alert>
                    ))} */}
                {/* {issues &&
                  issues
                    .filter((error) => error.path === "invalid_password")
                    .map((error) => (
                      <Alert key={error.path} variant={"destructive"}>
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error.message}</AlertDescription>
                      </Alert>
                    ))} */}
              </div>
              <div className="space-y-2">
                <Label htmlFor="role_user">El usuario es supervisor?</Label>
                <div className="relative">
                  <Switch
                    id="role_user"
                    onCheckedChange={(value) => setAdmin(value)}
                  />
                </div>
              </div>
              <Button
                type="submit"
                className="h-12 w-full"
                // disabled={navigation.state === "submitting" ? true : false}
              >
                Crear cuenta
              </Button>
            </div>
          </div>
          <p className="text-center">
            Problemas para crear una cuenta?
            <br />
            <a
              href="https://wa.me/1234567890"
              target="_blank"
              className="text-blue-500"
            >
              Comunicarse con soporte
            </a>
          </p>
        </Form>
      </div>
    </Layout>
  );
}
