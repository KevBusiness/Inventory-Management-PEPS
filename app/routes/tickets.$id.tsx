import { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import {
  Form,
  useLoaderData,
  useNavigate,
  Link,
  useSearchParams,
} from "@remix-run/react";
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
import { Input } from "~/components/ui/input";
import { Search } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export const meta: MetaFunction = ({ params }) => {
  const id = params.id;
  return [
    { title: `Lote ${id} | Inventory Management` },
    {
      name: "description",
      content: "Inventory management ticket panel of table.",
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
            flowerBox: {
              select: {
                name: true,
                min: true,
              },
            },
            saleTransactions: true,
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
  const [searchParams, setSearchParams] = useSearchParams();
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

  const search = searchParams.get("search")?.toLowerCase() || "";

  const filteredFlowers = ticket.flowers.filter((flower) =>
    flower.flowerBox.name.toLowerCase().includes(search)
  );

  return (
    <>
      <p className="mt-2 text-sm">
        Ultima actualizacion el dia {formatToDate(ticket.updatedAt.toString())}.
      </p>
      <div className="flex items-center gap-x-2 my-4">
        <p className="text-sm">Estado:</p>
        <p className="text-sm underline underline-offset-2 font-semibold">
          {ticket.status}
        </p>
      </div>
      <div className="flex items-center gap-x-5 my-5">
        <Form
          className="relative"
          method="GET"
          onSubmit={(e) => e.preventDefault()}
        >
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
            onChange={(e) => {
              setSearchParams({ search: e.target.value });
            }}
          />
        </Form>
        <Button
          className="h-10 w-28"
          onClick={() => {
            setSearchParams({ search: "" });
          }}
        >
          Limpiar
        </Button>
      </div>
      <div className="mt-5">
        <Table className="border-collapse">
          <TableCaption>
            Lista de inventario agregado el dia{" "}
            {formatToDate(ticket.orderDate.toString())}.
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
              {filteredFlowers.map((flower, index) => (
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
                    {flower.flowerBox.name}
                  </motion.td>

                  <motion.td
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]"
                  >
                    {flower.currentStockFresh}
                  </motion.td>

                  <motion.td
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]"
                  >
                    {flower.currentwiltedFlowers || 0}
                  </motion.td>

                  <motion.td
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]"
                  >
                    {flower.saleTransactions
                      .filter((sale) => sale.quality === "Fresca")
                      .reduce((acc, flower) => acc + flower.quantity, 0)}
                  </motion.td>

                  <motion.td
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]"
                  >
                    {flower.saleTransactions
                      .filter((sale) => sale.quality === "Marchita")
                      .reduce((acc, flower) => acc + flower.quantity, 0)}
                  </motion.td>

                  <motion.td
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]"
                  >
                    {!flower.flowerBox.min ? "N/A" : flower.flowerBox.min}
                  </motion.td>

                  <motion.td
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]"
                  >
                    {formatToMXN(flower.current_price)}
                  </motion.td>

                  <motion.td
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]"
                  >
                    {formatToMXN(
                      flower.saleTransactions.reduce(
                        (acc, flower) => acc + flower.quantity * flower.price,
                        0
                      )
                    )}
                  </motion.td>
                </TableRow>
              ))}
            </TableBody>
          </AnimatePresence>
        </Table>
      </div>
    </>
  );
}
