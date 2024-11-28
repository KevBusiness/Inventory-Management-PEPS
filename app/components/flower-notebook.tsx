import React from "react";
import { Flower, Check, X } from "lucide-react";
import { formatToMXN } from "~/lib/utils";
import { UpdatedFlowers } from "~/lib/types";

interface FlowerDetails {
  flowerCategoryId: number;
  name: string;
  freshQuantity: number;
  wiltedQuantity: number;
  price: number;
}

interface NotebookProps {
  flowers: FlowerDetails[] | UpdatedFlowers[];
  type: "ticket" | "sale";
}

const FlowerEntry: React.FC<FlowerDetails> = ({
  name,
  freshQuantity,
  wiltedQuantity,
  price,
}) => (
  <div className="mb-6 flex items-center">
    <Flower className="mr-2 h-5 w-5 text-pink-500" />
    <span className="flex-1">{name}</span>
    <span className="flex-1 text-center">{freshQuantity}</span>
    <span className="flex-1 text-center">{wiltedQuantity}</span>
    <span className="flex-1 text-right">{formatToMXN(price)}</span>
  </div>
);

const FlowerEntrySale: React.FC<UpdatedFlowers> = ({
  name,
  currentAmount,
  type,
  price,
  value,
}) => (
  <div className="mb-6 flex items-center">
    <Flower className="mr-2 h-5 w-5 text-pink-500" />
    <span className="flex-1">{name}</span>
    <span className="flex-1 text-center">
      {type === "fresh" ? "Frescas" : "Marchitas"}
    </span>
    <span className="flex-1 text-center">{value}</span>
    <span className="flex-1 text-right">{formatToMXN(value * price)}</span>
    <span className="flex-1 flex justify-center">
      {currentAmount - value === 0 ? <Check /> : <X />}
    </span>
  </div>
);

export default function FlowerNotebook({ flowers, type }: NotebookProps) {
  return (
    <div className="flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-[800px] bg-white p-8 rounded-lg shadow-lg transform rotate-1 overflow-hidden relative">
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,transparent_calc(100%_-_1px),#94a3b8_calc(100%_-_1px))] bg-[length:100%_1.5rem]" />
        <div className="relative">
          <h1
            className="text-3xl font-bold mb-8 text-center font-handwriting text-blue-800"
            style={{ lineHeight: "1.5rem", paddingTop: "0.75rem" }}
          >
            {type === "ticket" ? "Resumen de entrada" : "Resumen de Venta"}
          </h1>
          <div
            className="mb-6 font-semibold flex font-handwriting text-lg"
            style={{ lineHeight: "1.5rem" }}
          >
            {type === "ticket" ? (
              <>
                <span className="flex-1">Nombre</span>
                <span className="flex-1 text-center">Frescas</span>
                <span className="flex-1 text-center">Marchitas</span>
                <span className="flex-1 text-right">Precio</span>
              </>
            ) : (
              <>
                <span className="flex-1">Nombre</span>
                <span className="flex-1 text-center">Calidad</span>
                <span className="flex-1 text-center">Unidades vendidas</span>
                <span className="flex-1 text-right">Total</span>
                <span className="flex-1 text-right">Liquidando</span>
              </>
            )}
          </div>
          {flowers.map((flower, index) => (
            <div key={index} style={{ lineHeight: "1.5rem" }}>
              {type === "ticket" ? (
                <FlowerEntry {...(flower as FlowerDetails)} />
              ) : (
                <FlowerEntrySale {...(flower as UpdatedFlowers)} />
              )}
            </div>
          ))}
          <div className="flex justify-end" style={{ lineHeight: "1.5rem" }}>
            <p>
              Total:{" "}
              <span className="underline underline-offset-8">
                {formatToMXN(
                  flowers.reduce(
                    (acc, flower) =>
                      acc +
                      (type === "ticket"
                        ? ((flower as FlowerDetails).freshQuantity +
                            (flower as FlowerDetails).wiltedQuantity) *
                          (flower as FlowerDetails).price
                        : (flower as UpdatedFlowers).value *
                          (flower as UpdatedFlowers).price),
                    0
                  )
                )}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
