// TODO: Fix ubications
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getCurrentStock } from "~/database/controller/current-stock.server";
import MainLayout from "~/layouts/main";
import { authenticator } from "~/services/auth.server";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet";
import { AnimatePresence, motion } from "framer-motion";
import { formatToMXN } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import {
  getNotifications,
  readNotifications,
} from "~/controllers/notifications.server";

export const meta: MetaFunction = () => {
  return [
    { title: "Existencias | Inventory Management" },
    {
      name: "description",
      content: "Inventory management dashboard panel.",
    },
  ];
};

export async function action({ request }: ActionFunctionArgs) {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/",
  });
  const formData = await request.formData();
  const ref = formData.get("ref") as string;
  switch (ref) {
    case "notifications":
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
      break;
    default:
      break;
  }
}

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/",
  });

  try {
    const [stock, notifications] = await Promise.all([
      getCurrentStock(),
      getNotifications(),
    ]);
    return { user: user!, stock, notifications };
  } catch (error) {
    console.log(error);
    return null;
  }
}

export default function CurrentStock() {
  const data = useLoaderData<typeof loader>();
  if (!data) throw new Error("No existen datos");
  const { user, stock, notifications } = data;
  return (
    <MainLayout user={user} notifications={notifications}>
      <p className="mt-2 text-sm pl-5">
        Existencias actuales dentro del almacen.
      </p>
      <p className="mt-2 text-sm pl-5">
        Cantidad actual{" "}
        {stock ? (
          <span className="font-bold text-blue-700">
            {stock.reduce(
              (acc, x) => acc + (x.currentAmout + x.currentWilted),
              0
            )}{" "}
            Unidades
          </span>
        ) : (
          "No disponible"
        )}
        .
      </p>
      {stock ? (
        <div className="px-5">
          <Table className="border-collapse">
            <TableCaption>Lista actual del inventario.</TableCaption>
            <TableHeader className="h-full">
              <TableRow className="sticky top-0">
                <TableHead className="w-[150px]">Codigo</TableHead>
                <TableHead className="w-[180px]">Nombre</TableHead>
                <TableHead className="w-[150px]">Cantidad Fresca</TableHead>
                <TableHead className="w-[150px]">Cantidad Marchita</TableHead>
                <TableHead className="w-[160px]">Cantidad optima</TableHead>
                <TableHead className="w-[140px]">Ubicacion</TableHead>
                <TableHead className="w-[150px]">Valor total</TableHead>
              </TableRow>
            </TableHeader>
            <AnimatePresence>
              <TableBody>
                {stock.map((item, index) => (
                  <TableRow
                    className="odd:bg-white even:bg-neutral-50 even:hover:bg-neutral-100"
                    key={index}
                  >
                    {/* Mueve el motion.td directamente dentro de TableCell */}
                    <motion.td
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]"
                    >
                      {item.code}
                    </motion.td>

                    <motion.td
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]"
                    >
                      {item.name}
                    </motion.td>

                    <motion.td
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]"
                    >
                      {item.currentAmout}
                    </motion.td>

                    <motion.td
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]"
                    >
                      {item.currentWilted}
                    </motion.td>

                    <motion.td
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]"
                    >
                      {item.min ? item.min : 0}
                    </motion.td>

                    <motion.td
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px] hover:underline-offset-4 hover:underline hover:cursor-pointer"
                    >
                      {item.locations ? (
                        <Sheet>
                          <SheetTrigger className="hover:underline hover:underline-offset-4">
                            Ver Ubicaciones
                          </SheetTrigger>
                          <SheetContent>
                            <SheetHeader>
                              <SheetTitle>Ubicaciones actuales</SheetTitle>
                              {/* <SheetDescription>
                                This action cannot be undone. This will
                                permanently delete your account and remove your
                                data from our servers.
                              </SheetDescription> */}
                            </SheetHeader>
                            <nav className="space-y-4 mt-6">
                              {item.locations.length > 0 ? (
                                item.locations.map((location) => (
                                  <div
                                    key={location.id}
                                    className="border flex justify-between items-center p-4 bg-white rounded-lg shadow-md hover:scale-105 hover:shadow-xl transition-all ease-in-out duration-200"
                                  >
                                    <div className="flex items-center space-x-3">
                                      <span className="text-xl font-semibold text-gray-800 truncate">
                                        {location.name}
                                      </span>
                                    </div>
                                    <span className="text-md font-medium text-blue-600">
                                      {location.amount}{" "}
                                      <span className="text-xs text-gray-400">
                                        Unidades
                                      </span>
                                    </span>
                                  </div>
                                ))
                              ) : (
                                <p className="text-gray-500 text-center italic text-lg">
                                  No se encontraron ubicaciones.
                                </p>
                              )}
                            </nav>
                          </SheetContent>
                        </Sheet>
                      ) : null}
                    </motion.td>

                    <motion.td
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]"
                    >
                      {formatToMXN(item.total)}
                    </motion.td>
                  </TableRow>
                ))}
              </TableBody>
            </AnimatePresence>
          </Table>
        </div>
      ) : null}
    </MainLayout>
  );
}
