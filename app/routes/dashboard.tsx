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
      <div className="mx-5 my-5 flex justify-between items-center gap-10">
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <Switch
              id="chart-mode"
              onCheckedChange={() => setonlySales(!onlySales)}
            />
            <Label htmlFor="chart-mode">Solo Ventas</Label>
          </div>
          <div className="h-96 mt-5">
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
        </div>
        <div className="h-96 w-96">
          <p className="text-xl font-semibold">Distribucion de flores</p>
          <FlowerChart flowers={data.flowers} />
        </div>
      </div>
    </Layout>
  );
}
