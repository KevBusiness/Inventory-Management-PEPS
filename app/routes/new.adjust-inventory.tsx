import { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { useLoaderData, useSearchParams } from "@remix-run/react";
import { AnimatePresence, motion } from "framer-motion";
import { HiAdjustmentsHorizontal } from "react-icons/hi2";
import { LiaSaveSolid } from "react-icons/lia";
import { TbInvoice } from "react-icons/tb";
import { ProgressBar } from "~/components/progressBar";
import {
  getAllTickets,
  getTicket,
} from "~/database/controller/general/tickets";
import TicketCard from "~/components/ticket/ticket_card";

export const meta: MetaFunction = () => {
  return [
    { title: "Ajuste de inventario | Inventory Management" },
    {
      name: "description",
      content: "Inventory management for a flower shop",
    },
  ];
};

const steps = [
  { label: "Seleccionar Ticket", icon: <TbInvoice /> },
  { label: "Actualizar datos", icon: <HiAdjustmentsHorizontal /> },
  { label: "Guardar Venta", icon: <LiaSaveSolid /> },
];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const step = url.searchParams.get("step");
  const ticketSelect = url.searchParams.get("ticket");
  if (!step) {
    return await getAllTickets();
  } else if (step === "1" && ticketSelect) {
    return getTicket(ticketSelect);
  } else if (step === "2") {
    return [];
  }
  return null;
};

export default function AdjustInventory() {
  const fetchData = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();
  const step = searchParams.get("step");
  const searchTerm = searchParams.get("search");
  const selectedTicket = searchParams.get("current");

  const filteredTickets = Array.isArray(fetchData)
    ? fetchData.filter((ticket) =>
        ticket.id.toString().includes(searchTerm || "")
      )
    : [];

  return (
    <div className="flex overflow-hidden h-full">
      <ProgressBar steps={steps} currentStep={parseInt(step!) || 0} />
      {!step ? (
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
      ) : null}
    </div>
  );
}
