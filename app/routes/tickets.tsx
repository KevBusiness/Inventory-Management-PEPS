import { LoaderFunctionArgs } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { authenticator } from "~/services/auth.server";
import MainLayout from "~/layouts/main";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/",
  });

  return user!;
}

export default function Tickets() {
  const data = useLoaderData<typeof loader>();
  return (
    <MainLayout user={data}>
      <main className="px-5">
        <Outlet />
      </main>
    </MainLayout>
  );
}
