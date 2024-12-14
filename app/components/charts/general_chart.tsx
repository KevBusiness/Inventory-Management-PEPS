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

// Datos de tickets
interface Ticket {
  id: number;
  total: number;
  deliveryDate: Date | null;
}

// Datos de ventas
interface Sale {
  createdAt: Date;
  ticketId: number;
  total: number;
}

interface SalesChartProps {
  tickets: Ticket[] | undefined;
  sales: Sale[] | undefined;
}

const SalesChart: React.FC<SalesChartProps> = ({ tickets, sales }) => {
  const [chartData, setChartData] = useState<any[]>([]);
  const [dateFilter, setDateFilter] = useState("all"); // Filtro por fechas
  const [ticketFilter, setTicketFilter] = useState<number | "all">("all"); // Filtro por ticketId

  // Función para obtener la fecha de hace x días
  const getDateXDaysAgo = (daysAgo: number) => {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return date;
  };

  // Filtrar las ventas según el filtro de fecha
  const filterSalesByDate = (sales: Sale[], filter: string) => {
    const now = new Date();

    switch (filter) {
      case "daily":
        return sales.filter((sale) => {
          const saleDate = new Date(sale.createdAt);
          return (
            saleDate.getDate() === now.getDate() &&
            saleDate.getMonth() === now.getMonth() &&
            saleDate.getFullYear() === now.getFullYear()
          );
        });

      case "weekly":
        const startOfWeek = getDateXDaysAgo(7); // Hace 7 días
        return sales.filter((sale) => {
          const saleDate = new Date(sale.createdAt);
          return saleDate >= startOfWeek && saleDate <= now;
        });

      case "all":
      default:
        return sales;
    }
  };

  // Filtrar las ventas según el filtro de ticketId
  const filterSalesByTicketId = (sales: Sale[], ticketId: number | "all") => {
    if (ticketId === "all") return sales;
    return sales.filter((sale) => sale.ticketId === ticketId);
  };

  useEffect(() => {
    if (!tickets || !sales) return;

    // Filtrar las ventas según los filtros
    const filteredSalesByDate = filterSalesByDate(sales, dateFilter);
    const filteredSales = filterSalesByTicketId(
      filteredSalesByDate,
      ticketFilter
    );

    // Mapear los datos de tickets y ventas
    const updatedData = tickets.map((ticket) => {
      // Filtrar ventas que correspondan al ticket actual
      const salesForTicket = filteredSales.filter(
        (sale) => sale.ticketId === ticket.id
      );

      // Sumar las ventas para ese ticket
      const totalSales = salesForTicket.reduce(
        (acc, sale) => acc + sale.total,
        0
      );

      return {
        ticketId: ticket.id,
        ticketTotal: ticket.total,
        salesTotal: totalSales,
        deliveryDate: ticket.deliveryDate,
      };
    });

    setChartData(updatedData);
  }, [tickets, sales, dateFilter, ticketFilter]);

  return (
    <div>
      {/* Filtros */}
      <div className="flex my-4">
        <button
          className={`px-4 py-2 mx-2 rounded-md ${
            dateFilter === "daily" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
          onClick={() => setDateFilter("daily")}
        >
          Diario
        </button>
        <button
          className={`px-4 py-2 mx-2 rounded-md ${
            dateFilter === "weekly" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
          onClick={() => setDateFilter("weekly")}
        >
          Semanal
        </button>
        <button
          className={`px-4 py-2 mx-2 rounded-md ${
            dateFilter === "all" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
          onClick={() => setDateFilter("all")}
        >
          Todos
        </button>
      </div>

      {/* Filtro por Ticket ID */}
      <div className="flex my-4">
        <label className="mr-2">Filtrar por Ticket ID:</label>
        <select
          value={ticketFilter}
          onChange={(e) => setTicketFilter(Number(e.target.value) || "all")}
          className="px-4 py-2 rounded-md bg-gray-200"
        >
          <option value="all">Todos</option>
          {tickets?.map((ticket) => (
            <option key={ticket.id} value={ticket.id}>
              Lote {ticket.id}
            </option>
          ))}
        </select>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={chartData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
          <XAxis
            dataKey="ticketId"
            stroke="#333"
            tickFormatter={(value) => `Lote ${value}`} // Formateo personalizado
          />
          <YAxis />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const { ticketId, ticketTotal, salesTotal } =
                  payload[0].payload;
                return (
                  <div className="bg-gray-800 text-white p-4 rounded-lg shadow-xl">
                    <p className="text-lg font-semibold">
                      Ticket ID: {ticketId}
                    </p>
                    <p className="text-sm">Total Ticket: {ticketTotal}</p>
                    <p className="text-sm">Ventas: {salesTotal}</p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend />
          {/* Barra para el total del ticket */}
          <Bar dataKey="ticketTotal" fill="#82ca9d" name="Total Ticket" />
          {/* Barra para las ventas */}
          <Bar dataKey="salesTotal" fill="#8884d8" name="Ventas" />
          <ReferenceLine y={0} stroke="#ccc" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SalesChart;
