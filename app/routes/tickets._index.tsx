import db from "~/database/prisma.server";
import { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import TicketCard from "~/components/card.ticket";
import { Button } from "~/components/ui/button";

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
  const tickets = await db.ticket.findMany({
    include: {
      user: {
        select: {
          name: true,
          lastname: true,
        },
      },
      flowers: {
        select: {
          id: true,
          price: true,
          amount: true,
          flowerCategory: {
            select: {
              id: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const Tickets_Sorted = tickets.map((ticket) => {});
  // const ticketfound = tickets.filter((ticket) => ticket.id === 4);
  // console.log(ticketfound[0].flowers);
  return { tickets };
}

export default function TicketsMain() {
  const data = useLoaderData<typeof loader>();
  return (
    <>
      <p className="mt-2 text-sm">Entradas y salidas del inventario.</p>
      <div className="flex items-center gap-x-5 my-5">
        <Button className="h-12 w-fit">
          <Link to="/tickets/new">Nuevo ticket</Link>
        </Button>
      </div>
      <div className="grid grid-cols-5 gap-5">
        {data.tickets.map((ticket) => (
          <TicketCard key={ticket.id} ticket={ticket} />
        ))}
      </div>
    </>
  );
}
