import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import MainLayout from "~/layouts/main";
import { authenticator } from "~/services/auth.server";

export async function action({ request }: ActionFunctionArgs) {
  return null;
}

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/",
  });
  return { user: user! };
}

export default function ProcessTicket() {
  const data = useLoaderData<typeof loader>();
  return (
    <MainLayout user={data.user}>
      <p className="mt-2 text-sm px-5">
        Ingrese el numero de folio para procesar el ticket.
      </p>
      <div className="flex">
        <div className="w-1/2 px-5 space-y-4">
          <Form method="POST" className="space-y-2 w-fit mt-10">
            <label htmlFor="n_folio" className="font-semibold">
              Numero de folio:
            </label>
            <Input
              id="n_folio"
              placeholder="Ingrese el numero."
              type="text"
              minLength={10}
            />
            <Button
              type="submit"
              className="h-10 w-full bg-emerald-500 hover:bg-emerald-600"
            >
              Validar
            </Button>
          </Form>
          <p className="text-md">Instrucciones:</p>
          <ul className="list-disc list-inside mt-2 text-sm text-gray-600 dark:text-gray-400 space-y-2">
            <li>Asegurarse de ingresar el numero de folio correctamente.</li>
            <li>Validar los datos, respecto a los que muestra el ticket.</li>
            <li>Procesar los datos.</li>
          </ul>
        </div>
        <div className="w-1/2 pt-16">
          <p className="text-center font-semibold">
            No se encuentran existencias.
          </p>
          <img className="w-96 mx-auto h-96" src="/empty_boxes.jpg" />
        </div>
      </div>
    </MainLayout>
  );
}
