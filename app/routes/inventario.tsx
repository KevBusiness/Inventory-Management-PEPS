import { useLoaderData } from "@remix-run/react";
import { LoaderFunctionArgs } from "@remix-run/node";
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
import { formatToDate } from "~/lib/utils";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/",
  });

  const tickets = await db.ticket.findMany({
    orderBy: { createdAt: "asc" },
  });

  return { user: user!, tickets };
}

export default function Inventory() {
  const data = useLoaderData<typeof loader>();
  const entries = {
    units: 0,
    value: 0,
  };
  const outputs = {
    units: 0,
    value: 0,
  };
  const balance = {
    units: 0,
    value: 0,
  };
  return (
    <MainLayout user={data.user}>
      <main className="px-5">
        <p className="mt-2 text-sm">
          Todo el inventario de la empresa cronologicamente usando el metodo
          PEPS.
        </p>
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
              {data.tickets.map((ticket) => (
                <TableRow className="odd:bg-white even:bg-neutral-50 even:hover:bg-neutral-100">
                  <TableCell className="font-medium w-1/5">
                    {formatToDate(ticket.createdAt.toString())}
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
