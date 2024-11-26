import { LoaderFunctionArgs } from "@remix-run/node";
import { Form, Link, Outlet, useNavigate } from "@remix-run/react";
import { Search } from "lucide-react";
import { BsBell } from "react-icons/bs";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Toaster } from "~/components/ui/toaster";
import { authenticator } from "~/services/auth.server";
import { IoHomeOutline } from "react-icons/io5";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticator.isAuthenticated(request, {
    failureRedirect: "/",
  });
  return null;
};

export default function New() {
  const navigate = useNavigate();
  return (
    <main className="bg-neutral-100 h-screen flex flex-col">
      <div className="flex items-center justify-between bg-white shadow-md py-2 px-5 z-10">
        <div className="flex items-center gap-x-2">
          <Button type="button" size={"icon"} asChild>
            <Link to={"/dashboard"}>
              <IoHomeOutline />
            </Link>
          </Button>
        </div>
        <div className="flex items-center gap-5">
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
      <Outlet />
      <Toaster />
    </main>
  );
}
