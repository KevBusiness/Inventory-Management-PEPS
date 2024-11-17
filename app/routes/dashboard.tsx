import type {
  MetaFunction,
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from "@remix-run/node";
import { authenticator } from "~/services/auth.server";
import { useLoaderData } from "@remix-run/react";

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
  return user!;
}

export default function Dashboard() {
  const data = useLoaderData<typeof loader>();
  return (
    <main className="px-5">
      <p>Todo lo que necesitas en un solo lugar.</p>
    </main>
  );
}
