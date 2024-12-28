import { useState } from "react";
import { MetaFunction, LoaderFunctionArgs, data } from "@remix-run/node";
import { useLoaderData, useNavigation } from "@remix-run/react";
import { authenticator } from "~/services/auth.server";
import { commitSession, getSession } from "~/services/alerts.session.server";
import { useToast } from "~/hooks/use-toast";
import Layout from "~/layouts/main";
import FlowerChart from "~/components/charts/flower_chart";
import { getData } from "~/database/controller/dashboard.server";
import DatePickerWithRange from "~/components/date-with-range";
import InfoCard from "~/components/cards/info_card";
import ActivityCard from "~/components/cards/activity_card";
import { Switch } from "~/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { AnimatePresence, motion } from "framer-motion";
import { DateRange } from "react-day-picker";

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
  const [showInventory, setShowInventory] = useState(false);
  const [date, setDate] = useState<DateRange | undefined>(undefined);

  return (
    <Layout user={data.user}>
      <div className="mt-5 mx-5 flex items-center gap-x-5">
        <DatePickerWithRange date={date} handleDate={setDate} />
        <div className="flex items-center gap-x-2">
          <Switch
            aria-description="show inventory charts"
            id="mode-inventory"
            checked={showInventory}
            onCheckedChange={() => setShowInventory(!showInventory)}
          />
          <label htmlFor="mode-inventory">Ver Inventario</label>
        </div>
        {showInventory && (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
            >
              <Select>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Seleccione un ticket" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Fruits</SelectLabel>
                    <SelectItem value="apple">Apple</SelectItem>
                    <SelectItem value="banana">Banana</SelectItem>
                    <SelectItem value="blueberry">Blueberry</SelectItem>
                    <SelectItem value="grapes">Grapes</SelectItem>
                    <SelectItem value="pineapple">Pineapple</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
      <div className="mx-5 my-5 grid grid-cols-3 gap-x-5">
        {Array.from({ length: 3 }).map((_, i) => (
          <InfoCard
            index={i}
            key={i}
            mode={showInventory ? "inventory" : "sales"}
          />
        ))}
      </div>
      <section className="mx-5 grid grid-cols-2 gap-x-5">
        <div className="p-2 h-[550px] overflow-y-auto space-y-5">
          <p>Actividad Reciente</p>
          {Array.from({ length: 4 }).map((_, i) => (
            <ActivityCard key={i} index={i} />
          ))}
        </div>
        <div className="p-2 h-[550px]">
          <FlowerChart flowers={data.flowers} />
        </div>
      </section>
      <footer>
        <p className="text-center text-muted-foreground">
          Plataforma administradora modo: PRUEBA
        </p>
      </footer>
    </Layout>
  );
}
