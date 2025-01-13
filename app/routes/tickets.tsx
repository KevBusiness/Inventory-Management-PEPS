import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { authenticator } from "~/services/auth.server";
import MainLayout from "~/layouts/main";
import {
  getNotifications,
  readNotifications,
} from "~/controllers/notifications.server";

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

export async function loader({ request }: LoaderFunctionArgs) {
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
}

export default function Tickets() {
  const data = useLoaderData<typeof loader>();
  return (
    <MainLayout user={data?.user!} notifications={data?.notifications}>
      <div className="px-5">
        <Outlet />
      </div>
    </MainLayout>
  );
}
