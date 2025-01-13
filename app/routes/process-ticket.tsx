import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
  redirect,
} from "@remix-run/node";
import { Form, useLoaderData, useNavigate, useSubmit } from "@remix-run/react";
import db from "~/database/prisma.server";
import { authenticator } from "~/services/auth.server";
import MainLayout from "~/layouts/main";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { useEffect } from "react";
import { toast } from "~/hooks/use-toast";
import { formatToMXN } from "~/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { commitSession, getSession } from "~/services/alerts.session.server";
import {
  getNotifications,
  readNotifications,
} from "~/controllers/notifications.server";

export const meta: MetaFunction = () => {
  return [
    { title: "Procesar pedido | Inventory Management" },
    {
      name: "description",
      content: "Inventory management process tickets panel.",
    },
  ];
};

export async function action({ request }: ActionFunctionArgs) {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/",
  });
  const formData = await request.formData();
  const ref = formData.get("ref") as string;
  if (ref) {
    const notifications = JSON.parse(
      formData.get("notifications") as string
    ) as number[];
    try {
      await readNotifications(notifications, user!);
      return null;
    } catch (error) {
      console.log(error);
      return null;
    }
  }
  const folio = formData.get("n_folio") as string;
  const session = await getSession(request.headers.get("Cookie"));
  if (!folio) return null;
  try {
    await db.ticket.update({
      where: {
        folio: +folio,
      },
      data: {
        process: true,
        deliveryDate: new Date(),
        status: "Disponible",
      },
    });
    session.flash("success", "El ticket fue procesado.");

    return redirect("/dashboard", {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/",
  });
  const notifications = await getNotifications();
  const url = new URL(request.url);
  const folio = Number(url.searchParams.get("folio")?.replace("FOLIO-", ""));
  if (folio) {
    try {
      const ticketFound = await db.ticket.findUnique({
        where: {
          folio,
        },
        select: {
          total: true,
          user: {
            select: {
              name: true,
              lastname: true,
            },
          },
          flowers: {
            select: {
              currentStockFresh: true,
              current_price: true,
              flowerBox: {
                select: {
                  name: true,
                },
              },
            },
          },
          process: true,
        },
      });
      if (!ticketFound) {
        return { user: user!, message: "Folio no encontrado.", notifications };
      } else if (ticketFound.process) {
        return { user: user!, message: "Ticket ya procesado.", notifications };
      } else {
        return { user: user!, ticketFound, folio, notifications };
      }
    } catch (error) {
      console.log(error);
      return { user: user! };
    }
  } else {
    return { user: user!, notifications };
  }
}

export default function ProcessTicket() {
  const { user, ticketFound, message, folio, notifications } =
    useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const submit = useSubmit();

  useEffect(() => {
    if (message) {
      toast({ title: "Error", description: message, variant: "destructive" });
    }
  }, [message]);

  return (
    <MainLayout user={user} notifications={notifications}>
      <p className="mt-2 text-sm px-5">
        Ingrese el numero de folio para procesar el ticket.
      </p>
      <div className="flex gap-x-5 h-[452px] max-h-[452px] mt-5">
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="w-1/2 px-5 space-y-4 bg-neutral-100 border ml-5 rounded-md shadow-sm"
          >
            <Form method="GET" className="space-y-2 w-fit mt-10">
              <label htmlFor="n_folio" className="font-semibold">
                Numero de folio:
              </label>
              <Input
                className="bg-white"
                id="n_folio"
                name="folio"
                placeholder="Ej: FOLIO-9823567"
                type="text"
                minLength={7}
                disabled={ticketFound ? true : false}
              />
              <Button
                type="submit"
                className="h-10 w-full bg-blue-500 hover:bg-blue-600"
                disabled={ticketFound ? true : false}
              >
                Validar
              </Button>
            </Form>
            <p className="text-md">Instrucciones:</p>
            <ul className="list-disc list-inside mt-2 text-sm text-gray-600 dark:text-gray-400 space-y-2">
              <li>Asegurarse de ingresar el numero de folio correctamente.</li>
              <li>Validar los datos, respecto a los que muestra el ticket.</li>
              <li>Procesar los datos.</li>
            </ul>
          </motion.div>
        </AnimatePresence>
        <div className="w-1/2">
          {ticketFound ? (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <p className="font-semibold text-xl">Resultado:</p>
                <p className="border-y py-2 my-2">
                  El costo del pedido fue de:{" "}
                  <span className="font-semibold">
                    {formatToMXN(ticketFound.total)}
                  </span>
                </p>
                <p className="border-y py-2 my-2">
                  Se ingresara la cantidad de:{" "}
                  <span className="font-semibold">
                    {formatToMXN(
                      ticketFound.flowers.reduce(
                        (acc, flower) =>
                          acc + flower.currentStockFresh * flower.current_price,
                        0
                      )
                    )}{" "}
                  </span>{" "}
                  al almacen
                </p>
                <p className="my-2">
                  Solicitado por:{" "}
                  <span className="font-bold text-blue-600">
                    {ticketFound.user.name} {ticketFound.user.lastname}
                  </span>
                </p>
                <p className="mb-2 font-semibold text-red-600">
                  Flores a ingresar:
                </p>
                <ul className="list-disc list-inside mt-2 text-md space-y-2 mb-4">
                  {ticketFound.flowers.map((flower, index) => (
                    <li
                      key={index}
                      className="border-t first:border-none pt-1 block w-fit"
                    >
                      <span>{flower.flowerBox.name}</span> - cantidad:{" "}
                      <span className="font-semibold">
                        {flower.currentStockFresh} Unidades.
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="flex items-center gap-x-10">
                  <Button className="h-10" onClick={() => navigate(-1)}>
                    Volver a buscar
                  </Button>
                  <Form
                    method="PUT"
                    onSubmit={(e) => {
                      e.preventDefault();
                      const result = confirm(
                        "Esto actualizara el inventario actual, estas de acuerdo?"
                      );
                      if (result) {
                        submit(e.currentTarget, { method: "PUT" });
                      } else {
                        return;
                      }
                    }}
                  >
                    <input type="hidden" value={folio} name="n_folio" />
                    <Button
                      type="submit"
                      className="h-10 bg-blue-500 hover:bg-blue-600"
                    >
                      Procesar Folio
                    </Button>
                  </Form>
                </div>
              </motion.div>
            </AnimatePresence>
          ) : (
            <>
              <div className="pt-12">
                <p className="text-center font-semibold">
                  No se encuentran existencias.
                </p>
                <img className="w-96 mx-auto h-96" src="/empty_boxes.jpg" />
              </div>
            </>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
