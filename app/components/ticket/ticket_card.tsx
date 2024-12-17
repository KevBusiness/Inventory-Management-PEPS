import { useState } from "react";
import { Form, useSearchParams, useNavigation } from "@remix-run/react";
import { motion, AnimatePresence } from "framer-motion";
import type { Ticket } from "@prisma/client";
import { cn, formatToDate, formatToMXN } from "~/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Minus, Plus } from "lucide-react";
import { FiCopy } from "react-icons/fi";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";

const statusColors = {
  Pedido:
    "bg-amber-100 hover:bg-amber-200 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  Disponible:
    "bg-green-100 hover:bg-green-200 text-green-800 dark:bg-green-900 dark:text-green-200",
  Agotado:
    "bg-blue-100 hover:bg-blue-200 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
};

interface TicketFetchProps extends Ticket {
  flowers: {
    initialAmount?: number;
    currentStockFresh: number;
    currentwiltedFlowers: number | null;
    current_price: number;
  }[];
  sales: {
    total: number;
  }[];
}

interface TicketCardProps {
  index: number;
  ticket: TicketFetchProps;
  onFocus: string | null;
}

export default function ticketCard({
  ticket,
  index,
  onFocus,
}: TicketCardProps) {
  const navigation = useNavigation();
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const [_, setSearchParams] = useSearchParams();

  const copyFolioToClipboard = () => {
    const folioText = `FOLIO-${ticket.folio}`;
    navigator.clipboard
      .writeText(folioText)
      .then(() => {
        alert("Folio copiado al portapapeles!");
      })
      .catch((err) => {
        alert("No se pudo copiar el folio");
      });
  };

  return (
    <Card
      className={cn(
        onFocus === ticket.id.toString() ? "ring-1 ring-blue-600" : "",
        "overflow-hidden transition-all duration-300 transform"
      )}
      onClick={() => {
        setSearchParams((prev) => ({
          ...Object.fromEntries(prev),
          current: ticket.id.toString(),
        }));
      }}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium text-gray-800 dark:text-gray-200 flex items-center mb-2">
          <span>FOLIO-{ticket.folio}</span>
          <Button
            variant="outline"
            size="icon"
            className="ml-2"
            onClick={(e) => {
              copyFolioToClipboard();
              e.stopPropagation();
            }}
            aria-label="Copiar folio"
          >
            <FiCopy />
          </Button>
        </CardTitle>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Venta Acumulada:{" "}
          {formatToMXN(ticket.sales.reduce((acc, sale) => acc + sale.total, 0))}
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
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Frescas
              </p>
              <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                {ticket.flowers.reduce(
                  (acc, flower) => acc + flower.currentStockFresh,
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
                  (acc, flower) => acc + (flower.currentwiltedFlowers || 0),
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
                  <ul className="list-disc list-inside mt-2 text-sm text-gray-600 dark:text-gray-400 space-y-2">
                    <li>
                      Costo del ticket:{" "}
                      <span className="font-semibold">
                        {formatToMXN(ticket.total)}
                      </span>
                    </li>
                    <li>
                      Valor dentro del almacen:{" "}
                      <span className="font-semibold">
                        {formatToMXN(
                          ticket.flowers.reduce(
                            (acc, flower) =>
                              acc +
                              (flower.currentStockFresh +
                                (flower.currentwiltedFlowers || 0)) *
                                flower.current_price,
                            0
                          )
                        )}
                      </span>
                    </li>
                    <li>
                      Unidades ingresadas:{" "}
                      <span className="font-semibold">
                        {ticket.flowers.reduce(
                          (acc, flower) => acc + (flower.initialAmount || 0),
                          0
                        )}{" "}
                        Unidades
                      </span>
                    </li>
                    <li>
                      Fecha de orden:{" "}
                      <span className="font-semibold">
                        {formatToDate(ticket.orderDate.toString())}
                      </span>
                    </li>
                    <li>
                      Fecha de recepcion:{" "}
                      {ticket.deliveryDate ? (
                        <span className="font-semibold">
                          {formatToDate(ticket.deliveryDate.toString())}
                        </span>
                      ) : (
                        <span className="font-semibold text-red-400">
                          Aun no es procesada.
                        </span>
                      )}
                    </li>
                  </ul>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        className="h-10 w-full mt-2"
                      >
                        Eliminar
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Estas seguro que quieres eliminar este ticket?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta accion es irreversible.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="h-10">
                          Cancelar
                        </AlertDialogCancel>
                        <Form method="DELETE">
                          <input
                            type="hidden"
                            name="ticket"
                            value={ticket.id}
                          />
                          <AlertDialogAction
                            type="submit"
                            className="h-10"
                            disabled={navigation.state === "submitting"}
                          >
                            Continue
                          </AlertDialogAction>
                        </Form>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}
