import { User } from "@prisma/client";
import { AiFillHome, AiFillProduct } from "react-icons/ai";
import { FaCloudUploadAlt } from "react-icons/fa";
import { IoCloudUploadOutline } from "react-icons/io5";
import { PiFlowerTulipDuotone } from "react-icons/pi";
import { TbInvoice } from "react-icons/tb";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { cn } from "~/lib/utils";

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
    label: "Inventario",
    icon: <AiFillProduct />,
  },
  // {
  //   path: "/new-ticket",
  //   label: "New Ticket",
  //   icon: <FaCloudUploadAlt />,
  // },
];
// TODO: Update layout colors

const colors = ["lime", "rose", "blue"];

export default function DashboardLayout({
  children,
  user,
}: {
  children: React.ReactNode;
  user: User;
}) {
  return (
    <div className="flex h-screen">
      <aside
        className={cn(
          "flex flex-col justify-between w-56 py-5 bg-gradient-to-b ",
          `from-${colors[0]}-200 to-${colors[0]}-300`
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
      <div className="flex-1">
        <div className="flex items-center justify-between pt-5 px-5">
          <h2 className="text-2xl font-semibold">Dashboard</h2>
          <p>
            Hola! {user.name} {user.lastname}
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
