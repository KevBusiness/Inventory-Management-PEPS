import { useEffect, useState } from "react";
import type {
  LoaderFunctionArgs,
  ActionFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import {
  unstable_createMemoryUploadHandler,
  unstable_parseMultipartFormData,
  unstable_createFileUploadHandler,
  unstable_composeUploadHandlers,
} from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { authenticator } from "~/services/auth.server";
import db from "~/database/prisma.server";
import { Product } from "@prisma/client";
import { AnimatePresence, motion } from "framer-motion";
import { cn, formatToMXN } from "~/lib/utils";
import { CiSquarePlus, CiSquareCheck } from "react-icons/ci";
import { MdDelete, MdOutlineCancelPresentation } from "react-icons/md";
import { FaCashRegister } from "react-icons/fa";
import MainLayout from "~/layouts/main";
import CreateProduct from "~/components/cards/create_product";
import { Input } from "~/components/ui/input";

export const meta: MetaFunction = () => {
  return [
    { title: "Punto de venta | Inventory Management" },
    {
      name: "description",
      content: "point of sale of the inventory management system",
    },
  ];
};

export const action = async ({ request }: ActionFunctionArgs) => {
  let formData = await unstable_parseMultipartFormData(
    request,
    unstable_composeUploadHandlers(
      unstable_createFileUploadHandler({
        // Limit file upload to images
        filter({ contentType }) {
          return contentType.includes("image");
        },
        // Store the images in the public/img folder
        directory: "./public/uploads",
        // By default, `unstable_createFileUploadHandler` adds a number to the file
        // names if there's another with the same name; by disabling it, we replace
        // the old file
        avoidFileConflicts: false,
        // Use the actual filename as the final filename
        file({ filename }) {
          return filename;
        },
        // Limit the max size to 10MB
        maxPartSize: 10 * 1024 * 1024,
      }),
      unstable_createMemoryUploadHandler()
    )
  );
  switch (formData.get("action_type")) {
    case "create_product":
      const { product_name, product_price, product_flower, product_amount } =
        Object.fromEntries(formData);
      const product_picture = formData.get("product_picture") as File;
      const name_picture = product_picture?.name;
      try {
        await db.product.create({
          data: {
            name: product_name as string,
            price: Number(product_price),
            quantity: Number(product_amount),
            picture: name_picture as string,
            to_use: Number(product_flower),
          },
        });
      } catch (error) {
        console.log(error);
        return null;
      }
      break;
    default:
      break;
  }
  return null;
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    const user = await authenticator.isAuthenticated(request, {
      failureRedirect: "/",
    });
    const [flowers, products] = await db.$transaction([
      db.flowerBox.findMany({
        select: {
          id: true,
          name: true,
        },
      }),
      db.product.findMany(),
    ]);
    const sortedProductsData = products.map((product) => ({
      ...product,
      select: false,
      amount: 0,
    }));
    return { user, flowers, products: sortedProductsData };
  } catch (error) {
    return null;
  }
};

interface ProductItemProps extends Product {
  select: boolean;
  amount: number;
}

export default function Pos() {
  const data = useLoaderData<typeof loader>();
  const [sortedProductsData, setSortedProductsData] = useState<
    ProductItemProps[]
  >(data?.products || []);

  const handleAddItem = (id: number) => {
    setSortedProductsData((prev) =>
      prev.map((product) =>
        product.id === id
          ? { ...product, select: !product.select, amount: 1 }
          : product
      )
    );
  };

  const handleAmountItem = (id: number, amount: number) => {
    setSortedProductsData((prev) =>
      prev.map((product) =>
        product.id === id ? { ...product, amount } : product
      )
    );
  };

  const handleDeleteItem = (id: number) => {
    setSortedProductsData((prev) =>
      prev.map((product) =>
        product.id === id ? { ...product, select: false, amount: 0 } : product
      )
    );
  };

  const handleResetCart = () => {
    setSortedProductsData((prev) =>
      prev.map((product) => ({ ...product, select: false, amount: 0 }))
    );
  };

  return (
    <MainLayout user={data?.user}>
      <p className="mt-2 text-sm pl-5">Punto de venta.</p>
      <div className="mt-2 px-5 w-full flex gap-x-3">
        <div className="w-1/2 h-[620px] max-h-[620px border-r pt-2">
          <div className="flex items-center w-full">
            <CreateProduct flowers={data?.flowers} />
          </div>
          <hr className="my-2" />
          {sortedProductsData?.length ? (
            <div className="w-full h-[550px] max-h-[550px] overflow-y-auto grid grid-cols-2 gap-y-10 py-5">
              {sortedProductsData.map((product, index) => (
                <ProductItem
                  item={product}
                  index={index}
                  key={index}
                  handleAddItem={handleAddItem}
                />
              ))}
            </div>
          ) : (
            <div className="h-[550px] max-h-[550px] flex flex-col justify-center items-center gap-y-2">
              <p className="text-center text-lg font-semibold">
                No hay productos registrados
              </p>
            </div>
          )}
        </div>
        <div className="w-1/2 h-[620px] max-h-[620px] pt-2 flex flex-col justify-between">
          <div className="h-[480px] w-full flex flex-col justify-between">
            <div className="flex-1">
              <table className="table-fixed w-full">
                <thead className="border-b">
                  <tr>
                    <th>Referencia</th>
                    <th>Producto</th>
                    <th>Cantidad</th>
                    <th>Precio</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                {sortedProductsData.filter((product) => product.select)
                  .length ? (
                  <tbody>
                    {sortedProductsData
                      .filter((product) => product.select)
                      .map((product) => (
                        <tr
                          key={product.id}
                          className="odd:bg-white even:bg-slate-50"
                        >
                          <td className="flex items-center gap-x-5 pt-3">
                            <MdOutlineCancelPresentation
                              size={20}
                              className="text-red-500 cursor-pointer"
                              onClick={() => handleDeleteItem(product.id)}
                            />
                            <img
                              src={`/uploads/${product.picture}`}
                              className="w-10 h-10 rounded-md"
                            />
                          </td>
                          <td className="text-center text-sm">
                            {product.name}
                          </td>
                          <td className="flex justify-center pb-3">
                            <Input
                              type="number"
                              min={1}
                              className="w-14 m-0 text-center"
                              onChange={(e) => {
                                if (e.target.value === "") {
                                  handleAmountItem(product.id, 1);
                                } else {
                                  handleAmountItem(
                                    product.id,
                                    parseInt(e.target.value)
                                  );
                                }
                              }}
                              defaultValue={product.amount}
                            />
                          </td>
                          <td className="text-center text-sm">
                            {formatToMXN(product.price!)}
                          </td>
                          <td className="text-center text-sm font-semibold">
                            {formatToMXN(product.price! * product.amount)}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                ) : null}
              </table>

              {!sortedProductsData.filter((product) => product.select)
                .length && (
                <p className="text-muted-foreground text-center mt-10">
                  No hay productos en la venta actual.
                </p>
              )}
            </div>
            <div className="border-t h-fit py-2">
              <p className="font-semibold text-lg">
                Total:{" "}
                {formatToMXN(
                  sortedProductsData
                    .filter((product) => product.select)
                    .reduce(
                      (acc, product) => acc + product.amount * product.price!,
                      0
                    )
                )}
              </p>
            </div>
          </div>
          <div className="border-t flex items-center justify-between w-full flex-1">
            <button
              type="button"
              onClick={() => handleResetCart()}
              className="hover:cursor-pointer w-44 h-12 p-2 text-sm text-white bg-red-500 hover:shadow-lg transition-all duration-150 ease-out rounded-md flex items-center justify-center gap-x-2"
            >
              <MdDelete size={28} />
              Limpiar venta
            </button>
            <button
              type="button"
              className="hover:cursor-pointer w-44 h-12 p-2 text-sm text-white bg-gradient-to-r from-green-500 to-green-600 border-2 border-green-300 ring-2 ring-green-500/20 hover:shadow-lg transition-all duration-150 ease-out rounded-md flex items-center justify-center gap-x-2"
            >
              <FaCashRegister size={25} />
              Procesar venta
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

const ProductItem = ({
  item,
  index,
  handleAddItem,
}: {
  item: ProductItemProps;
  index: number;
  handleAddItem: (id: number) => void;
}) => {
  return (
    <AnimatePresence>
      <motion.div
        key={item.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3, delay: index * 0.1 }}
        className={cn(
          item.select,
          "w-[220px] max-[220px] h-72 border bg-neutral-200/30 rounded-md shadow-lg group relative"
        )}
        onClick={(e) => {
          handleAddItem(item.id);
          e.stopPropagation();
        }}
      >
        <div>
          <div className="w-full h-[210px] max-h-[210px] min-h-[200px] bg-gradient-to-b from-red-300 to-red-500 flex justify-center items-center">
            <img src={`/uploads/${item.picture}`} className="w-full h-full" />
          </div>
          <div className="px-2 pt-2">
            <p className="text-sm font-bold line-clamp-2">{item.name}</p>
            <p className="text-sm">
              precio:{" "}
              <span className="font-semibold text-red-500">
                {formatToMXN(item.price ? item.price : 0)}
              </span>
            </p>
          </div>
        </div>
        <div
          className={cn(
            item.select
              ? "h-full"
              : "h-0 opacity-0 group-hover:opacity-100 group-hover:h-full",
            "w-full transition-all ease-out duration-300 absolute bottom-0 bg-white/30 flex flex-col justify-center items-center hover:cursor-pointer"
          )}
        >
          <span className="text-2xl text-white font-black">
            {item.select ? "Agregado" : "Agregar"}
          </span>
          {item.select ? (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1.3 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.2 }}
              >
                <CiSquareCheck size={30} className="text-white" />
              </motion.div>
            </AnimatePresence>
          ) : (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.2 }}
              >
                <CiSquarePlus size={30} className="text-white" />
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
