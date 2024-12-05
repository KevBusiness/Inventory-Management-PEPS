import { useEffect, useState } from "react";
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
  redirect,
} from "@remix-run/node";
import {
  Form,
  useLoaderData,
  useNavigate,
  useSearchParams,
  useSubmit,
} from "@remix-run/react";
import db from "~/database/prisma.server";
import { getSession, commitSession } from "~/services/alerts.session.server";
import { BsCardChecklist, BsTrash } from "react-icons/bs";
import { GiFlowerPot, GiMatterStates } from "react-icons/gi";
import { TbInvoice, TbFileInvoice } from "react-icons/tb";
import { LiaSaveSolid } from "react-icons/lia";
import { ProgressBar } from "~/components/progressBar";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { toast } from "~/hooks/use-toast";
import { FlowerBox } from "@prisma/client";
import FlowerNotebook from "~/components/flower-notebook";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { authenticator } from "~/services/auth.server";
import PivotTable from "~/components/form/pivot_table";
import { generateUniqueCode } from "~/lib/utils";

const steps = [
  { label: "Seleccionar Flores", icon: <TbInvoice /> },
  { label: "Ingresar Cantidades", icon: <GiFlowerPot /> },
  { label: "Confirmar Entrada", icon: <BsCardChecklist /> },
  { label: "Estado del Ticket", icon: <GiMatterStates /> },
  { label: "Guardar Entrada", icon: <LiaSaveSolid /> },
];

export const meta: MetaFunction = () => {
  return [
    { title: "Nueva Entrada" },
    {
      name: "description",
      content: "Inventory management for a flower shop",
    },
  ];
};

type FlowersFields = {
  flowerBoxId: number;
  name: string;
  currentStockFresh: number;
  price: number;
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/",
  });
  const formData = await request.formData();
  const session = await getSession(request.headers.get("Cookie"));
  const action = formData.get("action") as string;
  let flower_name;
  switch (action) {
    case "action_make":
      flower_name = formData.get("flower_name") as string;
      await db.flowerBox.create({
        data: { name: flower_name, code: generateUniqueCode() },
      });
      session.flash("success", `${flower_name} ha sido añadido correctamente.`);
      return new Response(null, {
        status: 201,
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      });
    case "action_delete":
      const flower_id = formData.get("flower_id") as string;
      flower_name = formData.get("flower_name") as string;
      await db.flowerBox.delete({
        where: { id: parseInt(flower_id) },
      });
      session.flash("success", `${flower_name} fue eliminada correctamente.`);
      return new Response(null, {
        status: 200,
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      });
    case "action_confirm":
      const flowersData = formData.get("flowers");
      const status_type = formData.get("status_type") as
        | "Pedido"
        | "Disponible"
        | "Agotado";
      if (!flowersData) {
        throw new Error("Flowers data is missing");
      }
      const flowers = JSON.parse(flowersData as string) as FlowersFields[];
      const ticketCreated = await db.ticket.create({
        data: {
          status: status_type,
          userId: Number(user?.id),
          total: flowers.reduce(
            (acc, flower) => acc + flower.price * flower.currentStockFresh,
            0
          ),
        },
      });
      flowers.forEach(async (flower) => {
        const { flowerBoxId, currentStockFresh, price } = flower;
        await db.flower.create({
          data: {
            flowerBoxId,
            current_price: price,
            currentStockFresh,
            ticketId: ticketCreated.id,
          },
        });
      });
      session.flash("success", "Entrada realizada correctamente.");
      return redirect("/dashboard", {
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      });
    default:
      break;
  }
};

type FetchData = {
  message: string | undefined;
  flowers: FlowerBox[] | undefined;
};

export const loader = async ({
  request,
}: LoaderFunctionArgs): Promise<FetchData> => {
  let flowers;
  const session = await getSession(request.headers.get("Cookie"));
  const url = new URL(request.url);
  const stepFound = url.searchParams.get("step");
  if (!stepFound) {
    flowers = await db.flowerBox
      .findMany({
        select: {
          id: true,
          name: true,
        },
      })
      .catch((error) => {
        {
          console.log(error);
          return undefined;
        }
      });
  }
  return Response.json(
    { message: session.get("success"), flowers },
    {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    }
  ) as unknown as FetchData;
};

type SelectedFlower = {
  id: number;
  name: string;
};

const headerFields = ["Nombre", "Cantidad", "Precio Individual"];

// TODO: add drag and drop after selecting flowers
export default function NewTicket() {
  const submit = useSubmit();
  const { message, flowers } = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedFlowers, setSelectedFlowers] = useState<SelectedFlower[]>([]);
  const [flowersFields, setFlowersFields] = useState<FlowersFields[]>([]);
  const step = searchParams.get("step");

  const handleSave = (id: number, name?: string) => {
    if (selectedFlowers.find((flower) => flower.id === id)) {
      const newSelectedFlowers = selectedFlowers.filter(
        (flower) => flower.id !== id
      );
      setSelectedFlowers(newSelectedFlowers);
    } else {
      setSelectedFlowers([...selectedFlowers, { id, name: name! }]);
    }
  };

  const handleAmount = (
    e: React.ChangeEvent<HTMLInputElement>,
    id: number,
    name: string,
    key: string
  ) => {
    const flowerFieldFound = flowersFields.find(
      (flower) => flower.flowerBoxId === id
    );
    if (flowerFieldFound) {
      switch (key) {
        case "fresh":
          setFlowersFields((prev) =>
            prev.map((flower) =>
              flower.flowerBoxId === id
                ? { ...flower, currentStockFresh: Number(e.target.value) }
                : flower
            )
          );
          break;
        case "price":
          setFlowersFields((prev) =>
            prev.map((flower) =>
              flower.flowerBoxId === id
                ? { ...flower, price: Number(e.target.value) }
                : flower
            )
          );
          break;
        default:
          break;
      }
      return;
    }
    switch (key) {
      case "fresh":
        setFlowersFields([
          ...flowersFields,
          {
            flowerBoxId: id,
            currentStockFresh: Number(e.target.value),
            price: 0,
            name,
          },
        ]);
        break;
      case "price":
        setFlowersFields([
          ...flowersFields,
          {
            flowerBoxId: id,
            currentStockFresh: 0,
            price: Number(e.target.value),
            name,
          },
        ]);
        break;
      default:
        break;
    }
  };

  const sortedFlowers = flowers?.filter(
    (flower) => !selectedFlowers.some((select) => select.id === flower.id)
  );

  useEffect(() => {
    if (message) {
      toast({ title: "Exito", description: message });
    }
  }, [message]);

  return (
    <div className="flex overflow-hidden h-full">
      <ProgressBar steps={steps} currentStep={parseInt(step!) || 0} />
      {!step ? (
        <div className="flex-1 flex py-2">
          <div className="w-1/3 px-5 border-r space-y-1">
            <p className="text-center text-sm">Nueva Flor</p>
            <Form
              method="POST"
              className="space-y-2"
              onSubmit={(e) => {
                e.preventDefault();
                submit(e.currentTarget);
                e.currentTarget.reset();
              }}
            >
              <label htmlFor="flower_name">Nombre de la flor</label>
              <Input
                type="text"
                id="flower_name"
                name="flower_name"
                className="bg-white h-12"
                placeholder="Ingrese el nombre de la flor"
              />
              <input type="hidden" value="action_make" name="action" />
              <div className="flex justify-end">
                <Button className="h-12 w-36">Añadir</Button>
              </div>
            </Form>
          </div>
          <div className="w-1/3 px-5 border-r space-y-1 overflow-y-auto custom-scrollbar">
            <p className="text-sm">Seleccionar Flores</p>
            <span className="text-muted-foreground text-sm">
              Seleccione las flores que correspondan con su entrada.
            </span>
            <div className="space-y-3">
              {sortedFlowers &&
                sortedFlowers.map((flower) => (
                  <div
                    key={flower.id}
                    className="h-10 flex justify-between border-b first:mt-4"
                  >
                    <div className="flex gap-x-2">
                      <input
                        id={flower.id.toString()}
                        onChange={() => handleSave(flower.id, flower.name)}
                        type="checkbox"
                        className="h-5 w-5 appearance-none border border-neutral-500 bg-white rounded-md checked:bg-blue-500 checked:border-blue-100 checked:ring-2 checked:ring-blue-200 shadow-sm transition hover:cursor-pointer"
                      />
                      <label
                        htmlFor={flower.id.toString()}
                        className="text-md "
                      >
                        {flower.name}
                      </label>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          size={"icon"}
                          className="bg-transparent text-neutral-600 border-0 shadow-none hover:bg-red-500 hover:text-white hover:shadow-md"
                        >
                          <BsTrash />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>
                            Deseas elimiar {flower.name}?
                          </DialogTitle>
                          <DialogDescription>
                            Esta accion no puede ser irreversible.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <Form method="DELETE">
                            <input
                              type="hidden"
                              value="action_delete"
                              name="action"
                            />
                            <input
                              type="hidden"
                              value={flower.id.toString()}
                              name="flower_id"
                            />
                            <input
                              type="hidden"
                              value={flower.name}
                              name="flower_name"
                            />
                            <Button type="submit" className="h-12 w-36">
                              Confirmo
                            </Button>
                          </Form>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                ))}
            </div>
          </div>
          <div className="w-1/3 px-5 border-r space-y-1 flex flex-col justify-between">
            <p className="text-center text-sm">Flores Seleccionadas</p>
            {selectedFlowers.length > 0 ? (
              <>
                <div className="max-h-[550px] h-[550px] overflow-y-auto">
                  {selectedFlowers.map((flower, index) => (
                    <div
                      className="text-sm border-b py-2 flex items-center justify-between"
                      key={flower.id}
                    >
                      <span>
                        {index + 1}-{flower.name}
                      </span>
                      <Button
                        size={"icon"}
                        className="bg-transparent text-neutral-600 border-0 shadow-none hover:bg-red-500 hover:text-white hover:shadow-md"
                        onClick={() => {
                          handleSave(flower.id);
                        }}
                      >
                        <BsTrash />
                      </Button>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <p className="text-center text-muted-foreground text-md">
                  No existen flores seleccionadas.
                </p>
              </>
            )}
            <Button
              className="h-12"
              disabled={selectedFlowers.length > 0 ? false : true}
              type="button"
              onClick={() => setSearchParams({ step: "1" })}
            >
              Continuar
            </Button>
          </div>
        </div>
      ) : parseInt(step) === 1 && selectedFlowers.length > 0 ? (
        <div className="flex-1 px-5 pb-10 overflow-y-auto">
          <PivotTable
            header={headerFields}
            data={selectedFlowers}
            type="ticket"
            handleAmount={handleAmount}
          />
          <p className="text-muted-foreground text-sm text-center">
            Ingresa las cantidades de las flores seleccionadas
          </p>
          <div className="flex justify-end">
            <Button
              className="h-12 w-36"
              type="button"
              onClick={() => setSearchParams({ step: "2" })}
            >
              Continuar
            </Button>
          </div>
        </div>
      ) : parseInt(step) === 2 && flowersFields.length > 0 ? (
        <div className="flex-1 px-5 pt-5 pb-10 overflow-y-auto">
          <FlowerNotebook flowers={flowersFields} type="ticket" />
          <p className="text-muted-foreground text-sm text-center">
            Resumen de la entrada.
          </p>
          <div>
            <div className="mt-5">
              <div className="flex justify-end">
                <Button
                  className="h-12 w-36"
                  type="button"
                  onClick={() => setSearchParams({ step: "3" })}
                >
                  Continuar
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : parseInt(step) === 3 && flowersFields.length > 0 ? (
        <div className="flex-1 px-5 pt-5 pb-10 overflow-y-auto">
          <Form className="space-y-4 flex items-center flex-col" method="POST">
            <p>Selecciona el estado del ticket</p>
            <input type="hidden" value="action_confirm" name="action" />
            <input
              type="hidden"
              value={JSON.stringify(flowersFields)}
              name="flowers"
            />
            <Select name="status_type" defaultValue="Pedido">
              <SelectTrigger className="w-64 bg-white h-12">
                <SelectValue placeholder="Seleccionar estado." />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="Pedido">Pedido</SelectItem>
                <SelectItem value="Entregado">Entregado</SelectItem>
              </SelectContent>
            </Select>
            <Button type="submit" className="h-12 w-36">
              Confirmar
            </Button>
            <p className="text-sm text-center text-muted-foreground">
              Pronto se añaderan nuevas funciones.
            </p>
          </Form>
        </div>
      ) : null}
    </div>
  );
}
