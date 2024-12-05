import { useLoaderData, useSearchParams } from "@remix-run/react";
import { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import db from "~/database/prisma.server";
import { authenticator } from "~/services/auth.server";
import MainLayout from "~/layouts/main";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
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
import { UpdatedFlowers } from "~/lib/types";

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
  type: "Compra" | "Venta"; // El tipo puede ser 'Compra' o 'Venta'
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
          flowerCategoryId: Number(flowerId) || 1,
        },
      }),
      db.flowerCategory.findMany(),
    ]);

    return { user, flowerNames, flower };
  } else {
    const [tickets, sales] = await db.$transaction([
      db.ticket.findMany({
        include: {
          flowers: true,
        },
      }),
      db.sale.findMany(),
    ]);
    const x = tickets.map((ticket) => ({
      date: ticket.createdAt,
      type: "Compra",
      amount: ticket.flowers.reduce(
        (acc, flower) =>
          acc + ((flower.freshQuantity || 0) + (flower.wiltedQuantity || 0)),
        0
      ),
      value: ticket.flowers.reduce(
        (acc, flower) =>
          acc +
          ((flower.freshQuantity || 0) + (flower.wiltedQuantity || 0)) *
            flower.price!,
        0
      ),
    }));
    const y = sales.map((sale) => ({
      date: sale.createdAt,
      type: "Venta",
      amount: JSON.parse(sale.updatedFlowers).reduce(
        (acc: number, flower: UpdatedFlowers) => acc + flower.value,
        0
      ) as number,
      value: JSON.parse(sale.updatedFlowers).reduce(
        (acc: number, flower: UpdatedFlowers) =>
          acc + flower.value * flower.price,
        0
      ) as number,
    }));
    const data = { ...x, ...y } as unknown as PEPS;

    const sortedData = Object.values(data).sort(
      (a: any, b: any) => a.date - b.date
    );

    let currentAmount = 0;
    let currentValue = 0;

    const result: Transaction[] = sortedData.map((item) => {
      // Calcular el currentAmount y currentValue según el tipo de transacción
      if (item.type === "Compra") {
        currentAmount += item.amount;
        currentValue += item.value;
      } else if (item.type === "Venta") {
        currentAmount -= item.amount;
        currentValue -= item.value;
      }

      // Devolver el objeto con los valores de currentAmount y currentValue
      return {
        ...item,
        currentAmount,
        currentValue,
      };
    });

    return { user, result };
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
            id="airplane-mode"
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
          <Label htmlFor="airplane-mode">Visualizar flores</Label>
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
          <div className="grid grid-cols-5 grid-rows-2 border-b text-neutral-800/90 text-sm font-semibold bg-neutral-50 transition pt-1 px-1 group">
            <span className="row-span-2 border-r">Fecha</span>
            <span className="row-span-2 border-r pl-1">Concepto</span>
            <span className="pl-1 border-b border-r">Entradas</span>
            <span className="pl-1 border-b border-r">Salidas</span>
            <span className="pl-1 border-b">Saldo</span>
            <div className="row-span-3 border-r bg-white group-hover:bg-neutral-50 transition">
              <div className="flex pl-1">
                <span className="w-1/2 border-r">Unidades</span>
                <span className="pl-1">Valor</span>
              </div>
            </div>
            <div className="row-span-4 border-r bg-white group-hover:bg-neutral-50 transition">
              <div className="flex pl-1">
                <span className="w-1/2 border-r">Unidades</span>
                <span className="pl-1">Valor</span>
              </div>
            </div>
            <div className="row-span-5 border-r bg-white group-hover:bg-neutral-50 transition">
              <div className="flex pl-1">
                <span className="w-1/2 border-r">Unidades</span>
                <span className="pl-1">Valor</span>
              </div>
            </div>
          </div>
          <Table className="border-collapse">
            <TableCaption>Inventario PEPS.</TableCaption>
            <TableBody>
              {result
                ? result.map((item, index) => (
                    <TableRow
                      className="odd:bg-white even:bg-neutral-50 even:hover:bg-neutral-100"
                      key={index}
                    >
                      <TableCell className="font-medium w-1/5">
                        {formatToDate(item.date.toString())}
                      </TableCell>
                      <TableCell className="w-1/5">{item.type}</TableCell>
                      <TableCell className="w-32">
                        {item.type === "Compra" && item.amount}
                      </TableCell>
                      <TableCell className="w-32">
                        {item.type === "Compra" && formatToMXN(item.value)}
                      </TableCell>
                      <TableCell className="w-32">
                        {item.type === "Venta" && item.amount}
                      </TableCell>
                      <TableCell className="w-32">
                        {item.type === "Venta" && formatToMXN(item.value)}
                      </TableCell>
                      <TableCell className="w-32">
                        {item.currentAmount}
                      </TableCell>
                      <TableCell className="w-32">
                        {item.currentValue && formatToMXN(item.currentValue)}
                      </TableCell>
                    </TableRow>
                  ))
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
