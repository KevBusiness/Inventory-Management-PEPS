import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  Tooltip,
  Rectangle,
  Legend,
  YAxis,
} from "recharts";
import { formatToMXN } from "~/lib/utils";

interface InfoCardProps {
  index: number;
  mode: "sales" | "inventory";
  data: {
    mode: string;
    data: any[];
  }[];
  ticket: number | null;
}

const CardNames = {
  sales: [
    "Ventas Totales",
    "Ventas en Flores Individuales",
    "Ventas en Arreglos",
  ],
  inventory: [
    "Volumen de inventario",
    "Filtrado por ticket",
    "Comparado con venta",
  ],
};

const InfoCard = ({ index, mode, data, ticket }: InfoCardProps) => {
  if (!data || !data.length) return null;
  const [barData, setBarData] = useState(null);
  useEffect(() => {
    if (mode === "inventory" && index > 0 && ticket) {
      const sortedData = data
        .map((item) => ({
          date: item.date,
          total: item.data
            .filter((x) => x.id === ticket)
            .reduce((acc, x) => acc + x.total, 0),
        }))
        .filter((y) => y.total > 0);
      setBarData(sortedData);
    }
  }, [data, mode, ticket]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.5, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.5, y: 50 }}
        transition={{ duration: 0.3, delay: index * 0.2 }}
        className="h-56 bg-gradient-to-br from-neutral-50/20 to-neutral-100/50 border rounded-md p-2 shadow-md overflow-hidden"
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-x-2">
            <h1 className="text-sm font-semibold">{CardNames[mode][index]}</h1>
            <span className="text-sm font-semibold">
              {barData
                ? formatToMXN(barData.reduce((acc, x: any) => acc + x.total, 0))
                : formatToMXN(data.reduce((acc, x: any) => acc + x.total, 0))}
            </span>
          </div>
          {mode === "inventory" && index === 2 ? (
            <span className="text-lg text-green-500 font-semibold">%10</span>
          ) : mode === "sales" ? (
            <>
              <span className="text-lg text-green-500 font-semibold">%10</span>
            </>
          ) : null}
        </div>
        <ResponsiveContainer width="100%" height="90%">
          {mode === "inventory" && index > 0 ? (
            <BarChart
              width={300}
              height={100}
              data={barData}
              syncId={"inventory"}
            >
              <Tooltip />
              <Legend />
              <Bar dataKey="total" fill="#8884d8" />
              {index === 2 && <Bar dataKey="total" fill="#82ca9d" />}
            </BarChart>
          ) : (
            <LineChart width={300} height={100} data={data}>
              <Tooltip />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#8884d8"
                strokeWidth={1}
                dot
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </motion.div>
    </AnimatePresence>
  );
};

export default InfoCard;
