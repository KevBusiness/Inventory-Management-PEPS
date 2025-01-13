import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
  redirect,
} from "@remix-run/node";
import { authenticator } from "~/services/auth.server";
import db from "~/database/prisma.server";
import { getNotifications } from "~/controllers/notifications.server";
import { useLoaderData, useSubmit } from "@remix-run/react";
import Layout from "~/layouts/main";
import { Button } from "~/components/ui/button";

export const meta: MetaFunction = () => {
  return [
    { title: "Usuarios | Inventory Management" },
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
  if (request.method === "DELETE") {
    if (user?.role !== "Owner" && user?.role !== "Supervisor") {
      throw new Error("No tienes permisos.");
    }
    const formData = await request.formData();
    const userID = formData.get("id") as string;
    try {
      await db.user.delete({
        where: {
          id: +userID,
        },
      });
      await db.notification.create({
        data: {
          concept: "Usuario eliminado",
          activity: "Se elimino un usuario del inventario",
          createdBy: user?.id!,
        },
      });
      return null;
    } catch (error) {
      console.log(error);
      return null;
    }
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
    const [users, notifications] = await Promise.all([
      db.user.findMany(),
      getNotifications(),
    ]);
    const sortedUsers = users.filter((userDB) => userDB.id !== user.id);
    return { sortedUsers, notifications, user };
  } catch (error) {
    console.log(error);
    return null;
  }
}

export default function users() {
  const data = useLoaderData<typeof loader>();
  const submit = useSubmit();
  return (
    <Layout user={data?.user!} notifications={data?.notifications}>
      <div className="grid grid-cols-3 p-5 gap-5">
        {data?.sortedUsers.map((user) => (
          <div
            key={user.id}
            className="bg-white border p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
          >
            <div className="flex flex-col space-y-4">
              {/* Nombre y Apellido */}
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  {/* Avatar Placeholder */}
                  <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center text-white text-xl">
                    {user.name?.[0]}
                    {user.lastname?.[0]}
                    {/* Usamos la primera letra del nombre */}
                  </div>
                </div>
                <div className="flex flex-col">
                  <h3 className="text-xl font-semibold text-gray-800">
                    {user.name} {user.lastname}
                  </h3>
                  <p className="text-sm text-gray-500">{user.role}</p>
                </div>
              </div>

              {/* Credential (Email) */}
              <div className="flex justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Credential:</span>
                  <span className="text-sm font-medium text-gray-800">
                    {user.credential}
                  </span>
                </div>
                <Button
                  onClick={() => {
                    submit({ id: user.id }, { method: "DELETE" });
                  }}
                  type="button"
                  variant={"destructive"}
                >
                  Eliminar
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
}
