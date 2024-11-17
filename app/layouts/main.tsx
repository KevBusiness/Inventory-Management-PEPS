import { useLocation, Outlet } from "@remix-run/react";
import lodash from "lodash";
import { User } from "@prisma/client";
import { AiFillHome, AiFillProduct } from "react-icons/ai";
import { PiFlowerTulipDuotone } from "react-icons/pi";
import { TbInvoice } from "react-icons/tb";
import { Button } from "~/components/ui/button";
import { MdOutlineInventory2 } from "react-icons/md";
import { Separator } from "~/components/ui/separator";
import { cn } from "~/lib/utils";
import { CiCalculator2 } from "react-icons/ci";
import { BsBell } from "react-icons/bs";

// TODO: Update lodash import
const { capitalize } = lodash;
const routes = [
  {
    path: "/dashboard",
    label: "Dashboard",
    icon: <AiFillHome />,
  },
  {
    path: "/tickets",
    label: "Tickets",
    icon: <TbInvoice />,
  },
  {
    path: "/inventario",
    label: "Inventario PEPS",
    icon: <MdOutlineInventory2 />,
  },
  {
    path: "/calculadora",
    label: "Calculadora",
    icon: <CiCalculator2 />,
  },
  // {
  //   path: "/new-ticket",
  //   label: "New Ticket",
  //   icon: <FaCloudUploadAlt />,
  // },
];
// TODO: Update layout colors

const colors = ["lime", "rose", "blue"];

export default function MainLayout({
  children,
  user,
}: {
  children: React.ReactNode;
  user: User;
}) {
  const location = useLocation();
  return (
    <div className="flex h-screen">
      <aside
        className={cn(
          colors[0] === "lime"
            ? "from-blue-200 to-blue-500"
            : "from-rose-200 to-rose-500",
          "flex flex-col justify-between w-56 py-5 bg-gradient-to-b "
        )}
      >
        <div className="space-y-5">
          <div className="flex items-center justify-between px-5">
            <h1 className="text-md">Carrillo F | Administrador</h1>
            <PiFlowerTulipDuotone size={30} />
          </div>
          <Separator className="bg-lime-50 h-[2px]" />
          <nav className="px-3 space-y-2">
            {routes.map((route) => (
              <Button
                key={route.path}
                asChild
                className="h-12 w-full bg-white"
                variant={"secondary"}
              >
                <a
                  href={route.path}
                  className="flex justify-between items-center"
                >
                  <span>{route.label}</span>
                  {route.icon}
                </a>
              </Button>
            ))}
          </nav>
        </div>
        <div className="px-3">
          <Button asChild className="h-12 w-full">
            <a href="/logout">Cerrar sesión</a>
          </Button>
        </div>
      </aside>
      <div className="flex-1 overflow-y-auto pb-5">
        <div className="flex items-center justify-between pt-5 px-5">
          <h2 className="text-2xl font-semibold">
            {capitalize(location.pathname.split("/")[1])}
          </h2>
          <div className="flex items-center gap-5">
            <p>
              Hola!
              <span className="ml-2 underline underline-offset-8">
                {user.name} {user.lastname}
              </span>
            </p>
            {/* Todo ADD sistema of notifications */}
            <div className="relative">
              <Button size={"icon"} type="button" variant={"ghost"}>
                <BsBell />
              </Button>
              <div className="bg-red-500 rounded-full h-5 w-5 text-white font-medium text-xs flex justify-center items-center absolute top-0 right-0">
                8
              </div>
            </div>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
