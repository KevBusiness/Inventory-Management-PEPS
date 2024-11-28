import type { Ticket, Flower } from "@prisma/client";
import { AnimatePresence, motion } from "framer-motion";
import React from "react";
import InputCustom from "./input";
import { cn, formatToMXN } from "~/lib/utils";
import { Form } from "@remix-run/react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

interface FlowerProps extends Flower {
  flowerCategory: {
    name: string;
  };
}

interface TicketProps extends Ticket {
  flowers: FlowerProps[];
}

type FetchData = TicketProps | null;

interface PivotTableProps {
  header: string[];
  data: Record<string, string | number>[] | FetchData;
  type: "sale" | "ticket";
  handleAmount?: (
    e: React.ChangeEvent<HTMLInputElement>,
    id: number,
    name: string,
    key: "fresh" | "whithered" | "price"
  ) => void;
  handleUpdateFlower?: (e: React.FormEvent<HTMLFormElement>) => void;
}

export default function PivotTable({
  header,
  data,
  type,
  handleUpdateFlower,
  handleAmount,
}: PivotTableProps) {
  return (
    <AnimatePresence>
      <motion.div
        className="rounded-lg overflow-hidden my-5 mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="bg-white px-2 pt-1 flex items-center justify-around text-md font-medium text-neutral-600 h-12 border-b hover:bg-neutral-200 transition">
          {header.map((item, index) => (
            <span key={index} className={cn(type === "sale" ? "w-60" : "w-56")}>
              {item}
            </span>
          ))}
        </div>
        {type === "sale" ? (
          <Form
            onSubmit={(e) => {
              e.preventDefault();
              handleUpdateFlower && handleUpdateFlower(e);
            }}
          >
            <AnimatePresence>
              {!Array.isArray(data)
                ? data?.flowers.map(
                    (
                      {
                        id,
                        wiltedQuantity,
                        wilted_sale,
                        freshQuantity,
                        fresh_sale,
                        flowerCategory: { name },
                        price,
                      },
                      index
                    ) => (
                      <motion.div
                        key={id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="bg-white hover:bg-neutral-50 flex items-center justify-around border-b py-2 px-2 hover:shadow-inner"
                      >
                        <div className="w-60">
                          <label
                            htmlFor={`flower-${id}-${
                              freshQuantity - fresh_sale
                            }-${name}-fresh-${price}`}
                            className="text-md text-neutral-900 font-semibold hover:cursor-pointer"
                          >
                            {name}
                          </label>
                        </div>
                        <div className="w-60 pl-10">
                          <p>{freshQuantity - fresh_sale}</p>
                        </div>
                        <div className="w-60 pl-16">
                          <p>{wiltedQuantity - wilted_sale}</p>
                        </div>
                        <div className="w-60">
                          <Input
                            id={`flower-${id}-${
                              freshQuantity - fresh_sale
                            }-${name}-fresh-${price}`}
                            name={`flower-${id}-${
                              freshQuantity - fresh_sale
                            }-${name}-fresh-${price}`}
                            className="w-36 h-10 font-light placeholder-shown:valid:border-neutral-200 focus:invalid:ring-red-500 focus:invalid:ring-1 invalid:border-red-500 focus:valid:ring-1 focus:valid:ring-blue-500 valid:border-blue-500"
                            placeholder={formatToMXN(0).toString()}
                            max={freshQuantity - fresh_sale}
                            min={0}
                            type="number"
                          />
                        </div>
                        <div className="w-60">
                          <Input
                            id={`flower-${id}-${
                              freshQuantity - fresh_sale
                            }-${name}-whithered-${price}`}
                            name={`flower-${id}-${
                              freshQuantity - fresh_sale
                            }-${name}-whithered-${price}`}
                            className="w-36 h-10 font-light placeholder-shown:valid:border-neutral-200 focus:invalid:ring-red-500 focus:invalid:ring-1 invalid:border-red-500 focus:valid:ring-1 focus:valid:ring-blue-500 valid:border-blue-500"
                            placeholder={formatToMXN(0).toString()}
                            max={wiltedQuantity - wilted_sale}
                            min={0}
                            type="number"
                          />
                        </div>
                      </motion.div>
                    )
                  )
                : null}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="flex justify-end mt-3"
              >
                <Button type="submit" className="h-10">
                  Continuar
                </Button>
              </motion.div>
            </AnimatePresence>
          </Form>
        ) : (
          <AnimatePresence>
            {Array.isArray(data) &&
              data.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="bg-white hover:bg-neutral-50 flex items-center justify-around border-b py-2 px-2 hover:shadow-inner"
                >
                  <div className="w-56">
                    <label
                      htmlFor={`flower-${item.id}`}
                      className="text-md text-neutral-900 font-semibold hover:cursor-pointer"
                    >
                      {item.name}
                    </label>
                  </div>
                  <InputCustom
                    color="blue"
                    name={`flower-${item.id}`}
                    id={`flower-${item.id}`}
                    type="number"
                    width="w-56"
                    placeholder="0"
                    onChange={(e) =>
                      handleAmount &&
                      handleAmount(
                        e,
                        item.id as number,
                        item.name as string,
                        "fresh"
                      )
                    }
                  />
                  <InputCustom
                    color="amber"
                    type="number"
                    width="w-56"
                    placeholder="0"
                    onChange={(e) =>
                      handleAmount &&
                      handleAmount(
                        e,
                        item.id as number,
                        item.name as string,
                        "whithered"
                      )
                    }
                  />
                  <InputCustom
                    color="green"
                    type="number"
                    width="w-56"
                    placeholder="0"
                    onChange={(e) =>
                      handleAmount &&
                      handleAmount(
                        e,
                        item.id as number,
                        item.name as string,
                        "price"
                      )
                    }
                  />
                </motion.div>
              ))}
          </AnimatePresence>
        )}
      </motion.div>
      ;
    </AnimatePresence>
  );
}
