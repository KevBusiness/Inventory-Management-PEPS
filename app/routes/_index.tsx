import { useState } from "react";
import type { MetaFunction } from "@remix-run/node";
import { Form } from "@remix-run/react";
import { AlertCircle, Eye, EyeClosed } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

export const meta: MetaFunction = () => {
  return [
    { title: "Inventory Management" },
    {
      name: "description",
      content: "Inventory management for a flower shop",
    },
  ];
};

export default function Index() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative h-screen overflow-hidden">
      <div className="absolute top-0 p-4 flex gap-2 items-center">
        <img width="50" height="50" src="/icon.png" />
        <p className="text-white font-bold text-xl">
          Inventario Administrativo PEPS
        </p>
      </div>
      <video autoPlay loop muted>
        <source src="/tulipanes-bg-video.webm" type="video/webm" />
      </video>
      <div className="absolute top-28 right-28 bg-white w-96 h-[560px] rounded-md p-4 overflow-hidden shadow-2xl">
        <Form method="POST" className="h-full flex flex-col justify-between">
          <div>
            <h3 className="text-center font-bold text-2xl">Login</h3>
            <p className="text-center text-sm mt-2">
              Ingresa tus credenciales para acceder al portal.
            </p>
            <div className="space-y-4 my-4">
              <div className="space-y-2">
                <Label htmlFor="number_user">Numero de usuario:</Label>
                <Input
                  type="number"
                  name="number_user"
                  id="number_user"
                  placeholder="Ingrese su numero de usuario"
                  className="h-12 font-light placeholder-shown:invalid:border-neutral-200 focus:invalid:ring-red-500 focus:invalid:ring-1 invalid:border-red-500 focus:valid:ring-1 focus:valid:ring-blue-500 valid:border-blue-500"
                  required
                />
                {/* <Alert variant={"destructive"}>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>
                    El numero de usuario es incorrecto
                  </AlertDescription>
                </Alert> */}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password_user">contraseña:</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    name="password_user"
                    id="password_user"
                    placeholder="Ingrese su contraseña"
                    className="h-12 font-light pr-10 placeholder-shown:invalid:border-neutral-200 focus:invalid:ring-red-500 focus:invalid:ring-1 invalid:border-red-500 focus:valid:ring-1 focus:valid:ring-blue-500 valid:border-blue-500"
                    required
                  />
                  <div className="absolute top-4 right-3">
                    {!showPassword ? (
                      <EyeClosed
                        className="h-5 w-5 text-neutral-800 cursor-pointer"
                        onClick={() => setShowPassword(!showPassword)}
                      />
                    ) : (
                      <Eye
                        className="h-5 w-5 text-neutral-800 cursor-pointer"
                        onClick={() => setShowPassword(!showPassword)}
                      />
                    )}
                  </div>
                </div>
                {/* <Alert variant={"destructive"}>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>
                    El numero de usuario es incorrecto
                  </AlertDescription>
                </Alert> */}
              </div>
              <Button className="h-12 w-full">Iniciar sesion</Button>
            </div>
          </div>
          <p className="text-center">
            Problemas para iniciar sesion?
            <br />
            <a
              href="https://wa.me/1234567890"
              target="_blank"
              className="text-blue-500"
            >
              Comunicarse con soporte
            </a>
          </p>
        </Form>
      </div>
    </div>
  );
}
