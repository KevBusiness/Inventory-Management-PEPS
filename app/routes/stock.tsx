import { Link, useLoaderData, useSearchParams } from "@remix-run/react";
import { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import db from "~/database/prisma.server";
import { authenticator } from "~/services/auth.server";
import MainLayout from "~/layouts/main";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableRow,
} from "~/components/ui/table";
import { formatToDate, formatToMXN } from "~/lib/utils";
import { Switch } from "~/components/ui/switch";
import { Label } from "~/components/ui/label";
import { AnimatePresence, motion } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { getPeps } from "~/database/controller/stock.server";
import { Button } from "~/components/ui/button";

export const meta: MetaFunction = () => {
  return [
    { title: "Inventario PEPS | Inventory Management" },
    {
      name: "description",
      content: "Inventory management dashboard panel.",
    },
  ];
};

interface Transaction {
  date: Date; // Usamos Date para la fecha
  type: "Entrada" | "Salida"; // El tipo puede ser 'Compra' o 'Venta'
  amount: number;
  value: number;
  currentAmount?: number; // Se añadirá como propiedad adicional
  currentValue?: number; // Se añadirá como propiedad adicional
}

type PEPS = {
  [key: string]: Transaction;
};

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/",
  });
  if (url.searchParams.has("mode")) {
    const flowerId = url.searchParams.get("flowerId");
    const [flower, flowerNames] = await db.$transaction([
      db.flower.findMany({
        where: {
          flowerBoxId: Number(flowerId) || 1,
        },
      }),
      db.flowerBox.findMany({
        select: {
          id: true,
          name: true,
        },
      }),
    ]);

    return { user, flowerNames, flower };
  } else {
    return { user, result: await getPeps() };
  }
}

export default function Inventory() {
  const { user, result, flowerNames, flower } = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();
  const mode = searchParams.get("mode");
  return (
    <MainLayout user={user!}>
      <main className="px-5">
        <p className="mt-2 text-sm">
          Todo el inventario de la empresa cronologicamente usando el metodo
          PEPS.
        </p>
        <div className="flex items-center space-x-2 my-2">
          <Switch
            id="peps-mode"
            checked={mode === "flowers"}
            onCheckedChange={(value) => {
              if (value) {
                setSearchParams((prev) => ({
                  ...Object.fromEntries(prev),
                  mode: "flowers",
                }));
              } else {
                setSearchParams((prev) => {
                  const { mode, flowerId, ...rest } = Object.fromEntries(prev);
                  return rest;
                });
              }
            }}
          />
          <Label htmlFor="peps-mode">Visualizar flores</Label>
        </div>
        <AnimatePresence>
          {mode === "flowers" && Array.isArray(flowerNames) ? (
            <motion.div
              className="border-t h-fit py-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Select
                onValueChange={(value) => {
                  setSearchParams((prev) => ({
                    ...Object.fromEntries(prev),
                    flowerId: value,
                  }));
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Selecciona una flor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Nombre</SelectLabel>
                    {flowerNames.map((flower) => (
                      <SelectItem key={flower.id} value={flower.id.toString()}>
                        {flower.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </motion.div>
          ) : null}
        </AnimatePresence>
        <div className="mt-5">
          {/* <div className="flex border-b text-neutral-800/90 text-sm font-semibold bg-neutral-50 transition pt-1 px-1 group">
            <span className="border-r min-w-[193px] h-12">Fecha</span>
            <span className="min-w-24 h-12 pl-1">Concepto</span>
            <div className="pl-1 border-r border-l h-12 w-56">
              <span>Entradas</span>
              <div className="flex items-end border-t gap-x-5 pt-1">
                <span className="min-w-[112px] max-w-[112px] border-r">
                  Unidades
                </span>
                <span className="min-w-[112px] max-w-[112px]">Valor</span>
              </div>
            </div>
            <div className="pl-1 border-r h-12 w-56">
              <span>Salidas</span>
              <div className="flex items-end border-t gap-x-5 pt-1">
                <span className="min-w-[112px] max-w-[112px] border-r">
                  Unidades
                </span>
                <span className="min-w-[112px] max-w-[112px]">Valor</span>
              </div>
            </div>
            <div className="pl-1 border-r h-12 w-56">
              <span>Saldo</span>
              <div className="flex items-end border-t gap-x-5 pt-1">
                <span className="min-w-[112px] max-w-[112px] border-r">
                  Unidades
                </span>
                <span className="min-w-[112px] max-w-[112px]">Valor</span>
              </div>
            </div>
            <span className="row-span-2 w-32 flex justify-between border-r pl-1 pr-2 h-12">
              Movimientos
            </span>
            <span className="row-span-2 w-24 flex justify-between border-r pl-1 pr-2 h-12">
              Ubicacion
            </span>
            <span className="row-span-2 w-24 flex justify-between pl-1 pr-2 h-12">
              Ticket ID
            </span>
          </div> */}
          <Table className="border-collapse">
            <TableCaption>Inventario PEPS.</TableCaption>
            <TableBody>
              <TableRow className="bg-neutral-200/50">
                <TableCell rowSpan={2} className="border-r">
                  Fecha
                </TableCell>
                <TableCell rowSpan={2} className="border-r">
                  Concepto
                </TableCell>
                <TableCell className="min-w-56 border-r">Entradas</TableCell>
                <TableCell className="min-w-56 border-r">Salidas</TableCell>
                <TableCell className="min-w-56 border-r">Saldo</TableCell>
                {flower ? null : (
                  <>
                    <TableCell rowSpan={2} className="border-r">
                      Movimientos
                    </TableCell>
                    <TableCell rowSpan={2} className="border-r">
                      Ubicaciones
                    </TableCell>
                    <TableCell rowSpan={2}>N# Ticket</TableCell>
                  </>
                )}
              </TableRow>
              <TableRow className="bg-neutral-200/90">
                <TableCell className="font-semibold border-r">
                  <div className="flex h-full">
                    <span className="min-w-[112px] max-w-[112px]">
                      Unidades
                    </span>
                    <span className="min-w-[112px] max-w-[112px]">Valor</span>
                  </div>
                </TableCell>
                <TableCell className="font-semibold border-r">
                  <div className="flex">
                    <span className="min-w-[112px] max-w-[112px]">
                      Unidades
                    </span>
                    <span className="min-w-[112px] max-w-[112px]">Valor</span>
                  </div>
                </TableCell>
                <TableCell className="font-semibold border-r">
                  <div className="flex">
                    <span className="min-w-[112px] max-w-[112px]">
                      Unidades
                    </span>
                    <span className="min-w-[112px] max-w-[112px]">Valor</span>
                  </div>
                </TableCell>
              </TableRow>
              {result
                ? result.map((item, index) => {
                    if (Array.isArray(item)) {
                      return item.map((item, index) => (
                        <TableRow
                          className="odd:bg-white even:bg-neutral-50 even:hover:bg-gray-600/10 odd:hover:bg-gray-600/10"
                          key={index}
                        >
                          <TableCell className="font-medium min-w-[196px] border-r">
                            {index === 0
                              ? formatToDate(item.date.toString())
                              : null}
                          </TableCell>
                          <TableCell className="min-w-24 border-r">
                            {item.type}
                          </TableCell>
                          <TableCell className="min-w-[112px] border-r">
                            <div className="flex">
                              <span className="min-w-[112px] max-w-[112px]">
                                {item.type === "Entrada" && item.amount}
                              </span>
                              <span className="min-w-[112px] max-w-[112px]">
                                {item.type === "Entrada" &&
                                  formatToMXN(item.value)}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="min-w-[112px] border-r">
                            <div className="flex">
                              <span className="min-w-[112px] max-w-[112px]">
                                {item.type === "Salida" && item.amount}
                              </span>
                              <span className="min-w-[112px] max-w-[112px]">
                                {item.type === "Salida" &&
                                  formatToMXN(item.value)}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="min-w-[112px] border-r">
                            <div className="flex">
                              <span className="min-w-[112px] max-w-[112px]">
                                {item.currentAmount}
                              </span>
                              <span className="min-w-[112px] max-w-[112px]">
                                {item.currentValue &&
                                  formatToMXN(item.currentValue)}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="min-w-32 max-w-32 border-r">
                            <Button className="h-8 w-full">Mostrar</Button>
                          </TableCell>
                          <TableCell className="min-w-24 max-w-24 border-r"></TableCell>
                          <TableCell className="min-w-24 max-w-24">
                            <span className="font-semibold">
                              {item.ticketId}
                            </span>
                            <Link
                              to={`/tickets/${item.ticketId}`}
                              className="text-sm underline underline-offset-2 block"
                            >
                              ir al Ticket
                            </Link>
                          </TableCell>
                        </TableRow>
                      ));
                    } else {
                      return (
                        <TableRow
                          className="odd:bg-white even:bg-neutral-50 even:hover:bg-gray-600/10 odd:hover:bg-gray-600/10"
                          key={index}
                        >
                          <TableCell className="font-medium min-w-[196px] border-r">
                            {formatToDate(item.date.toString())}
                          </TableCell>
                          <TableCell className="min-w-24 border-r">
                            {item.type}
                          </TableCell>
                          <TableCell className="min-w-[112px] border-r">
                            <div className="flex">
                              <span className="min-w-[112px] max-w-[112px]">
                                {item.type === "Entrada" && item.amount}
                              </span>
                              <span className="min-w-[112px] max-w-[112px]">
                                {item.type === "Entrada" &&
                                  formatToMXN(item.value)}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="min-w-[112px] border-r">
                            <div className="flex">
                              <span className="min-w-[112px] max-w-[112px]">
                                {item.type === "Salida" && item.amount}
                              </span>
                              <span className="min-w-[112px] max-w-[112px]">
                                {item.type === "Salida" &&
                                  formatToMXN(item.value)}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="min-w-[112px] border-r">
                            <div className="flex">
                              <span className="min-w-[112px] max-w-[112px]">
                                {item.currentAmount}
                              </span>
                              <span className="min-w-[112px] max-w-[112px]">
                                {item.currentValue &&
                                  formatToMXN(item.currentValue)}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="min-w-32 max-w-32 border-r">
                            <Button className="h-8 w-full">Mostrar</Button>
                          </TableCell>
                          <TableCell className="min-w-24 max-w-24 border-r"></TableCell>
                          <TableCell className="min-w-24 max-w-24">
                            <span className="font-semibold">
                              {item.ticketId}
                            </span>
                            <Link
                              to={`/tickets/${item.ticketId}`}
                              className="text-sm underline underline-offset-2 block"
                            >
                              ir al Ticket
                            </Link>
                          </TableCell>
                        </TableRow>
                      );
                    }
                  })
                : flower &&
                  flower.map((flower) => (
                    <TableRow
                      className="odd:bg-white even:bg-neutral-50 even:hover:bg-neutral-100"
                      key={flower.id}
                    >
                      <TableCell className="font-medium w-1/5">
                        {formatToDate(flower.createdAt.toString())}
                      </TableCell>
                      <TableCell className="w-1/5">Paid</TableCell>
                      <TableCell className="w-[128px]">80000</TableCell>
                      <TableCell>$250.00</TableCell>
                      <TableCell>$500.00</TableCell>
                      <TableCell>$500.00</TableCell>
                      <TableCell>$500.00</TableCell>
                      <TableCell>$500.00</TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        </div>
      </main>
    </MainLayout>
  );
}
