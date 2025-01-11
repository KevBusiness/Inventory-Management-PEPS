import { useState } from "react";
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
  redirect,
} from "@remix-run/node";
import { useLoaderData, useSearchParams, useSubmit } from "@remix-run/react";
import { AnimatePresence, motion } from "framer-motion";
import db from "~/database/prisma.server";
import { authenticator } from "~/services/auth.server";
import { toast } from "~/hooks/use-toast";

import type { UpdatedFlowers } from "~/lib/types";

//TODO: Re-work to progress bar component
import { ProgressBar } from "~/components/progressBar";
import TicketCard from "~/components/ticket/ticket_card";
import PivotTable from "~/components/form/pivot_table";
import FlowerNotebook from "~/components/flower-notebook";
import { Button } from "~/components/ui/button";

import { BsCardChecklist } from "react-icons/bs";
import { GiFlowerPot } from "react-icons/gi";
import { LiaSaveSolid } from "react-icons/lia";
import { TbInvoice } from "react-icons/tb";
import { commitSession, getSession } from "~/services/alerts.session.server";
import {
  getAllTickets,
  getTicket,
} from "~/database/controller/general/tickets";
import { createIndividualSale } from "~/controllers/outputs.server";

const steps = [
  { label: "Seleccionar Ticket", icon: <TbInvoice /> },
  { label: "Actualizar Cantidades", icon: <GiFlowerPot /> },
  { label: "Confirmar Venta", icon: <BsCardChecklist /> },
  { label: "Guardar Venta", icon: <LiaSaveSolid /> },
];

const headerTable = [
  "Nombre",
  "Cantidad Fresca",
  "Cantidad Marchitada",
  "Fresca / Vender",
  "Marchitada / Vender",
];

export const meta: MetaFunction = () => {
  return [
    { title: "Nueva venta | Inventory Management" },
    {
      name: "description",
      content: "Inventory management for a flower shop",
    },
  ];
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/",
  });
  const session = await getSession(request.headers.get("Cookie"));
  const formData = await request.formData();
  const ticket = formData.get("ticket");
  const flowers = JSON.parse(formData.get("flowers") as string);
  await createIndividualSale(flowers, ticket as string, user!);
  session.flash("success", "La venta ha sido añadida correctamente.");
  return redirect("/dashboard", {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const step = url.searchParams.get("step");
  const ticketSelect = url.searchParams.get("ticket");
  if (!step) {
    return getAllTickets();
  } else if (step === "1" && ticketSelect) {
    return getTicket(ticketSelect);
  } else if (step === "2") {
    return [];
  }
  return null;
};

export default function NewSale() {
  const fetchData = useLoaderData<typeof loader>();
  const submit = useSubmit();
  const [updatedFlowers, setUpdatedFlowers] = useState<UpdatedFlowers[]>([]);

  const [searchParams, setSearchParams] = useSearchParams();
  const step = searchParams.get("step");
  const searchTerm = searchParams.get("search");
  const selectedTicket = searchParams.get("current");

  if (!fetchData) {
    return <div>Something went wrong</div>;
  }

  const filteredTickets = Array.isArray(fetchData)
    ? fetchData.filter((ticket) =>
        ticket.id.toString().includes(searchTerm || "")
      )
    : [];

  const handleUpdateFlower = (e: React.FormEvent<HTMLFormElement>) => {
    const formData = new FormData(e.currentTarget);
    const flowers = Object.entries(Object.fromEntries(formData))
      .filter(([_, value]) => value !== "")
      .map(([key, value]) => {
        const [_, id, quantity, name, type, price] = key.split("-");
        return {
          id: Number(id),
          currentAmount: Number(quantity),
          type,
          name,
          value: Number(value),
          price: Number(price),
        };
      });
    if (flowers.length > 0) {
      setUpdatedFlowers(flowers);
      setSearchParams((prev) => ({
        ...Object.fromEntries(prev),
        step: "2",
      }));
    } else {
      toast({
        title: "Error!",
        description: "No se han encontrado cambios en las cantidades.",
        variant: "destructive",
      });
    }
  };

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
      ) : step === "1" ? (
        <div className="overflow-y-auto w-full px-10">
          <PivotTable
            header={headerTable}
            type="sale"
            data={!Array.isArray(fetchData) ? fetchData : null}
            handleUpdateFlower={handleUpdateFlower}
          />
        </div>
      ) : step === "2" ? (
        <div className="flex-1 px-5 pt-5 pb-10 overflow-y-auto">
          <FlowerNotebook flowers={updatedFlowers} type="sale" />
          <p className="text-muted-foreground text-sm text-center">
            Resumen de la venta.
          </p>
          <div>
            <div className="mt-5">
              <div className="flex justify-end">
                <Button
                  className="h-12 w-36"
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    const formData = new FormData();
                    formData.append("ticket", searchParams.get("ticket")!);
                    formData.append("flowers", JSON.stringify(updatedFlowers));
                    submit(formData, { method: "POST" });
                  }}
                >
                  Confirmar Venta
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
