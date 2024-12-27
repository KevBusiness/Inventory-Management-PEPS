import { useState } from "react";
import { Form, useSubmit } from "@remix-run/react";
import { formatToMXN } from "~/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { CiSquarePlus } from "react-icons/ci";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";

type Flower = {
  id: number;
  name: string;
};

interface CreateProductProps {
  flowers?: Flower[];
}

export default function CreateProduct({ flowers }: CreateProductProps) {
  const submit = useSubmit();
  const [flowersAmount, setFlowersAmount] = useState(1);
  return (
    <div>
      <Sheet>
        <SheetTrigger asChild>
          <button
            type="button"
            className="hover:cursor-pointer w-44 h-12 p-2 text-sm text-white bg-gradient-to-r from-purple-500 to-purple-600 border-2 border-purple-300 ring-2 ring-purple-500/20 hover:shadow-lg transition-all duration-150 ease-out rounded-md flex items-center justify-center gap-x-2"
          >
            <CiSquarePlus size={28} />
            Nuevo producto
          </button>
        </SheetTrigger>
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Nuevo producto</SheetTitle>
            <SheetDescription>
              Crea productos para agilizar las ventas.
            </SheetDescription>
          </SheetHeader>
          <Form
            className="py-2 border-t mt-2 space-y-4"
            method="post"
            encType="multipart/form-data"
            onSubmit={(e) => {
              e.preventDefault();
              submit(e.currentTarget);
              e.currentTarget.reset();
            }}
          >
            <div className="space-y-1">
              <Label
                htmlFor="product_name"
                className="after:content-['*'] after:ml-0.5 after:text-red-500"
              >
                Nombre
              </Label>
              <Input
                type="text"
                id="product_name"
                name="product_name"
                placeholder="ej: Ramo de 24 Rosas"
                className="h-12"
                required
              />
            </div>
            <div className="space-y-1">
              <Label
                htmlFor="product_price"
                className="after:content-['*'] after:ml-0.5 after:text-red-500"
              >
                Precio
              </Label>
              <Input
                type="number"
                id="product_price"
                name="product_price"
                placeholder={`ej: ${formatToMXN(600)}`}
                className="h-12"
                required
              />
            </div>
            <div className="space-y-1">
              <Label
                htmlFor="flowers_amount"
                className="after:content-['*'] after:ml-0.5 after:text-red-500"
              >
                Cantidad de flores
              </Label>
              <Input
                type="number"
                id="flowers_amount"
                className="h-12"
                min={1}
                defaultValue={1}
                onChange={(e) => {
                  if (e.target.value === "") {
                    setFlowersAmount(1);
                  } else {
                    setFlowersAmount(parseInt(e.target.value));
                  }
                }}
                required
              />
            </div>
            {new Array(flowersAmount).fill(0).map((_, index) => (
              <div key={index} className="space-y-4 border-b pb-4">
                <div className="space-y-1">
                  <Label
                    htmlFor={`flower-${index + 1}`}
                    className="after:content-['*'] after:ml-0.5 after:text-red-500"
                  >
                    Flor a utilizar | Flor {index + 1}
                  </Label>
                  <Select name={`flower-${index + 1}`} required>
                    <SelectTrigger
                      className="w-full h-12"
                      id={`flower-${index + 1}`}
                    >
                      <SelectValue placeholder="ej: Rosas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Flores</SelectLabel>
                        {flowers &&
                          flowers.map((flower) => (
                            <SelectItem
                              className="hover:bg-neutral-200/20"
                              value={flower.id.toString()}
                              key={flower.id}
                            >
                              {flower.name}
                            </SelectItem>
                          ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label
                    htmlFor={`flower-${index + 1}_amount`}
                    className="after:content-['*'] after:ml-0.5 after:text-red-500"
                  >
                    Cantidad usada | Flor {index + 1}
                  </Label>
                  <Input
                    type="number"
                    id={`flower-${index + 1}_amount`}
                    name={`flower-${index + 1}_amount`}
                    placeholder="ej: 24"
                    className="h-12"
                    required
                  />
                </div>
              </div>
            ))}
            <div className="space-y-1">
              <Label
                htmlFor="product_picture"
                className="after:content-['*'] after:ml-0.5 after:text-red-500"
              >
                Imagen del producto
              </Label>
              <Input
                type="file"
                id="product_picture"
                name="product_picture"
                className="h-12"
                required
              />
            </div>
            <input type="hidden" value={"create_product"} name="action_type" />
            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-blue-400 to-blue-600"
            >
              Crear producto
            </Button>
          </Form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
