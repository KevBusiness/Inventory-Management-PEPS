import { Input } from "../ui/input";
import { cn } from "~/lib/utils";

interface InputCustom {
  color: "blue" | "amber" | "green";
  placeholder?: string;
  max?: number;
  min?: number;
  name?: string;
  id?: string;
  type: string;
  width?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function InputCustom({
  color,
  placeholder,
  max,
  min,
  name,
  id,
  type,
  width,
  onChange,
}: InputCustom) {
  return (
    <Input
      className={cn(
        `valid:border-${color}-500 focus:valid:ring-${color}-500 focus:valid:border-${color}-200 ${
          width ? width : null
        }`,
        "h-12 font-light border-2 placeholder-shown:invalid:border-neutral-200 focus:invalid:ring-red-500 focus:invalid:ring-1 invalid:border-red-500 focus:valid:ring-1 placeholder-shown:valid:border-neutral-200 "
      )}
      placeholder={placeholder}
      max={max}
      min={min}
      name={name}
      id={id}
      type={type}
      onChange={onChange}
    />
  );
}
