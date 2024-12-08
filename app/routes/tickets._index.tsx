import db from "~/database/prisma.server";
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import {
  Link,
  useActionData,
  useLoaderData,
  useSearchParams,
} from "@remix-run/react";
import TicketCard from "~/components/ticket/ticket_card";
import { Button } from "~/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import NumberFlow from "@number-flow/react";
import { CiSearch } from "react-icons/ci";
import { Input } from "~/components/ui/input";
import { useEffect } from "react";
import { toast } from "~/hooks/use-toast";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "~/components/ui/select";

export const meta: MetaFunction = () => {
  return [
    { title: "Tickets | Inventory Management" },
    {
      name: "description",
      content: "Inventory management tickets panel.",
    },
  ];
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  if (request.method === "DELETE") {
    const ticketId = formData.get("ticket");
    await db.ticket
      .delete({
        where: {
          id: parseInt(ticketId as string),
        },
      })
      .catch((error) => {
        console.log(error);
        return { type: "error", message: "Error al eliminar el ticket." };
      });
    return { type: "success", message: "Ticket eliminado con exito." };
  }
  return null;
};

export async function loader({ request }: LoaderFunctionArgs) {
  return await db.ticket.findMany({
    include: {
      flowers: {
        select: {
          currentStockFresh: true,
          currentwiltedFlowers: true,
        },
      },
      sales: {
        select: {
          total: true,
        },
      },
    },
  });
}

export default function TicketsMain() {
  const fetchData = useLoaderData<typeof loader>();
  const alert = useActionData<typeof action>();
  const [searchParams, setSearchParams] = useSearchParams();

  const searchTerm = searchParams.get("search");
  const selectedTicket = searchParams.get("current");
  const ticketStatus = searchParams.get("status"); // Estado seleccionado

  // Filtrar los tickets por estado y número de lote
  const filteredTickets = Array.isArray(fetchData)
    ? fetchData.filter((ticket) => {
        // Filtramos por búsqueda de número de lote
        const matchesSearch = ticket.id.toString().includes(searchTerm || "");

        // Filtramos por estado de ticket
        const matchesStatus = ticketStatus
          ? ticket.status === ticketStatus
          : true; // Si no hay filtro de estado, pasa todos los tickets

        return matchesSearch && matchesStatus;
      })
    : [];

  useEffect(() => {
    if (alert?.type === "error") {
      toast({
        title: "Error",
        description: alert.message,
        variant: "destructive",
      });
    } else if (alert?.type === "success") {
      toast({ title: "Exito", description: alert.message, variant: "default" });
    }
  }, [alert]);

  return (
    <>
      <p className="mt-2 text-sm">Entradas del inventario.</p>
      <div className="flex justify-between my-5">
        <div className="flex items-center gap-x-5">
          <Button className="h-10">
            <Link to="/new/ticket">Nuevo Pedido</Link>
          </Button>
          <div className="relative">
            <CiSearch
              className="absolute top-[0.7rem] left-2 text-muted-foreground"
              size={20}
            />
            <Input
              className="h-10 w-64 bg-white pl-9 shadow-sm hover:shadow-md transition"
              placeholder="Buscar por numero de lote..."
              onChange={(e) => {
                setSearchParams((prev) => ({
                  ...Object.fromEntries(prev),
                  search: e.target.value,
                }));
              }}
            />
          </div>
          {/* Filtro de estado */}
          <div>
            <Select
              onValueChange={(value) => {
                setSearchParams({
                  ...Object.fromEntries(searchParams),
                  status: value,
                });
              }}
            >
              <SelectTrigger className="h-10 w-48 bg-white shadow-sm hover:shadow-md transition">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pedido">Pedido</SelectItem>
                <SelectItem value="Disponible">Disponible</SelectItem>
                <SelectItem value="Agotado">Agotado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 flex-1 overflow-y-auto p-5 relative"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <AnimatePresence>
          {filteredTickets.map((ticket, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <TicketCard
                index={index}
                ticket={ticket}
                onFocus={selectedTicket}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
      {selectedTicket && (
        <AnimatePresence>
          <motion.div
            className="flex items-center gap-x-5 fixed bottom-10 right-10 bg-black p-3 rounded-lg shadow-md"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <span className="text-white">
              Ticket seleccionado:{" "}
              {<NumberFlow value={Number(selectedTicket)} />}
            </span>
            <Button variant="secondary" type="button" asChild>
              <Link to={`/tickets/${selectedTicket}`}>Ir</Link>
            </Button>
            <Button
              variant="secondary"
              onClick={() =>
                setSearchParams((prev) => ({
                  ...Object.fromEntries(prev),
                  current: "",
                }))
              }
            >
              Limpiar
            </Button>
          </motion.div>
        </AnimatePresence>
      )}
    </>
  );
}
