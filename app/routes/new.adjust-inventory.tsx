import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
  redirect,
} from "@remix-run/node";
import { Form, useLoaderData, useSearchParams } from "@remix-run/react";
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
  getData,
  UpdateInventory,
} from "~/database/controller/adjust-inventory.server";
import { useRef } from "react";
import { authenticator } from "~/services/auth.server";
import { commitSession, getSession } from "~/services/alerts.session.server";

type AdjustField = {
  action: string;
  flowerId: number;
  value: number;
};

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
  const data = JSON.parse(values) as AdjustField[];
  await UpdateInventory(data, user!, +ticketId!);
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
  const formRef = useRef(null);
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
      <ProgressBar
        formRef={formRef}
        steps={steps}
        currentStep={parseInt(step!) || 0}
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
        <Form ref={formRef} className="p-5 w-full">
          <Table className="border-collapse bg-white rounded-md">
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
                        name={`flower-${flower.id}-currentFresh`}
                        type="number"
                        placeholder={`Actual: ${flower.currentStockFresh}`}
                      />
                    </motion.td>
                    <motion.td
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]"
                    >
                      <Input
                        name={`flower-${flower.id}-currentWilted`}
                        type="number"
                        placeholder={`Actual: ${
                          flower.currentwiltedFlowers || 0
                        }`}
                      />
                    </motion.td>
                    <motion.td
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]"
                    >
                      <Select name={`flower-${flower.id}-location`}>
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
                                (location) => location.id !== flower.locationId
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
                    {/* <motion.td
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]"
                    >
                      <Input
                        name={`flower-${flower.id}-currenPrice`}
                        type="number"
                        placeholder={`Actual: ${formatToMXN(
                          flower.current_price
                        )}`}
                      />
                    </motion.td> */}
                    <motion.td
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]"
                    >
                      <Input
                        name={`flower-${flower.id}-currentMin`}
                        type="number"
                        placeholder={`Actual: ${
                          flower.min || flower.flowerBox.min || "N/A"
                        }`}
                      />
                    </motion.td>
                  </TableRow>
                ))}
              </TableBody>
            </AnimatePresence>
          </Table>
        </Form>
      ) : null}
    </div>
  );
}
