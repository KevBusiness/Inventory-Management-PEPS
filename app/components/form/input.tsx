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
        `${
          color === "blue"
            ? "valid:border-blue-500 focus:valid:ring-blue-500 focus:valid:border-blue-200"
            : color === "amber"
            ? "valid:border-amber-500 focus:valid:ring-amber-500 focus:valid:border-amber-200"
            : "valid:border-green-500 focus:valid:ring-green-500 focus:valid:border-green-200"
        } ${width ? width : null}`,
        "h-12 font-light border placeholder-shown:invalid:border-neutral-200 focus:invalid:ring-red-500 focus:invalid:ring-1 invalid:border-red-500 focus:valid:ring-1 placeholder-shown:valid:border-neutral-200 "
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
