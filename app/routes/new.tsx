import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import {
  Link,
  Outlet,
  useLoaderData,
  useLocation,
  useNavigate,
  useSearchParams,
  useSubmit,
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
import {
  getNotifications,
  readNotifications,
} from "~/controllers/notifications.server";
import { Notification, NotificationView, User } from "@prisma/client";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { getTimeElapsed } from "~/lib/utils";

export async function action({ request }: ActionFunctionArgs) {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/",
  });
  const formData = await request.formData();
  const ref = formData.get("ref") as string;
  switch (ref) {
    case "notifications":
      const notifications = JSON.parse(
        formData.get("notifications") as string
      ) as number[];
      try {
        await readNotifications(notifications, user!);
        return null;
      } catch (error) {
        console.log(error);
        return null;
      }
      break;
    default:
      break;
  }
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/",
  });
  try {
    const notifications = await getNotifications();
    return { user, notifications };
  } catch (error) {
    console.log(error);
    return null;
  }
};

interface NotificationProps extends Notification {
  user: User;
  seenBy: NotificationView[];
}

export default function New() {
  const data = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const path = location.pathname.split("/")[2];
  const step = searchParams.get("step");
  const submit = useSubmit();

  const handleReadNotifications = (data: NotificationProps[]) => {
    const notifications = data.map((notify) => notify.id);
    submit(
      { notifications: JSON.stringify(notifications), ref: "notifications" },
      { method: "POST" }
    );
  };

  const sortedNotifications = data?.notifications?.length
    ? data?.notifications
        .filter((notify) => notify.createdBy !== data?.user?.id)
        .filter(
          (notify) =>
            !notify.seenBy.some((view) => view.userId === data?.user?.id)
        )
    : [];

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
                <SelectItem value="adjust-inventory">Nuevo Ajuste</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <div className="relative">
            <Popover>
              <PopoverTrigger asChild>
                <Button size={"icon"} type="button" variant={"ghost"}>
                  <BsBell />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="mr-5 mt-1 space-y-2 h-[500px] max-h-[500px] overflow-y-auto">
                {sortedNotifications.length > 0 ? (
                  <span
                    onClick={() => handleReadNotifications(sortedNotifications)}
                    className="hover:cursor-pointer hover:underline hover:underline-offset-4 text-blue-600 text-xs"
                  >
                    Marcar como leidas.
                  </span>
                ) : (
                  <span className="text-muted-foreground text-center">
                    No tienes notificaciones recientes
                  </span>
                )}
                {sortedNotifications.map((notify) => (
                  <NotificationCard key={notify.id} data={notify} />
                ))}
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
      <Outlet />
      <Toaster />
    </main>
  );
}

const NotificationCard = ({ data }: { data: NotificationProps }) => {
  const { concept, activity, createdAt, user } = data;

  // Formatear la fecha de creación
  const formattedDate = new Date(createdAt).toLocaleDateString("es-ES", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="bg-white border p-3 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex flex-col space-y-2">
        {/* Concepto de la notificación */}
        <h3 className="text-sm font-medium text-gray-800">{concept}</h3>

        {/* Actividad */}
        <p className="text-xs text-gray-600">{activity}</p>

        {/* Fecha de creación */}
        <div className="text-xs text-gray-500">
          <span className="font-medium">Fecha:</span> {formattedDate}
        </div>

        <div className="text-xs text-gray-500">
          <span className="font-medium">Tiempo: </span>
          {getTimeElapsed(data.createdAt)}
        </div>

        {/* Creado por */}
        <div className="text-xs text-gray-500">
          <span className="font-medium">Creado por:</span> {data.user.name}{" "}
          {data.user.lastname}
        </div>
      </div>
    </div>
  );
};
