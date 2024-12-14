import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from "recharts";
import { formatToMXN } from "~/lib/utils";

// Tipo de datos de ventas
interface Sale {
  createdAt: Date;
  total: number;
}

interface SalesChartProps {
  sales: Sale[] | undefined;
}

const SalesChart: React.FC<SalesChartProps> = ({ sales }) => {
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [filterType, setFilterType] = useState<string>("daily"); // "daily", "monthly", "weekly"

  useEffect(() => {
    if (!sales) return;

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    const currentDay = currentDate.getDate();
    const currentDayOfWeek = currentDate.getDay(); // Día de la semana (0=domingo, 6=sábado)

    // Filtrar según el tipo de filtro
    let filtered: any[] = [];

    switch (filterType) {
      case "daily":
        // Filtrar las ventas de hoy y dividir por horas
        filtered = sales.filter((sale) => {
          const saleDate = new Date(sale.createdAt);
          return (
            saleDate.getFullYear() === currentYear &&
            saleDate.getMonth() === currentMonth &&
            saleDate.getDate() === currentDay
          );
        });

        // Dividir por horas
        filtered = groupByHour(filtered);
        break;
      case "monthly":
        // Filtrar las ventas del mes actual
        filtered = sales.filter((sale) => {
          const saleDate = new Date(sale.createdAt);
          return (
            saleDate.getFullYear() === currentYear &&
            saleDate.getMonth() === currentMonth
          );
        });

        // Agrupar por mes
        filtered = groupByMonth(filtered);
        break;
      case "weekly":
        // Filtrar las ventas de la semana actual
        filtered = sales.filter((sale) => {
          const saleDate = new Date(sale.createdAt);
          const saleDayOfWeek = saleDate.getDay();
          // Filtrar por la semana actual (día de la semana entre 0 y 6)
          return (
            saleDate.getFullYear() === currentYear &&
            saleDate.getMonth() === currentMonth &&
            saleDayOfWeek >= currentDayOfWeek - 6 && // Esta es una aproximación, puedes ajustarla más si necesitas
            saleDayOfWeek <= currentDayOfWeek
          );
        });

        // Agrupar por día de la semana
        filtered = groupByWeekDay(filtered);
        break;
      default:
        filtered = [];
    }

    setFilteredData(filtered);
  }, [sales, filterType]);

  // Función para agrupar ventas por hora (solo para el filtro diario)
  const groupByHour = (sales: Sale[]) => {
    const grouped: any = {};

    sales.forEach((sale) => {
      const saleDate = new Date(sale.createdAt);
      const hour = saleDate.getHours();
      const key = `${hour}:00`;

      if (!grouped[key]) {
        grouped[key] = 0;
      }

      grouped[key] += sale.total;
    });

    return Object.entries(grouped).map(([key, value]) => ({
      hour: key,
      total: value,
    }));
  };

  // Función para agrupar las ventas por mes (para el filtro mensual)
  const groupByMonth = (sales: Sale[]) => {
    const grouped: any = {};

    sales.forEach((sale) => {
      const saleDate = new Date(sale.createdAt);
      const month = saleDate.getMonth(); // 0 a 11
      const monthNames = [
        "Enero",
        "Febrero",
        "Marzo",
        "Abril",
        "Mayo",
        "Junio",
        "Julio",
        "Agosto",
        "Septiembre",
        "Octubre",
        "Noviembre",
        "Diciembre",
      ];
      const key = `${monthNames[month]} ${saleDate.getFullYear()}`;

      if (!grouped[key]) {
        grouped[key] = 0;
      }

      grouped[key] += sale.total;
    });

    return Object.entries(grouped).map(([key, value]) => ({
      hour: key,
      total: value,
    }));
  };

  // Función para agrupar las ventas por día de la semana (para el filtro semanal)
  const groupByWeekDay = (sales: Sale[]) => {
    const grouped: any = {};

    sales.forEach((sale) => {
      const saleDate = new Date(sale.createdAt);
      const weekDay = saleDate.toLocaleString("es-ES", { weekday: "long" }); // Días en español

      if (!grouped[weekDay]) {
        grouped[weekDay] = 0;
      }

      grouped[weekDay] += sale.total;
    });

    return Object.entries(grouped).map(([key, value]) => ({
      hour: key,
      total: value,
    }));
  };

  return (
    <div>
      {/* Filtros */}
      <div className="flex my-4">
        <button
          className={`px-4 py-2 mx-2 rounded-md ${
            filterType === "daily" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
          onClick={() => setFilterType("daily")}
        >
          Diario
        </button>
        <button
          className={`px-4 py-2 mx-2 rounded-md ${
            filterType === "weekly" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
          onClick={() => setFilterType("weekly")}
        >
          Semanal
        </button>
        <button
          className={`px-4 py-2 mx-2 rounded-md ${
            filterType === "monthly" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
          onClick={() => setFilterType("monthly")}
        >
          Mensual
        </button>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={filteredData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
          <XAxis dataKey="hour" stroke="#333" />
          <YAxis />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const { hour, total } = payload[0].payload;
                return (
                  <div className="bg-gray-800 text-white p-4 rounded-lg shadow-xl">
                    {hour && (
                      <p className="text-lg font-semibold">{`Hora: ${hour}`}</p>
                    )}
                    <p className="text-sm">
                      Ventas Totales: {formatToMXN(total)}
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend />
          <Bar dataKey="total" fill="#82ca9d" />
          <ReferenceLine y={0} stroke="#ccc" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SalesChart;
