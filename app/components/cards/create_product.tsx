import { useEffect, useState } from "react";
import { Form, useSubmit } from "@remix-run/react";
import { cn, formatToMXN } from "~/lib/utils";
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
import { Delete, Plus, X } from "lucide-react";

type Flower = {
  id: number;
  name: string;
  select: boolean;
};

interface CreateProductProps {
  flowers?: Flower[];
}

export default function CreateProduct({ flowers }: CreateProductProps) {
  const submit = useSubmit();
  const [flowersData, setFlowersData] = useState<Record<any, any>>({});
  const [flowersAmount, setFlowersAmount] = useState(1);

  if (!flowers?.length) {
    return "Para crear productos, se necesitan flores.";
  }

  const selectFlower = (field: number, type: string, value: any) => {
    setFlowersData((prevFlowersData) => ({
      ...prevFlowersData,
      [field]: {
        ...prevFlowersData[field],
        [type]: value,
      },
    }));
  };

  const sortedFlowers = flowers.map((flower) => {
    // Verificar si el id de la flor existe en previousData
    const existsInPreviousData = Object.values(flowersData).some(
      (item) => item.id === flower.id
    );

    // Agregar la propiedad select: true si existe, de lo contrario false
    return {
      ...flower,
      select: existsInPreviousData,
    };
  });
  return (
    <div>
      <Sheet
        onOpenChange={() => {
          setFlowersAmount(1);
          setFlowersData({});
        }}
      >
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
              const formData = new FormData(e.currentTarget);
              const flowers = JSON.stringify(Object.values(flowersData));
              formData.append("flowers", flowers);
              submit(formData, {
                method: "POST",
                encType: "multipart/form-data",
              });
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
            {Array.from({ length: flowersAmount }).map((_, i) => (
              <div key={i} className="space-y-4 border-b pb-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor={`flower-${i + 1}-id`}
                      className="after:content-['*'] after:ml-0.5 after:text-red-500"
                    >
                      Flor a utilizar | Flor {i + 1}
                    </Label>
                    {i > 0 && (
                      <X
                        size={18}
                        className="text-red-500 hover:cursor-pointer"
                      />
                    )}
                  </div>
                  <Select
                    name={`flower-${i + 1}-id`}
                    required
                    onValueChange={(value) => {
                      const [id, name] = value.split("-");
                      selectFlower(i, "id", +id);
                      selectFlower(i, "name", name);
                    }}
                  >
                    <SelectTrigger
                      className="w-full h-12"
                      id={`flower-${i + 1}-id`}
                    >
                      <SelectValue placeholder="Seleccione una flor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Flores</SelectLabel>
                        {sortedFlowers.map((flower) => (
                          <SelectItem
                            disabled={flower.select}
                            className="hover:bg-neutral-200/20"
                            value={`${flower.id.toString()}-${flower.name}`}
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
                    htmlFor={`flower-${i + 1}-amount`}
                    className="after:content-['*'] after:ml-0.5 after:text-red-500"
                  >
                    Cantidad usada | Flor {i + 1}
                  </Label>
                  <Input
                    type="number"
                    id={`flower-${i + 1}-amount`}
                    name={`flower-${i + 1}-amount`}
                    onChange={(e) => {
                      if (e.target.value === "") {
                        selectFlower(i, "amount", 1);
                      } else {
                        selectFlower(i, "amount", +e.target.value);
                      }
                    }}
                    placeholder="ej: 24"
                    className="h-12"
                    required
                  />
                </div>
              </div>
            ))}
            <Button
              type="button"
              onClick={(e) => {
                setFlowersAmount(flowersAmount + 1);
                e.stopPropagation();
              }}
              className="w-full h-12 bg-gradient-to-r from-purple-400 to-purple-600 hover:ring-1 hover:ring-purple-600 transition ease-in"
            >
              <Plus />
              Nueva flor
            </Button>
            <div className="space-y-1"></div>
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
