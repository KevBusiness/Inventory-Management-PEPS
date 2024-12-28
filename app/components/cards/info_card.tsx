import { AnimatePresence, motion } from "framer-motion";
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

interface InfoCardProps {
  index: number;
  mode: "sales" | "inventory";
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

const data = [
  {
    name: "Page A",
    uv: 4000,
    pv: 2400,
    amt: 2400,
  },
  {
    name: "Page B",
    uv: 3000,
    pv: 1398,
    amt: 2210,
  },
  {
    name: "Page C",
    uv: 2000,
    pv: 9800,
    amt: 2290,
  },
  {
    name: "Page D",
    uv: 2780,
    pv: 3908,
    amt: 2000,
  },
  {
    name: "Page E",
    uv: 1890,
    pv: 4800,
    amt: 2181,
  },
  {
    name: "Page F",
    uv: 2390,
    pv: 3800,
    amt: 2500,
  },
  {
    name: "Page G",
    uv: 3490,
    pv: 4300,
    amt: 2100,
  },
];

const InfoCard = ({ index, mode }: InfoCardProps) => {
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
          <h1 className="text-sm font-semibold">{CardNames[mode][index]}</h1>
          {mode === "inventory" && index === 2 ? (
            <span className="text-lg text-green-500 font-semibold">%10</span>
          ) : mode === "sales" ? (
            <span className="text-lg text-green-500 font-semibold">%10</span>
          ) : null}
        </div>
        <ResponsiveContainer width="100%" height="90%">
          {mode === "inventory" && index > 0 ? (
            <BarChart width={300} height={100} data={data} syncId={"inventory"}>
              <Tooltip />
              <Legend />
              <Bar dataKey="pv" fill="#8884d8" />
              {index === 2 && <Bar dataKey="uv" fill="#82ca9d" />}
            </BarChart>
          ) : (
            <LineChart width={300} height={100} data={data}>
              {/* <Tooltip /> */}
              <Line
                type="monotone"
                dataKey="pv"
                stroke="#8884d8"
                strokeWidth={1}
                dot={false}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </motion.div>
    </AnimatePresence>
  );
};

export default InfoCard;
