import { Link } from "@remix-run/react";
import { CalendarDays, Paperclip } from "lucide-react";
import { formatToDate, formatToMXN } from "~/lib/utils";
import { Ticket } from "@prisma/client";
import { Badge } from "./ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

interface TicketData extends Ticket {
  user: {
    name: string | null;
    lastname: string | null;
  };
  flowers: {
    price: number;
    amount: number;
  }[];
  sales: any[];
}

export default function CardTicket({ ticket }: { ticket: TicketData }) {
  return (
    <Link
      to={`/tickets/${ticket.id}`}
      key={ticket.id}
      className="h-48 w-60 p-2 border-b-2 border-b-blue-300 flex justify-between flex-col border rounded-md hover:cursor-pointer shadow-sm"
    >
      <div className="space-y-2">
        <p className="text-sm font-semibold">
          Realizado por: {ticket.user.name} {ticket.user.lastname}
        </p>
        <p className="text-xs">
          Existencias: {ticket.flowers.length} tipos de flores
        </p>
        <p className="text-xs">
          Ingreso total:{" "}
          {formatToMXN(
            ticket.flowers.reduce((acc, flower) => {
              acc += flower.price * flower.amount;
              return acc;
            }, 0)
          )}
        </p>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <p className="text-xs flex gap-2">
            <CalendarDays size={15} />
            <span className="w-full truncate">
              {formatToDate(ticket.createdAt.toString())}
            </span>
          </p>
          {/* TODO: Create a new model of sales adjunt to ticket model */}
          {ticket.sales.length > 0 && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <div className="flex items-center gap-x-1 bg-neutral-50 p-1 rounded-md">
                    <span className="text-xs">{ticket.sales.length}</span>
                    <Paperclip size={13} />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{ticket.sales.length} Entradas De Venta</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        <div className="flex justify-between items-center">
          <Badge className="w-fit">{ticket.type}</Badge>
          {/* TODO: Update Status dinamic */}
          <div className="flex gap-x-1 items-center">
            <div className="h-3 w-3 rounded-full bg-green-400 animate-pulse ring-1 ring-green-200 border border-green-100"></div>
            <span className="text-xs">Stock pendiente</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
