// TODO: Fix ubications
import { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
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
import { AnimatePresence, motion } from "framer-motion";
import { formatToMXN } from "~/lib/utils";

export const meta: MetaFunction = () => {
  return [
    { title: "Existencias | Inventory Management" },
    {
      name: "description",
      content: "Inventory management dashboard panel.",
    },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/",
  });

  return { user: user!, stock: await getCurrentStock() };
}

export default function CurrentStock() {
  const { user, stock } = useLoaderData<typeof loader>();

  return (
    <MainLayout user={user}>
      <p className="mt-2 text-sm pl-5">
        Existencias actuales dentro del almacen.
      </p>
      <p className="mt-2 text-sm pl-5">
        Cantidad actual{" "}
        {stock ? (
          <span className="font-bold text-blue-700">
            {stock.reduce((acc, x) => acc + x.currentAmout, 0)} Unidades
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
                      className="p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]"
                    >
                      {item.locations ? "ver ubicaciones" : null}
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
