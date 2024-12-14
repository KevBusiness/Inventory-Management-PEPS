import { useEffect, useState } from "react";
import { MetaFunction, LoaderFunctionArgs, data } from "@remix-run/node";
import db from "~/database/prisma.server";
import { useLoaderData } from "@remix-run/react";
import { authenticator } from "~/services/auth.server";
import { commitSession, getSession } from "~/services/alerts.session.server";
import { useToast } from "~/hooks/use-toast";
import Layout from "~/layouts/main";
import SalesChart from "~/components/charts/sales_chart";
import FlowerChart from "~/components/charts/flower_chart";
import { getData } from "~/database/controller/dashboard.server";
import { Label } from "~/components/ui/label";
import { Switch } from "~/components/ui/switch";
import GeneralChart from "~/components/charts/general_chart";
import { motion } from "framer-motion";
import { MdOutlineMoveDown } from "react-icons/md";

export const meta: MetaFunction = () => {
  return [
    { title: "Dashboard | Inventory Management" },
    {
      name: "description",
      content: "Inventory management dashboard panel.",
    },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/",
  });
  const session = await getSession(request.headers.get("Cookie"));
  return data(
    { user: user!, message: session.get("success"), ...(await getData()) },
    { headers: { "Set-Cookie": await commitSession(session) } }
  );
}

export default function Dashboard() {
  const data = useLoaderData<typeof loader>();
  const [onlySales, setonlySales] = useState(false);
  const { toast } = useToast();
  useEffect(() => {
    if (data.message) {
      toast({ title: "Exito", description: data.message });
    }
  }, [data]);

  return (
    <Layout user={data.user}>
      <p className="mt-2 text-sm pl-5">
        Todo lo que necesitas en un solo lugar.
      </p>
      <div className="mx-5 my-5">
        <div className="flex items-center space-x-2">
          <Switch
            id="chart-mode"
            onCheckedChange={() => setonlySales(!onlySales)}
          />
          <Label htmlFor="chart-mode">Solo Ventas</Label>
        </div>
        <div className="mt-5 border-b pb-5">
          {onlySales ? (
            <>
              <p className="text-xl font-semibold">Grafica de ventas</p>
              <SalesChart sales={data.sales} />
            </>
          ) : (
            <>
              <p className="text-xl font-semibold">Ventas por ticket</p>
              <GeneralChart tickets={data.tickets} sales={data.sales} />
            </>
          )}
        </div>
        <div className="flex">
          <motion.div
            initial={{ opacity: 0 }} // Inicia invisible y desplazado hacia abajo
            whileInView={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }} // Duración de la animación
            className="w-1/2 h-[550px] mt-5 border bg-neutral-100 rounded-md p-2 overflow-hidden"
          >
            <p className="text-xl font-semibold mb-2">Distribucion de flores</p>
            <FlowerChart flowers={data.flowers} />
          </motion.div>
          <div className="w-1/2 mt-5 p-2">
            <h3 className="font-semibold text-xl">Actividad Reciente</h3>
            <div className="flex flex-col py-2 gap-y-2">
              <div className="h-24 p-2 border rounded-md flex flex-col justify-between gap-y-1">
                <div className="flex flex-1 gap-x-5 items-center text-blue-700">
                  <MdOutlineMoveDown size={20} />
                  <p className="text-xl">Ajuste de inventario</p>
                </div>
                <p className="text-xs">
                  Por: <span className="font-semibold">Marquis West</span>
                </p>
                <p className="text-xs">Fecha: Ajuste de inventario</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
