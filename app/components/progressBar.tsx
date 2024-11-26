import { BsCardChecklist } from "react-icons/bs";
import { GiFlowerPot } from "react-icons/gi";
import { TbInvoice } from "react-icons/tb";
import { cn } from "~/lib/utils";

interface ProgressBarProps {
  currentStep: number;
  steps: {
    label: string;
    icon: JSX.Element;
  }[];
}

export function ProgressBar({ currentStep = 0, steps }: ProgressBarProps) {
  return (
    <aside className="h-full w-56 bg-white px-5 pt-1 space-y-3 border-t shadow-md">
      <p className="text-sm text-center mt-5">Barra de progreso</p>
      {steps.map((step, index) => (
        <Step
          label={step.label}
          icon={step.icon}
          index={index}
          key={index}
          currentStep={currentStep}
        />
      ))}
    </aside>
  );
}

export function Step({
  label,
  index,
  currentStep,
  icon,
}: {
  label: string;
  index: number;
  currentStep: number;
  icon: JSX.Element;
}) {
  return (
    <div
      className={cn(
        index === currentStep
          ? "border-2 ring-2 ring-blue-200 border-blue-400"
          : index < currentStep
          ? "hover:cursor-not-allowed border border-b-blue-300"
          : "border border-neutral-500 animate-pulse",
        "rounded-md h-12 w-full  shadow-sm flex justify-between items-center px-3"
      )}
    >
      <span
        className={cn(
          index === currentStep
            ? "underline underline-offset-2"
            : index < currentStep
            ? "line-through font-semibold"
            : "text-muted-foreground",
          "text-xs"
        )}
      >
        {label}
      </span>
      <div className="text-neutral-500">{icon}</div>
    </div>
  );
}
