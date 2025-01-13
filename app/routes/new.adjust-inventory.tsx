import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
  redirect,
} from "@remix-run/node";
import {
  Form,
  useLoaderData,
  useSearchParams,
  useSubmit,
} from "@remix-run/react";
import db from "~/database/prisma.server";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "~/hooks/use-toast";
import { HiAdjustmentsHorizontal } from "react-icons/hi2";
import { LiaSaveSolid } from "react-icons/lia";
import { TbInvoice } from "react-icons/tb";
import { ProgressBar } from "~/components/progressBar";
import { getAllTickets } from "~/database/controller/general/tickets";
import TicketCard from "~/components/ticket/ticket_card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { cn, formatToMXN } from "~/lib/utils";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
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
import { Button } from "~/components/ui/button";
import { getData, updateFlower } from "~/controllers/adjust.server";
import { useCallback, useRef, useState } from "react";
import { authenticator } from "~/services/auth.server";
import { commitSession, getSession } from "~/services/alerts.session.server";
import { Checkbox } from "~/components/ui/checkbox";
import { readNotifications } from "~/controllers/notifications.server";

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
  { label: "Guardar datos", icon: <LiaSaveSolid /> },
];

interface FlowerData {
  id: number;
  name: string;
  oldFresh: number;
  oldWilted: number;
  currentFresh: number | null;
  currentWilted: number | null;
  location: string | null;
  oldAlert: number;
  currentAlert: number | null;
}

interface SensitiveData extends FlowerData {
  concept: string;
  adjustment: number;
  incorrect: boolean;
  reason: string;
  type: string;
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/",
  });
  const session = await getSession(request.headers.get("Cookie"));
  const formData = await request.formData();
  const url = new URL(request.url);
  const ticketId = url.searchParams.get("ticket");
  if (!ticketId) throw new Error("No existe un ticketId");
  const values = formData.get("values") as null | string;
  if (!values) throw new Error("No existe data");
  const data = JSON.parse(values) as SensitiveData[];
  await updateFlower(data, +ticketId, user!);
  await db.notification.create({
    data: {
      concept: "Ajuste de inventario",
      activity: `Se ajusto el inventario de N.lote ${ticketId}`,
      createdBy: user?.id!,
    },
  });
  session.flash("success", "El inventario fue ajustado correctamente.");
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
    return await getAllTickets();
  } else if (step === "1" && ticketSelect) {
    return getData(ticketSelect);
  } else if (step === "2") {
    return [];
  }
  return null;
};

export default function AdjustInventory() {
  const fetchData = useLoaderData<typeof loader>();
  const [sensitiveData, setSensitiveData] = useState<SensitiveData[]>([]);
  const formRef = useRef(null);
  const submit = useSubmit();
  const [searchParams, setSearchParams] = useSearchParams();
  const step = searchParams.get("step");
  const searchTerm = searchParams.get("search");
  const selectedTicket = searchParams.get("current");
  const filteredTickets = Array.isArray(fetchData)
    ? fetchData.filter((ticket) =>
        ticket.id.toString().includes(searchTerm || "")
      )
    : [];
  const handleSubmit = () => {
    const formData = new FormData(
      formRef.current as unknown as HTMLFormElement
    );
    const values = Object.fromEntries(formData);
    const filteredData = Object.entries(values).filter(
      ([key, value]) => value !== ""
    );
    if (!filteredData.length) {
      toast({
        title: "Error",
        description: "No existen datos ingresados",
        variant: "destructive",
      });
      return;
    }
    const groupedData = Object.entries(values).reduce(
      (acc: any, [key, quantity]) => {
        // Realizar el split del primer valor para obtener id, nombre, tipo y oldQuantity
        const [id, name, type, oldQuantity] = key.split("-");

        // Convertir la cantidad actual
        const currentQuantity = parseInt(quantity as string, 10);

        // Si no existe una entrada para este id, inicializamos el objeto
        if (!acc[id]) {
          acc[id] = {
            id: parseInt(id, 10),
            name: name,
            oldFresh: null,
            oldWilted: null,
            currentFresh: null,
            currentWilted: null,
            location: null,
            oldAlert: null,
            currentAlert: null,
          };
        }

        // Si el tipo es 'fresh', actualizamos oldFresh y currentFresh
        if (type === "fresh") {
          acc[id].oldFresh = parseInt(oldQuantity, 10); // Asignar oldQuantity a oldFresh
          acc[id].currentFresh = currentQuantity || null; // Asignar cantidad actual a currentFresh
        }
        // Si el tipo es 'wilted', actualizamos oldWilted y currentWilted
        else if (type === "wilted") {
          acc[id].oldWilted = parseInt(oldQuantity, 10); // Asignar oldQuantity a oldWilted
          acc[id].currentWilted = currentQuantity || null; // Asignar cantidad actual a currentWilted
        }
        // Si el tipo es 'location', actualizamos location
        else if (type === "location") {
          acc[id].location = currentQuantity || null; // Asignar location
        }
        // Si el tipo es 'currentMin', actualizamos oldAlert y currentAlert
        else if (type === "currentMin") {
          acc[id].oldAlert = parseInt(oldQuantity, 10); // Asignar oldQuantity a oldAlert
          acc[id].currentAlert = currentQuantity || null; // Asignar cantidad actual a currentAlert
        }
        return acc;
      },
      {}
    );
    const result = Object.values(groupedData as Record<number, FlowerData>)
      .filter(
        (item) =>
          item.currentAlert !== null ||
          item.currentFresh !== null ||
          item.currentWilted !== null ||
          item.location !== null
      )
      .map((item) => {
        let concept = "Ninguno";
        let adjustment = 0;
        let type = "";
        if (item.currentWilted === null && item.currentFresh) {
          adjustment = item.currentFresh - item.oldFresh;
          concept = "Vendiendo";
          type = "Frescas";
        }
        if (item.currentFresh === null && item.currentWilted) {
          adjustment = item.currentWilted - item.oldWilted;
          concept = "Vendiendo";
          type = "Marchitas";
        }
        if (
          item.oldWilted < item.oldFresh &&
          item.currentFresh !== null &&
          item.currentWilted !== null
        ) {
          const total = item.oldFresh + item.oldWilted;
          if (item.currentFresh > item.currentWilted) {
            type = "Frescas";
          } else {
            type = "Marchitas";
          }
          if (item.currentFresh + item.currentWilted === total) {
            adjustment = 0;
            concept = "De frescas a marchitas";
          } else {
            const remainingFresh =
              item.currentWilted + item.currentFresh - total;
            adjustment = remainingFresh;
            concept = "Vendiendo";
          }
        }
        return {
          type,
          reason: "",
          concept,
          adjustment,
          incorrect: false,
          ...item,
        };
      }) as SensitiveData[];
    const invalidData = result.filter((item: any) => {
      // Verificar que `currentFresh` sea mayor que `oldFresh` y que `currentWilted` o `currentAlert` no sean mayores que sus respectivas propiedades
      return (
        item.currentFresh > item.oldFresh || // `currentFresh` debe ser mayor que `oldFresh`
        item.currentWilted > item.oldFresh || // `currentWilted` debe ser mayor que `oldWilted`
        item.currentAlert > item.oldFresh // `currentAlert` debe ser mayor que `oldAlert`
      );
    });
    if (invalidData.length > 0) {
      toast({
        title: "Error",
        description:
          "Ingresaste mas unidades de las que dispones en una o varias flores",
        variant: "destructive",
      });
      return;
    }
    const sensitiveData = result.filter((item: any) => {
      return item.currentFresh > 0 || item.currentWilted > 0;
    });
    if (sensitiveData.length > 0) {
      setSensitiveData(result);
      return;
    }
    submit({ values: JSON.stringify(result) }, { method: "POST" });
    return;
  };

  const handleCorrect = (id: number, value: boolean) => {
    setSensitiveData((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, incorrect: value } : item
      )
    );
  };

  const handleReason = (id: number, value: string) => {
    setSensitiveData((prev) =>
      prev.map((item) => (item.id === id ? { ...item, reason: value } : item))
    );
  };

  return (
    <div className="flex overflow-hidden overflow-x-auto h-full">
      <ProgressBar
        formRef={formRef}
        steps={steps}
        currentStep={parseInt(step!) || 0}
        onSubmit={handleSubmit}
      />
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
      ) : !Array.isArray(fetchData) ? (
        <div className="overflow-x-auto w-full">
          <Form ref={formRef} className="p-5 sm:w-[110vw] lg:w-full">
            <Table className="border-collapse bg-white rounded-md w-full">
              <TableCaption>
                Ticket {fetchData?.ticket?.id} | Ajuste de inventario
              </TableCaption>
              <TableHeader className="h-full">
                <TableRow className="sticky top-0">
                  <TableHead className="w-[150px]">Tipo De Flor</TableHead>
                  <TableHead className="w-[150px]">Cantidad Fresca</TableHead>
                  <TableHead className="w-[150px]">Cantidad Marchita</TableHead>
                  <TableHead className="w-[180px]">Ubicacion</TableHead>
                  {/* <TableHead className="w-[180px]">Precio</TableHead> */}
                  <TableHead className="w-[150px]">Alertar en:</TableHead>
                </TableRow>
              </TableHeader>
              <AnimatePresence>
                <TableBody>
                  {fetchData?.ticket?.flowers.map((flower, index) => (
                    <TableRow
                      className={cn(
                        "odd:bg-white even:bg-neutral-50 even:hover:bg-neutral-100"
                      )}
                      key={index}
                    >
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
                        <Input
                          className="invalid:border-red-500 invalid:focus:ring-red-500 valid:placeholder-shown:border-neutral-200 valid:placeholder-shown:focus:ring-blue-500 valid:border-blue-500 valid:focus:ring-blue-500  peer"
                          name={`${flower.id}-${flower.flowerBox.name}-fresh-${flower.currentStockFresh}`}
                          type="number"
                          placeholder={`Actual: ${flower.currentStockFresh}`}
                          max={flower.currentStockFresh}
                        />
                        <p className="mt-2 hidden peer-invalid:block text-pink-600 text-xs">
                          La cantidad no puede ser mayor ala actual.
                        </p>
                      </motion.td>
                      <motion.td
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]"
                      >
                        <Input
                          className="invalid:border-red-500 invalid:focus:ring-red-500 valid:placeholder-shown:border-neutral-200 valid:placeholder-shown:focus:ring-blue-500 valid:border-blue-500 valid:focus:ring-blue-500  peer"
                          name={`${flower.id}-${flower.flowerBox.name}-wilted-${
                            flower.currentwiltedFlowers || 0
                          }`}
                          type="number"
                          placeholder={`Actual: ${
                            flower.currentwiltedFlowers || 0
                          }`}
                          max={flower.currentStockFresh}
                        />
                        <p className="mt-2 hidden peer-invalid:block text-pink-600 text-xs">
                          La cantidad no puede ser mayor ala cantidad fresca.
                        </p>
                      </motion.td>
                      <motion.td
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]"
                      >
                        <Select
                          name={`${flower.id}-${flower.flowerBox.name}-location`}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue
                              placeholder={`Actual: ${
                                flower.location?.name ||
                                flower.flowerBox.location?.name ||
                                "No especificado"
                              }`}
                            />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>Ubicaciones disponibles</SelectLabel>
                              {fetchData.locations
                                ?.filter(
                                  (location) =>
                                    location.id !== flower.locationId
                                )
                                .map((location, index) => (
                                  <SelectItem
                                    value={location.id.toString()}
                                    key={index}
                                  >
                                    {location.name}
                                  </SelectItem>
                                ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </motion.td>
                      <motion.td
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]"
                      >
                        <Input
                          className="invalid:border-red-500 invalid:focus:ring-red-500 valid:placeholder-shown:border-neutral-200 valid:placeholder-shown:focus:ring-blue-500 valid:border-blue-500 valid:focus:ring-blue-500  peer"
                          name={`${flower.id}-${
                            flower.flowerBox.name
                          }-currentMin-${flower.min || flower.flowerBox.min}`}
                          type="number"
                          placeholder={`Actual: ${
                            flower.min || flower.flowerBox.min || "N/A"
                          }`}
                          max={flower.currentStockFresh}
                        />
                        <p className="mt-2 hidden peer-invalid:block text-pink-600 text-xs">
                          La cantidad no puede ser mayor al del stock.
                        </p>
                      </motion.td>
                    </TableRow>
                  ))}
                </TableBody>
              </AnimatePresence>
            </Table>
            {sensitiveData.length > 0 && (
              <AlertDialogComponent
                handleReason={handleReason}
                sensitiveData={sensitiveData}
                handleCorrect={handleCorrect}
              />
            )}
          </Form>
        </div>
      ) : null}
    </div>
  );
}
const AlertDialogComponent = ({
  sensitiveData,
  handleCorrect,
  handleReason,
}: {
  sensitiveData: SensitiveData[];
  handleCorrect: (id: number, value: boolean) => void;
  handleReason: (id: number, value: string) => void;
}) => {
  const submit = useSubmit();
  const sortedData = sensitiveData.filter((item: any) => {
    return item.currentFresh > 0 || item.currentWilted > 0;
  });

  const handleSubmit = () => {
    submit({ values: JSON.stringify(sensitiveData) }, { method: "POST" });
  };

  return (
    <AlertDialog open>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Aviso</AlertDialogTitle>
          <AlertDialogDescription>
            Se encontraron ajustes delicados. Antes de proceder, debes tener en
            cuenta en qué concepto/s será/n procesado/s tu/s ajuste/s. Por
            favor, revísalos con atención y edita la configuración en caso de
            que no sea así.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Flor</TableHead>
              <TableHead>Cantidad Fresca Actual</TableHead>
              <TableHead>Cantidad Marchita Actual</TableHead>
              <TableHead>Nueva Cantidad Fresca</TableHead>
              <TableHead>Nueva Cantidad Marchita</TableHead>
              <TableHead>Ajuste / Cantidad</TableHead>
              <TableHead>Concepto</TableHead>
              <TableHead>Marca si es incorrecto</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {sortedData.map((item, index) => (
              <TableRow key={index}>
                <TableCell>{item.name}</TableCell>
                <TableCell className="text-center">
                  {item.oldFresh} Unidades
                </TableCell>
                <TableCell className="text-center">
                  {item.oldWilted} Unidades
                </TableCell>
                <TableCell className="text-center">
                  {item.currentFresh !== null
                    ? `${item.currentFresh} Unidades`
                    : "Sin cambios"}{" "}
                </TableCell>
                <TableCell className="text-center">
                  {item.currentWilted !== null
                    ? `${item.currentWilted} Unidades`
                    : "Sin cambios"}{" "}
                </TableCell>
                <TableCell className="text-center">{item.adjustment}</TableCell>
                <TableCell>{item.concept}</TableCell>
                <TableCell>
                  {item.adjustment !== 0 && (
                    <div className="flex justify-center">
                      <Checkbox
                        onCheckedChange={(value) =>
                          handleCorrect(item.id, value as boolean)
                        }
                      />
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {sortedData.filter((item) => item.incorrect === true).length > 0 && (
          <span className="font-semibold">Conceptos incorrectos</span>
        )}
        {sortedData
          .filter((item) => item.incorrect === true)
          .map((item, i) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: i * 0.1 }}
              key={i}
              className="flex gap-x-5 items-center"
            >
              <span className="font-semibold">{item.name}</span>
              <Input
                onChange={(e) => handleReason(item.id, e.target.value)}
                type="text"
                className="invalid:border-red-500 invalid:focus:ring-red-500 valid:placeholder-shown:border-neutral-200 valid:placeholder-shown:focus:ring-blue-500 valid:border-blue-500 valid:focus:ring-blue-500  peer"
                placeholder={`Explica la razon del ajuste de ${item.name}`}
              />
            </motion.div>
          ))}
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleSubmit}>
            Continuar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
