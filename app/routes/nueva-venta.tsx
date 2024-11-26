import { ReactNode, useEffect, useState } from "react";
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
  redirect,
} from "@remix-run/node";
import db from "~/database/prisma.server";
import {
  Form,
  useLoaderData,
  useNavigate,
  useSearchParams,
  useSubmit,
  useNavigation,
} from "@remix-run/react";
import { authenticator } from "~/services/auth.server";
import { cn, formatToDate, formatToMXN } from "~/lib/utils";
import { useToast } from "~/hooks/use-toast";
import { Ticket } from "@prisma/client";
import { TbInvoice } from "react-icons/tb";
import { GiFlowerPot } from "react-icons/gi";
import { CiSquareInfo } from "react-icons/ci";
import { BsBell, BsBox2, BsCardChecklist } from "react-icons/bs";
import { LuGalleryVerticalEnd } from "react-icons/lu";
import { CalendarDays, Search } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Toaster } from "~/components/ui/toaster";
import { ToastAction } from "~/components/ui/toast";
import { commitSession, getSession } from "~/services/alerts.session.server";

export const meta: MetaFunction = () => {
  return [
    { title: "Nueva Venta | Inventory Management" },
    {
      name: "description",
      content: "Inventory management venta panel.",
    },
  ];
};

type FlowersData = {
  id: string;
  name: string;
  value: number;
  total: number;
  currentAmount: number;
};

export async function action({ request }: ActionFunctionArgs) {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/",
  });
  const session = await getSession(request.headers.get("Cookie"));
  const body = await request.formData();
  const url = new URL(request.url);
  const tickedId = url.searchParams.get("onTicket");
  const flowers = JSON.parse(body.get("flowers")! as string) as FlowersData[];
  flowers.forEach(async (flower) => {
    await db.flower.update({
      where: {
        id: +flower.id,
      },
      data: {
        status:
          // TODO: fix the state of the flower right side
          flower.currentAmount - flower.value === 0 ? "Vendidas" : "Frescas",
        Amount_sell: {
          increment: flower.value,
        },
        total_sales: {
          increment: flower.total,
        },
      },
    });
  });
  if (tickedId) {
    await db.ticket.update({
      where: {
        // TODO: update this
        id: +tickedId,
      },
      data: {
        updatedAt: new Date(),
      },
    });
    await db.sale.create({
      data: {
        ticketId: +tickedId,
        userId: user?.id!,
        createdAt: new Date(),
        updatedFlowers: JSON.stringify(flowers),
        total: flowers.reduce((acc, flower) => acc + flower.total, 0),
      },
    });
    session.flash("success_sale", "Venta creada correctamente.");
    return redirect("/dashboard", {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  }
  return null;
}

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/",
  });
  const session = await getSession(request.headers.get("Cookie"));
  let tickets = null;
  let ticketFound = null;
  const url = new URL(request.url);
  const tickedId = url.searchParams.get("ticket");

  if (!tickedId) {
    tickets = await db.ticket
      .findMany({
        include: {
          sales: {
            select: {
              total: true,
            },
          },
        },
      })
      .catch((error) => {
        console.error(error);
        return null;
      });
  } else {
    ticketFound = await db.ticket
      .findUnique({
        where: {
          id: parseInt(tickedId),
        },
        include: {
          flowers: {
            select: {
              id: true,
              price: true,
              amount: true,
              min_amount: true,
              Amount_sell: true,
              status: true,
              flowerCategory: {
                select: {
                  name: true,
                },
              },
            },
          },
          user: true,
        },
      })
      .catch((error) => {
        console.error(error);
        return null;
      });
  }

  return Response.json(
    { user: user!, tickets, ticketFound },
    {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    }
  );
}

export function Layout({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  return (
    <main className="bg-neutral-100 h-screen flex flex-col">
      <div className="flex items-center justify-between bg-white shadow-md py-2 px-5 z-10">
        <div className="flex items-center gap-x-24">
          <Button
            type="button"
            className="h-12 w-28"
            onClick={() => navigate(-1)}
          >
            Volver
          </Button>
          {/* TODO: UPDATE ON PRODUCTION */}
          <Form
            className="relative"
            method="GET"
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const lote = formData.get("lote") as string;
              console.log(lote);
            }}
          >
            <Button
              type="submit"
              className="absolute right-1 top-[0.35rem]"
              size={"icon"}
              variant={"ghost"}
            >
              <Search size={24} />
            </Button>
            <Input
              className="h-12 font-light pr-10
          placeholder-shown:invalid:border-neutral-200
          focus:invalid:ring-red-500 focus:invalid:ring-1 invalid:border-red-500
            focus:valid:ring-1 focus:valid:ring-blue-500 valid:border-blue-500"
              type="text"
              placeholder="Buscar por numero de lote.."
              name="lote"
              required
            />
          </Form>
        </div>
        <div className="flex items-center gap-5">
          <p>
            Seccion:
            <span className="ml-2 underline underline-offset-8">
              Nueva Venta
            </span>
          </p>
          {/* TODO: ADD sistema of notifications */}
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
      <Toaster />
    </main>
  );
}

export default function NuevaVenta() {
  const data = useLoaderData<typeof loader>();
  const submit = useSubmit();
  const navigate = useNavigate();
  const navigation = useNavigation();
  const { toast } = useToast();

  const [formData, setFormData] = useState<
    Record<string, string | number>[] | null
  >(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const step = searchParams.get("step")
    ? parseInt(searchParams.get("step")!)
    : undefined;

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const flowers = Object.fromEntries(formData) as Record<string, string>;
    const flowersFiltered = Object.entries(flowers)
      .filter(([_, value]) => value !== "")
      .map(([key, value]) => ({
        id: key.split("-")[4],
        total: +value * +key.split("-")[3],
        currentAmount: +key.split("-")[2],
        name: key.split("-")[1],
        value: +value,
      }));
    if (flowersFiltered.length > 0) {
      setFormData(flowersFiltered);
    } else {
      toast({
        title: "Error!",
        description: "No se han encontrado cambios en las cantidades.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = () => {
    submit(
      { flowers: JSON.stringify(formData) },
      { method: "POST", encType: "multipart/form-data" }
    );
  };

  useEffect(() => {
    if (step === 2 && !formData) {
      toast({
        title: "Ho no!",
        description:
          "No tienes los datos suficientes para crear una venta, asigna datos primero.",
        variant: "destructive",
      });
    }
    if (step === 1 && !data.ticketFound) {
      toast({
        title: "Error!",
        description: "El ticket solicitado no existe.",
        variant: "destructive",
        action: (
          <ToastAction altText="Volver atras" onClick={() => navigate(-1)}>
            Volver atras
          </ToastAction>
        ),
      });
    }
  }, [step, formData]);
  // TODO: Fix this sort

  const sortedTickets = data.tickets?.sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <Layout>
      <div className="flex flex-1 overflow-hidden">
        <ProgressBar currentStep={step} />
        <div
          className={cn(
            data.ticketFound
              ? "overflow-y-auto custom-scrollbar"
              : "flex gap-x-8",
            "flex-1 h-full px-8 pt-2"
          )}
        >
          {step === 1 && data.ticketFound ? (
            <>
              <Form
                method="POST"
                className="rounded-md overflow-hidden border"
                onSubmit={(e) => handleSave(e)}
              >
                <div className="bg-white px-2 pt-1  flex items-center justify-around text-md font-medium text-neutral-600 h-12 border-b hover:bg-neutral-50 transition">
                  <span className="w-1/3">Tipo De Flor</span>
                  <span className="w-1/3">Cantidad Actual</span>
                  <span className="">Nueva Cantidad</span>
                </div>
                <div>
                  {data.ticketFound.flowers.map((flower) => {
                    if (flower.status === "Vendidas") return null;
                    if (flower.amount - (flower.Amount_sell || 0) <= 0)
                      return null;
                    return (
                      <div
                        key={flower.id}
                        className="bg-white hover:bg-neutral-50 flex items-center justify-around border-b py-2 px-2"
                      >
                        <div className="w-1/3">
                          <Label
                            htmlFor={`flower-${flower.flowerCategory.name}-${
                              flower.amount - (flower.Amount_sell || 0)
                            }-${flower.price}-${flower.id}`}
                            className="text-md block w-fit shadow-lg text-neutral-900 font-semibold hover:cursor-pointer rounded-sm bg-yellow-200 p-1 ring-4 ring-yellow-100 border-2 border-yellow-300"
                          >
                            {flower.flowerCategory.name}
                          </Label>
                        </div>
                        <span className="w-1/3 text-neutral-600 font-normal text-sm">
                          {flower.amount - (flower.Amount_sell || 0)} Unidades
                        </span>
                        <Input
                          id={`flower-${flower.flowerCategory.name}-${
                            flower.amount - (flower.Amount_sell || 0)
                          }-${flower.price}-${flower.id}`}
                          className="h-12 w-40 font-light placeholder-shown:invalid:border-neutral-200 focus:invalid:ring-red-500 focus:invalid:ring-1 invalid:border-red-500 focus:valid:ring-1 focus:valid:ring-blue-500 focus:valid:border-blue-200 valid:border-neutral-500"
                          type="number"
                          name={`flower-${flower.flowerCategory.name}-${
                            flower.amount - (flower.Amount_sell || 0)
                          }-${flower.price}-${flower.id}`}
                          max={flower.amount - (flower.Amount_sell || 0)}
                          placeholder="Ajustar Cantidad"
                        />
                      </div>
                    );
                  })}
                </div>
                <Button
                  type="submit"
                  className="h-12 w-full bg-blue-600 hover:bg-blue-500 rounded-none"
                  onClick={() => {
                    toast({
                      title: "Cambios Guardados",
                      description: "Los cambios han sido guardados con exito.",
                    });
                  }}
                >
                  Guardar Cambios
                </Button>
              </Form>
              <div className="flex justify-end mb-5">
                <Button
                  type="button"
                  className="h-12 w-28 mt-4"
                  disabled={!formData}
                  onClick={() => {
                    setSearchParams({
                      step: "2",
                      // TODO: update more security for this, Note: this is a temporary solution.
                      onTicket: data.ticketFound?.id.toString()!,
                    });
                  }}
                >
                  Continuar
                </Button>
              </div>
            </>
          ) : step === 2 && formData ? (
            // TODO: Add a new component for this, NOTE: This is a temporary solution
            <>
              <div className="w-full">
                <div className="bg-white w-[700px] h-fit mx-auto rounded-sm overflow-hidden mt-2">
                  <div className="flex w-full gap-5 mb-2 bg-blue-200 p-3 justify-evenly">
                    {Array.from({ length: 13 }, (_, i) => (
                      <div
                        key={i}
                        className="h-8 w-8 bg-neutral-50 rounded-full border border-blue-400 shadow-inner"
                      ></div>
                    ))}
                  </div>
                  <p className="text-lg text-center border-b pb-2">
                    Resumen de unidades actualizadas.
                  </p>
                  {formData.map(({ id, name, value, total, currentAmount }) => (
                    <ul
                      key={id}
                      className="border-b border-b-red-200 px-5 py-2 text-center"
                    >
                      {name} - Unidades vendidas: {value} -{" "}
                      {formatToMXN(total as number)} -{" "}
                      {Number(currentAmount) - Number(value) === 0
                        ? "Liquidando"
                        : null}
                    </ul>
                  ))}
                  <p className="py-2 text-end px-5 font-semibold">
                    Total de venta{" "}
                    <span>
                      {formatToMXN(
                        formData.reduce(
                          (acc, flower) => acc + (flower.total as number),
                          0
                        )
                      )}
                    </span>
                  </p>
                </div>
                <div className="flex justify-end mb-5 w-[700px] mx-auto">
                  <Button
                    type="button"
                    className="h-12 w-28 mt-4"
                    onClick={() => handleSubmit()}
                    disabled={navigation.state === "submitting"}
                  >
                    Guardar Venta
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="pr-7 border-r overflow-y-auto custom-scrollbar">
                <div className="flex items-center gap-2 mb-2">
                  <CiSquareInfo size={20} />
                  <span className="text-sm">Tickets Recomendados:</span>
                </div>
                <div className="space-y-5 pb-8">
                  {sortedTickets &&
                    sortedTickets.map((ticket) => (
                      <TicketCard data={ticket} key={ticket.id} />
                    ))}
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <LuGalleryVerticalEnd />
                  <span className="text-sm">
                    Todos los tickets con stock disponible.
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-y-5">
                  {data.tickets &&
                    data.tickets.map((ticket) => (
                      <TicketCard data={ticket} key={ticket.id} />
                    ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}

interface TicketCardProps extends Ticket {
  sales: {
    total: number;
  }[];
}

export function TicketCard({ data }: { data: TicketCardProps }) {
  const [_, setSearchParams] = useSearchParams();
  return (
    <div
      className="bg-white h-32 w-60 p-2 border-b-2 shadow-sm hover:cursor-pointer rounded-md flex flex-col justify-around"
      onClick={() => {
        setSearchParams({ step: "1", ticket: data.id.toString() });
      }}
    >
      <p className="text-xs flex gap-2">
        <CalendarDays size={15} />
        <span className="w-full truncate">
          {formatToDate(data.createdAt.toString())}
        </span>
      </p>
      <p className="text-xs">
        Venta Acumulada:{" "}
        {formatToMXN(data.sales.reduce((acc, sale) => acc + sale.total, 0))}
      </p>
      <div className="flex gap-x-1 items-center">
        <div className="h-3 w-3 rounded-full bg-green-400 animate-pulse ring-1 ring-green-200 border border-green-100"></div>
        <span className="text-xs">Stock pendiente</span>
      </div>
      <div className="flex gap-3">
        <p className="text-xs">
          Frescas: <span className="text-green-500">10</span>
        </p>
        <p className="text-xs">
          Marchitas: <span className="text-red-500">2</span>
        </p>
      </div>
      <p className="text-xs flex items-center gap-2">
        <BsBox2 />
        N.Lote: {data.id}
      </p>
    </div>
  );
}

const steps = ["Seleccionar Ticket", "Actualizar Flores", "Resumen Venta"];

export function ProgressBar({ currentStep = 0 }: { currentStep?: number }) {
  return (
    <aside className="h-full w-56 bg-white px-5 pt-1 space-y-3 border-t shadow-md">
      <p className="text-sm text-center">Barra de progreso</p>
      {steps.map((step, index) => (
        <Step step={step} index={index} key={index} currentStep={currentStep} />
      ))}
    </aside>
  );
}

export function Step({
  step,
  index,
  currentStep,
}: {
  step: string;
  index: number;
  currentStep: number;
}) {
  return (
    <div
      className={cn(
        index === currentStep
          ? "border-2 ring-2 ring-blue-200 border-blue-400"
          : index < currentStep
          ? "hover:cursor-not-allowed border border-b-blue-300"
          : "border border-neutral-500 animate-pulse",
        "rounded-md h-12 w-full  shadow-sm flex justify-between items-center px-3"
      )}
    >
      <span
        className={cn(
          index === currentStep
            ? "underline underline-offset-2"
            : index < currentStep
            ? "line-through font-semibold"
            : "text-muted-foreground",
          "text-xs"
        )}
      >
        {step}
      </span>
      {index === 0 ? (
        <TbInvoice className="text-neutral-500" />
      ) : index === 1 ? (
        <GiFlowerPot className="text-neutral-500" />
      ) : index === 2 ? (
        <BsCardChecklist className="text-neutral-500" />
      ) : null}
    </div>
  );
}
