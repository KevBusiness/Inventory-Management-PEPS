import db from "~/database/prisma.server";
import { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { Link, useLoaderData, useSearchParams } from "@remix-run/react";
import TicketCard from "~/components/ticket/ticket_card";
import { Button } from "~/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import { CiSearch } from "react-icons/ci";
import { Input } from "~/components/ui/input";

export const meta: MetaFunction = () => {
  return [
    { title: "Tickets | Inventory Management" },
    {
      name: "description",
      content: "Inventory management tickets panel.",
    },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  return await db.ticket.findMany({
    include: {
      flowers: {
        select: {
          fresh_sale: true,
          freshQuantity: true,
          wilted_sale: true,
          wiltedQuantity: true,
        },
      },
    },
  });
}

export default function TicketsMain() {
  const fetchData = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchTerm = searchParams.get("search");

  const filteredTickets = Array.isArray(fetchData)
    ? fetchData.filter((ticket) =>
        ticket.id.toString().includes(searchTerm || "")
      )
    : [];

  return (
    <>
      <p className="mt-2 text-sm">Entradas del inventario.</p>
      <div className="flex items-center gap-x-5 my-5">
        <Button className="h-10">
          <Link to="/new/ticket">Nuevo ticket</Link>
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
              <TicketCard index={index} ticket={ticket} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </>
  );
}
