import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

interface Flower {
  name: string;
  currentFresh: number;
  currentWilted: number;
}

interface FlowerChartProps {
  flowers: Flower[] | undefined;
}

const FlowerChart: React.FC<FlowerChartProps> = ({ flowers }) => {
  if (!flowers) return "Ups, algo salió mal.";

  const filteredData = flowers.filter((item) => item.currentFresh > 0);
  // Generar colores únicos para cada flor
  const COLORS = [
    "#D1A1D5", // Lavanda suave
    "#4ECDC4", // Verde menta
    "#F8B400", // Amarillo mostaza
    "#FF6B6B", // Coral
    "#1B3B6F", // Azul oscuro
    "#F7A072", // Naranja suave
    "#6C5B7B", // Gris morado
    "#B0A9B7", // Gris cálido
    "#6F4F37", // Café suave
    "#C0E218", // Verde oliva pálido
  ];

  return (
    <div className="w-full h-full flex items-center">
      {/* Leyenda de flores */}
      <div className="flex flex-col justify-center w-52 h-80 overflow-y-auto pr-2">
        {filteredData.map((flower, index) => (
          <div
            key={flower.name}
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "10px",
            }}
          >
            <div
              style={{
                width: "15px",
                height: "15px",
                backgroundColor: COLORS[index % COLORS.length],
                marginRight: "10px",
              }}
            ></div>
            <span>{flower.name}</span>
          </div>
        ))}
      </div>

      {/* Gráfica Circular */}
      <ResponsiveContainer width="100%">
        <PieChart>
          <Pie
            data={filteredData}
            dataKey="currentFresh"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={150}
            labelLine={false} // Desactivamos las líneas que van a las etiquetas
            label={true} // Usamos la función personalizada para las etiquetas
          >
            {filteredData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const { name, currentFresh, currentWilted } =
                  payload[0].payload;
                return (
                  <div className="bg-white/90 p-1 rounded-md shadow-md">
                    <p className="text-xs font-medium">{name}</p>
                    <p className="text-xs">Frescas: {currentFresh}</p>
                    <p className="text-xs">Marchitas: {currentWilted}</p>
                  </div>
                );
              }
              return null;
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default FlowerChart;
