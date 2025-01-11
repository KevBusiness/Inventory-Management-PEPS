import { useLocation, useSearchParams, useParams } from "@remix-run/react";
import capitalize from "lodash/capitalize";
import { Notification, User } from "@prisma/client";
import { IoHomeOutline } from "react-icons/io5";
import { VscOutput } from "react-icons/vsc";
import { PiFlowerTulipDuotone } from "react-icons/pi";
import { TbInvoice } from "react-icons/tb";
import { Button } from "~/components/ui/button";
import { MdOutlineInventory2 } from "react-icons/md";
import { Toaster } from "~/components/ui/toaster";
import { cn } from "~/lib/utils";
import { CiCalculator2 } from "react-icons/ci";
import { TbLocation } from "react-icons/tb";
import { BsBell } from "react-icons/bs";
import { AnimatePresence, motion } from "framer-motion";
import NumberFlow from "@number-flow/react";
import { BsClipboardCheck, BsBoxes } from "react-icons/bs";
import { HiAdjustmentsHorizontal } from "react-icons/hi2";
import { FaCashRegister } from "react-icons/fa";

const routes = [
  {
    path: "/dashboard",
    label: "Dashboard",
    icon: <IoHomeOutline />,
  },
  {
    path: "/tickets",
    label: "Tickets",
    icon: <TbInvoice />,
  },
  {
    path: "/stock",
    label: "Inventario PEPS",
    icon: <MdOutlineInventory2 />,
  },
  {
    path: "/current-stock",
    label: "Existencias",
    icon: <BsBoxes />,
  },
  {
    path: "/new/adjust-inventory",
    label: "Ajustar Inventario",
    icon: <HiAdjustmentsHorizontal />,
  },
  {
    path: "/new/sale",
    label: "Nueva Venta",
    icon: <VscOutput />,
  },
  {
    path: "/process-ticket",
    label: "Procesar Pedido",
    icon: <BsClipboardCheck />,
  },
  {
    path: "/locations",
    label: "Ver ubicaciones",
    icon: <TbLocation />,
  },
  {
    path: "/pos",
    label: "Punto de venta",
    icon: <FaCashRegister />,
  },
];
export default function MainLayout({
  children,
  user,
  notifications,
}: {
  children: React.ReactNode;
  user?: User | null;
  notifications: Notification[] | undefined;
}) {
  const location = useLocation();
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedTicket = searchParams.get("current") || id;
  return (
    <main>
      <div className="flex h-screen">
        <aside
          className={cn(
            null,
            "flex flex-col justify-between w-52 py-5 border-r"
          )}
        >
          <div className="space-y-5">
            <div className="text-sky-950 flex items-center justify-between px-5 border-b-2 pb-3">
              <h1 className="text-md">Carrillo F | Administrador</h1>
              <PiFlowerTulipDuotone size={25} />
            </div>
            <nav className="px-3 space-y-2">
              <AnimatePresence>
                {routes.map((route, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Button
                      key={route.path}
                      asChild
                      className={cn(
                        location.pathname.split("/")[1] ===
                          route.path.split("/")[1]
                          ? "bg-blue-500 text-white hover:bg-blue-600 hover:text-white"
                          : null,
                        "w-full h-10 disabled:bg-red-500"
                      )}
                      variant={"ghost"}
                    >
                      <a
                        href={route.path}
                        className="flex justify-between items-center"
                      >
                        <span>{route.label}</span>
                        {route.icon}
                      </a>
                    </Button>
                  </motion.div>
                ))}
              </AnimatePresence>
              <AnimatePresence>
                {location.pathname.split("/")[1].includes("tickets") &&
                selectedTicket ? (
                  <motion.div
                    className="border-t h-fit py-3"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                  >
                    <p className="text-sm text-center">Lote seleccionado</p>
                    {selectedTicket ? (
                      <span className="text-[120px] font-bold mx-auto block w-fit">
                        <NumberFlow value={Number(selectedTicket)} />
                      </span>
                    ) : (
                      <span className="block my-5 mx-auto w-fit text-md font-semibold">
                        Sin especificar
                      </span>
                    )}
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </nav>
          </div>
          <div className="px-3 pt-5 border-t">
            <Button
              asChild
              className="h-10 w-full bg-rose-500 hover:bg-rose-600"
            >
              <a href="/logout">Cerrar sesión</a>
            </Button>
          </div>
        </aside>
        <div className="flex-1 overflow-y-auto pb-5">
          <div className="flex items-center justify-between pt-5 px-5 sticky top-0 bg-white shadow-sm border-b z-50 pb-2">
            <h2 className="text-2xl font-semibold">
              {capitalize(location.pathname.split("/")[1]).replace("-", " ")}
            </h2>
            <div className="flex items-center gap-5">
              <p>
                Hola!
                <span className="ml-2 underline decoration-wavy underline-offset-4">
                  {user?.name} {user?.lastname}
                </span>
              </p>
              <div className="relative">
                <Button size={"icon"} type="button" variant={"ghost"}>
                  <BsBell />
                </Button>
                {typeof notifications !== "undefined" ? (
                  !notifications.filter(
                    (notify) => notify.createdBy !== user?.id
                  ).length ? null : (
                    <div className="bg-red-500 rounded-full h-5 w-5 text-white font-medium text-xs flex justify-center items-center absolute top-0 right-0">
                      {notifications.length}
                    </div>
                  )
                ) : null}
              </div>
            </div>
          </div>
          {children}
        </div>
      </div>
      <Toaster />
    </main>
  );
}
