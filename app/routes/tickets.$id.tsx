import { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { Form, useLoaderData, useNavigate, Link } from "@remix-run/react";
import db from "~/database/prisma.server";
import { Button } from "~/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { cn, formatToDate, formatToMXN } from "~/lib/utils";
import { Badge } from "~/components/ui/badge";
import { Input } from "~/components/ui/input";
import { Search } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export const meta: MetaFunction = () => {
  return [
    { title: "Tickets | Inventory Management" },
    {
      name: "description",
      content: "Inventory management tickets panel.",
    },
  ];
};

export async function loader({ params }: LoaderFunctionArgs) {
  const ticket = await db.ticket
    .findUnique({
      where: { id: Number(params.id) },
      include: {
        user: {
          select: {
            name: true,
            lastname: true,
          },
        },
        flowers: {
          include: {
            flowerCategory: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    })
    .catch(() => null);

  return ticket;
}

export default function ShowTicket() {
  const ticket = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  if (!ticket) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-lg">Ticket no encontrado.</p>
        <Button type="button" className="h-10" onClick={() => navigate(-1)}>
          Volver
        </Button>
      </div>
    );
  }

  return (
    <>
      <p className="mt-2 text-sm">
        Ultima actualizacion el dia {formatToDate(ticket.updatedAt.toString())}.
      </p>
      <div className="flex items-center gap-x-2 my-4">
        <p className="text-sm">Inventario:</p>
        <div className="h-3 w-3 rounded-full bg-green-400 animate-pulse ring-1 ring-green-200 border border-green-100"></div>
        <p className="text-xs">Stock Pendiente</p>
      </div>
      <div className="flex items-center gap-x-2 my-4">
        <p className="text-sm">Estado:</p>
        <p className="text-xs underline underline-offset-2">{ticket.fase}</p>
      </div>
      <div className="flex items-center gap-x-5 my-5">
        <Form className="relative" method="GET">
          <Button
            type="submit"
            className="absolute right-1 top-[2px]"
            size={"icon"}
            variant={"ghost"}
          >
            <Search size={24} />
          </Button>
          <Input
            className="h-10 font-light pr-10
          placeholder-shown:invalid:border-neutral-200
          focus:invalid:ring-red-500 focus:invalid:ring-1 invalid:border-red-500
            focus:valid:ring-1 focus:valid:ring-blue-500 valid:border-blue-500"
            type="text"
            placeholder="Buscar.."
            name="search"
            required
          />
        </Form>
        <Button
          className="h-10 w-28"
          onClick={() => {
            null;
          }}
        >
          Limpiar
        </Button>
      </div>
      <div className="mt-5">
        <Table className="border-collapse">
          <TableCaption>
            Lista de inventario agregado el dia{" "}
            {formatToDate(ticket.createdAt.toString())}.
          </TableCaption>
          <TableHeader className="h-full">
            <TableRow className="sticky top-0">
              <TableHead className="w-[180px]">Tipo De Flor</TableHead>
              <TableHead className="w-[150px]">Cantidad Fresca</TableHead>
              <TableHead className="w-[150px]">Cantidad Marchita</TableHead>
              <TableHead className="w-[150px]">Fresca Vendida</TableHead>
              <TableHead className="w-[150px]">Marchita Vendida</TableHead>
              <TableHead className="w-[150px]">Alertar en:</TableHead>
              <TableHead className="w-[140px]">Precio</TableHead>
              <TableHead className="w-[160px]">Ganancia actual</TableHead>
            </TableRow>
          </TableHeader>
          <AnimatePresence>
            <TableBody>
              {ticket.flowers.map((flower, index) => (
                <TableRow className="odd:bg-white even:bg-neutral-50 even:hover:bg-neutral-100">
                  <motion.div
                    key={flower.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="table-cell"
                  >
                    <TableCell className="font-medium">
                      {flower.flowerCategory.name}
                    </TableCell>
                  </motion.div>
                  <motion.div
                    key={flower.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="table-cell"
                  >
                    <TableCell className="text-center">
                      {flower.freshQuantity}
                    </TableCell>
                  </motion.div>
                  <motion.div
                    key={flower.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="table-cell"
                  >
                    <TableCell className="text-center">
                      {flower.wiltedQuantity}
                    </TableCell>
                  </motion.div>
                  <motion.div
                    key={flower.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="table-cell"
                  >
                    <TableCell className="text-center">
                      {flower.fresh_sale}
                    </TableCell>
                  </motion.div>
                  <motion.div
                    key={flower.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="table-cell"
                  >
                    <TableCell className="text-center">
                      {flower.wilted_sale}
                    </TableCell>
                  </motion.div>
                  <motion.div
                    key={flower.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="table-cell"
                  >
                    <TableCell className="">
                      {!flower.min_amount ? "N/A" : flower.min_amount}
                    </TableCell>
                  </motion.div>
                  <motion.div
                    key={flower.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="table-cell"
                  >
                    <TableCell className="font-semibold">
                      {formatToMXN(flower.price)}
                    </TableCell>
                  </motion.div>
                  <motion.div
                    key={flower.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="table-cell"
                  >
                    <TableCell className="text-center font-semibold">
                      {formatToMXN(
                        (flower.fresh_sale + flower.wilted_sale) * flower.price
                      )}
                    </TableCell>
                  </motion.div>
                </TableRow>
              ))}
            </TableBody>
          </AnimatePresence>
        </Table>
      </div>
    </>
  );
}
