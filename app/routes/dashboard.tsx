import { useEffect } from "react";
import {
  MetaFunction,
  ActionFunctionArgs,
  LoaderFunctionArgs,
  data,
} from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { authenticator } from "~/services/auth.server";
import { commitSession, getSession } from "~/services/alerts.session.server";
import { useToast } from "~/hooks/use-toast";
import Layout from "~/layouts/main";
import SimpleLineChart from "~/components/simpleLineChart";

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
    { user: user!, message: session.get("success") },
    { headers: { "Set-Cookie": await commitSession(session) } }
  );
}

export default function Dashboard() {
  const data = useLoaderData<typeof loader>();
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
      <div className="mx-5 h-96 mt-7">
        <SimpleLineChart />
      </div>
    </Layout>
  );
}
