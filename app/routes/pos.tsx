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
import { useActionData, useLoaderData, useSubmit } from "@remix-run/react";
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
import { createSale } from "~/controllers/pos.server";
import { toast } from "~/hooks/use-toast";
import {
  getNotifications,
  readNotifications,
} from "~/controllers/notifications.server";

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
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/",
  });
  const enctype = request.headers.get("Content-Type")?.split(";")[0];
  let formData;
  switch (enctype) {
    case "multipart/form-data":
      formData = await unstable_parseMultipartFormData(
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
      const { product_name, product_price, flowers } =
        Object.fromEntries(formData);
      const product_picture = formData.get("product_picture") as File;
      const name_picture = product_picture?.name;
      try {
        await db.product.create({
          data: {
            name: product_name as string,
            price: +product_price,
            flowers: flowers as string,
            picture: name_picture as string,
          },
        });
        return null;
      } catch (error) {
        console.log(error);
        return null;
      }
      break;
    case "application/x-www-form-urlencoded":
      formData = await request.formData();
      const ref = formData.get("ref") as string;
      if (ref) {
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
      }
      const data = JSON.parse(formData.get("data") as string);
      const resumen = await createSale(data, user!);
      return resumen;
      break;
    default:
      break;
  }
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/",
  });
  try {
    const [flowers, products, notifications] = await Promise.all([
      db.flowerBox.findMany({
        select: {
          id: true,
          name: true,
        },
      }),
      db.product.findMany(),
      getNotifications(),
    ]);
    const sortedProductsData = products.map((product) => ({
      ...product,
      select: false,
      amount: 0,
    }));
    const sortedFlowers = flowers.map((flower) => ({
      ...flower,
      select: false,
    }));
    return {
      user,
      flowers: sortedFlowers,
      products: sortedProductsData,
      notifications,
    };
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
  const actionData = useActionData<typeof action>();
  const submit = useSubmit();
  const [sortedProductsData, setSortedProductsData] = useState<
    ProductItemProps[]
  >(data?.products || []);

  useEffect(() => {
    if (sortedProductsData.length !== data?.products.length) {
      setSortedProductsData(data?.products || []);
    }
    if (actionData && actionData.length) {
      printData(actionData);
      setSortedProductsData(data?.products || []);
      toast({
        title: "Venta realizada!",
        description: "La venta se realizo correctamente",
      });
    }
  }, [data?.products, actionData]);

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

  const handleSubmit = () => {
    const selectItems = sortedProductsData.filter((item) => item.select);
    const formData = new FormData();
    formData.append("data", JSON.stringify(selectItems));
    formData.append("action_type", "create_sale");
    submit(formData, { method: "POST" });
  };

  return (
    <MainLayout user={data?.user} notifications={data?.notifications}>
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
          <div className="h-[480px] max-h-[480px] w-full flex flex-col justify-between">
            <div className="h-full overflow-y-auto">
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
              onClick={handleResetCart}
              className="hover:cursor-pointer w-44 h-12 p-2 text-sm text-white bg-red-500 hover:shadow-lg transition-all duration-150 ease-out rounded-md flex items-center justify-center gap-x-2"
            >
              <MdDelete size={28} />
              Limpiar venta
            </button>
            <button
              type="button"
              onClick={handleSubmit}
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

const printData = (data: any[]) => {
  // Verificar si hay datos
  if (!data || data.length === 0) {
    alert("No hay datos disponibles para imprimir.");
    return;
  }

  // Crear una nueva ventana para imprimir
  const ventana = window.open("", "", "width=800,height=600");

  // Crear el contenido HTML para la impresión
  const contenidoHTML = `
      <html>
        <head>
          <title>Imprimir Datos</title>
          <style>
            /* Resetear márgenes y bordes */
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }

            body {
              font-family: 'Roboto', sans-serif;
              background-color: #f7f7f7;
              color: #333;
              line-height: 1.6;
            }

            h1 {
              text-align: center;
              margin-bottom: 20px;
              font-size: 24px;
              color: #333;
            }

            /* Estilo para la tabla */
            table {
              width: 90%;
              margin: 0 auto;
              border-radius: 8px;
              border-collapse: collapse;
              background-color: #fff;
              box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            }

            th, td {
              padding: 12px 15px;
              text-align: left;
              font-size: 16px;
            }

            th {
              background-color: #4CAF50;
              color: #fff;
              font-weight: bold;
              text-transform: uppercase;
              border-bottom: 2px solid #ddd;
            }

            td {
              background-color: #f9f9f9;
              border-bottom: 1px solid #ddd;
            }

            /* Efecto hover en las filas de la tabla */
            tr:nth-child(even) td {
              background-color: #f2f2f2;
            }

            tr:hover td {
              background-color: #e8f7e7;
            }

            /* Detalles visuales */
            .table-container {
              padding: 20px;
              text-align: left;
            }

            /* Diseño responsivo */
            @media print {
              body {
                background-color: #fff;
              }

              .table-container {
                padding: 0;
                text-align: left;
              }

              h1 {
                font-size: 28px;
                margin-bottom: 10px;
              }

              table {
                width: 100%;
                box-shadow: none;
                margin: 0;
              }

              th, td {
                font-size: 14px;
                padding: 10px 12px;
              }
            }

            /* Estilo de la cabecera de la tabla cuando se imprime */
            @media print {
              th {
                background-color: #333;
                color: #fff;
              }
            }
          </style>
        </head>
        <body>
          <div class="table-container">
            <h1>Datos a Imprimir</h1>
            <table>
              <thead>
                <tr>
                  <th>Lote ID</th>
                  <th>Nombre</th>
                  <th>Cantidad usada</th>
                  <th>Referencia</th>
                  <th>Vendidos</th>
                </tr>
              </thead>
              <tbody>
                ${data
                  .map(
                    (item) => `
                      <tr>
                        <td>${item.loteId}</td>
                        <td>${item.name}</td>
                        <td>${item.amount}</td>
                        <td>${item.product}</td>
                        <td>${item.sellAmount}</td>
                      </tr>`
                  )
                  .join("")}
              </tbody>
            </table>
          </div>
        </body>
      </html>
    `;

  // Escribir el contenido en la nueva ventana
  ventana?.document.write(contenidoHTML);
  ventana?.document.close();

  // Abrir el cuadro de impresión y luego cerrar la ventana
  ventana?.print();
  ventana?.close();
};
