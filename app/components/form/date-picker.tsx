// components/ui/date-picker.tsx

import React, { useState } from "react";
import DatePicker from "react-datepicker";
import { cn } from "~/lib/utils";
import "react-datepicker/dist/react-datepicker.css"; // Estilos de react-datepicker

interface DatePickerProps {
  label: string;
  value: string | undefined;
  onChange: (value: string) => void;
}

const CustomDatePicker: React.FC<DatePickerProps> = ({
  label,
  value,
  onChange,
}) => {
  const [startDate, setStartDate] = useState(value ? new Date(value) : null);

  const handleDateChange = (date: Date | null) => {
    if (date) {
      setStartDate(date);
      onChange(date.toISOString().split("T")[0]); // Guarda la fecha en formato YYYY-MM-DD
    }
  };

  return (
    <div className="relative">
      <label
        htmlFor="date"
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label}
      </label>
      <DatePicker
        id="date"
        selected={startDate}
        onChange={handleDateChange}
        dateFormat="yyyy-MM-dd"
        className="block w-full h-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        placeholderText="Selecciona una fecha"
      />
    </div>
  );
};

export { CustomDatePicker };
