import { LoaderFunctionArgs } from "@remix-run/node";
import {
  Link,
  Outlet,
  useLocation,
  useNavigate,
  useSearchParams,
} from "@remix-run/react";
import { BsBell } from "react-icons/bs";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Toaster } from "~/components/ui/toaster";
import { authenticator } from "~/services/auth.server";
import { IoHomeOutline } from "react-icons/io5";
import { TbRefresh } from "react-icons/tb";
import { CiSearch } from "react-icons/ci";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticator.isAuthenticated(request, {
    failureRedirect: "/",
  });
  return null;
};

export default function New() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const path = location.pathname.split("/")[2];
  const step = searchParams.get("step");
  return (
    <main className="bg-gray-100 h-screen flex flex-col">
      <div className="flex items-center justify-between py-5 px-5 z-10 border-b shadow-md">
        <div className="flex items-center gap-x-2">
          <Button
            type="button"
            className="h-10 w-10 bg-blue-600 hover:bg-blue-700"
            asChild
          >
            <Link to={"/dashboard"}>
              <IoHomeOutline />
            </Link>
          </Button>
          {(path === "sale" && !step) ||
          (path === "adjust-inventory" && !step) ? (
            <div className="relative ml-5">
              <CiSearch
                className="absolute top-[0.7rem] left-2 text-muted-foreground"
                size={20}
              />
              <Input
                className="h-10 w-64 bg-white pl-9 shadow-sm hover:shadow-md transition"
                placeholder="Buscar por numero de lote..."
                onChange={(e) => {
                  setSearchParams((prev) => ({
                    ...Object.fromEntries(prev),
                    search: e.target.value,
                  }));
                }}
              />
            </div>
          ) : null}
        </div>
        <div className="flex items-center gap-5">
          <Select
            defaultValue={path}
            onValueChange={(value) => {
              navigate(`/new/${value}`);
            }}
          >
            <SelectTrigger className="w-[180px] bg-white hover:shadow-md h-10 transition">
              <SelectValue placeholder="Seleccionar pagina" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="sale">Nueva Venta</SelectItem>
                <SelectItem value="ticket">Nueva Entrada</SelectItem>
                {/* <SelectItem value="adjust-inventory">Nuevo Ajuste</SelectItem> */}
              </SelectGroup>
            </SelectContent>
          </Select>
          <div className="relative">
            <Button
              className="h-10 w-10 border-none bg-accent shadow-none text-black hover:bg-black/10"
              type="button"
            >
              <BsBell />
            </Button>
            <div className="bg-red-500 rounded-full h-5 w-5 text-white font-medium text-xs flex justify-center items-center absolute top-0 right-0">
              8
            </div>
          </div>
        </div>
      </div>
      <Outlet />
      <Toaster />
    </main>
  );
}
