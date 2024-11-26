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

export const meta: MetaFunction = () => {
  return [
    { title: "Tickets | Inventory Management" },
    {
      name: "description",
      content: "Inventory management tickets panel.",
    },
  ];
};

export async function loader({ params, request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const search = url.searchParams.get("search");
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
          select: {
            price: true,
            amount: true,
            min_amount: true,
            Amount_sell: true,
            status: true,
            flowerCategory: {
              select: {
                name: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    })
    .catch(() => null);

  if (search && ticket) {
    ticket.flowers = ticket.flowers.filter((flower) =>
      flower.flowerCategory.name.toLowerCase().includes(search.toLowerCase())
    );
  }
  return ticket;
}

export default function ShowTicket() {
  const data = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  if (!data) {
    return <div>El ticket no existe.</div>;
  }

  return (
    <>
      <p className="mt-2 text-sm">
        Ultima actualizacion el dia {formatToDate(data.updatedAt.toString())}.
      </p>
      {/* TODO: ADD Status to database */}
      <div className="flex items-center gap-x-2 my-4">
        <p className="text-sm">Inventario:</p>
        <div className="h-3 w-3 rounded-full bg-green-400 animate-pulse ring-1 ring-green-200 border border-green-100"></div>
        <p className="text-xs">Stock Pendiente</p>
      </div>
      <div className="flex items-center gap-x-5 my-5">
        <Form className="relative" method="GET">
          <Button
            type="submit"
            className="absolute right-1 top-[0.35rem]"
            size={"icon"}
            variant={"ghost"}
          >
            <Search size={24} />
          </Button>
          <Input
            className="h-12 font-light pr-10
          placeholder-shown:invalid:border-neutral-200
          focus:invalid:ring-red-500 focus:invalid:ring-1 invalid:border-red-500
            focus:valid:ring-1 focus:valid:ring-blue-500 valid:border-blue-500"
            type="text"
            placeholder="Buscar.."
            name="search"
            required
          />
        </Form>
        {/* <Button className="h-12 w-28" asChild>
          <Link to={`/tickets/${data.id}`}>Inicio</Link>
        </Button> */}
        <Button className="h-12 w-28" onClick={() => navigate(-1)}>
          Volver
        </Button>
      </div>
      <div className="mt-5">
        <Table className="border-collapse">
          <TableCaption>
            Lista de inventario agregado el dia{" "}
            {formatToDate(data.createdAt.toString())}.
          </TableCaption>
          <TableHeader className="h-full">
            {/* TODO: Fix the header */}
            <TableRow className="sticky top-0">
              <TableHead className="w-[180px]">Tipo De Flor</TableHead>
              <TableHead className="w-[140px]">Cantidad Inicial</TableHead>
              <TableHead className="w-[160px]">Cantidad Vendida</TableHead>
              <TableHead className="w-[160px]">Cantidad Restante</TableHead>
              <TableHead className="w-[160px]">Precio Individual</TableHead>
              <TableHead className="w-[160px]">Precio total</TableHead>
              <TableHead className="w-[160px]">Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.flowers.map((flower) => (
              <TableRow className="odd:bg-white even:bg-neutral-50 even:hover:bg-neutral-100">
                <TableCell className="font-medium">
                  {flower.flowerCategory.name}
                </TableCell>
                <TableCell className="text-center">{flower.amount}</TableCell>
                <TableCell className="text-center">
                  {flower.Amount_sell}
                </TableCell>
                <TableCell className="text-center">
                  {flower.amount - (flower.Amount_sell || 0)}
                </TableCell>
                <TableCell className="text-center font-medium">
                  {formatToMXN(flower.price)}
                </TableCell>
                <TableCell className="text-center font-medium">
                  {formatToMXN(flower.price * flower.amount)}
                </TableCell>
                <TableCell>
                  {/* TODO: ME QUEDE AQUI */}
                  <Badge
                    className={cn(
                      flower.status === "Frescas"
                        ? "bg-green-400"
                        : flower.status === "Vendidas"
                        ? "bg-neutral-400"
                        : "bg-red-400",
                      "h-6"
                    )}
                  >
                    {flower.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
