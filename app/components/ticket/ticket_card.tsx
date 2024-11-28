import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import type { Ticket } from "@prisma/client";
import { formatToDate, formatToMXN } from "~/lib/utils";
import { E } from "node_modules/@faker-js/faker/dist/airline-BLb3y-7w";
import { useSearchParams } from "@remix-run/react";

// Fix Colors
const statusColors = {
  Disponible:
    "bg-green-100 hover:bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  Vendido: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  Bajo: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
};

interface TicketFetchProps extends Ticket {
  flowers: {
    fresh_sale: number;
    freshQuantity: number;
    wilted_sale: number;
    wiltedQuantity: number;
  }[];
}

interface TicketCardProps {
  index: number;
  ticket: TicketFetchProps;
}

export default function ticketCard({ ticket, index }: TicketCardProps) {
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  return (
    <Card
      className="overflow-hidden transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
      onClick={() => {
        setSearchParams((prev) => ({
          ...Object.fromEntries(prev),
          currentLote: ticket.id.toString(),
        }));
      }}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium text-gray-800 dark:text-gray-200">
          ACT: {formatToDate(ticket.updatedAt.toString())}
        </CardTitle>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {/* TODO: ADD TICKET.REVENUE */}
          Venta Acumulada: {formatToMXN(ticket.revenue)}
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Badge className={`capitalize ${statusColors[ticket.status]}`}>
              Stock {ticket.status}
            </Badge>
            <span className="text-sm font-semibold dark:text-gray-300">
              N.Lote: {ticket.id}
            </span>
          </div>
          {/* TODO: update this part */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Frescas
              </p>
              <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                {ticket.flowers.reduce(
                  (acc, flower) =>
                    acc + flower.freshQuantity - flower.fresh_sale,
                  0
                )}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Marchitas
              </p>
              <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                {ticket.flowers.reduce(
                  (acc, flower) =>
                    acc + flower.wiltedQuantity - flower.wilted_sale,
                  0
                )}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            className="w-full mt-2 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={(e) => {
              setExpandedCard(expandedCard === index ? null : index);
              e.stopPropagation();
            }}
          >
            {expandedCard === index ? (
              <Minus className="mr-2 h-4 w-4" />
            ) : (
              <Plus className="mr-2 h-4 w-4" />
            )}
            {expandedCard === index ? "Menos detalles" : "Más detalles"}
          </Button>
          <AnimatePresence>
            {expandedCard === index && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Detalles adicionales del lote:
                  </p>
                  <ul className="list-disc list-inside mt-2 text-sm text-gray-600 dark:text-gray-400">
                    <li>Proveedor: Flores del Campo S.A.</li>
                    <li>Tipo de flor: Rosas</li>
                    <li>Calidad: Premium</li>
                    <li>
                      Fecha de recepción:{" "}
                      {formatToDate(ticket.createdAt.toString())}
                    </li>
                  </ul>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}
