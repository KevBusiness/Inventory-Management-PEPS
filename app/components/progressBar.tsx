import { motion, AnimatePresence } from "framer-motion";
import { cn } from "~/lib/utils";
import { Button } from "./ui/button";
import { useLocation, useSearchParams } from "@remix-run/react";
import NumberFlow from "@number-flow/react";

interface ProgressBarProps {
  currentStep: number;
  steps: {
    label: string;
    icon: JSX.Element;
  }[];
}

export function ProgressBar({ currentStep = 0, steps }: ProgressBarProps) {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const path = location.pathname.split("/")[2];
  const selectedTicket =
    searchParams.get("current") || searchParams.get("ticket");
  return (
    <aside className="h-full w-56 bg-white rounded-r-lg px-5 pt-1 flex flex-col justify-between border-t shadow-md">
      <div className="space-y-3">
        <p className="text-sm text-center mt-1">Barra de progreso</p>
        <AnimatePresence>
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Step
                label={step.label}
                icon={step.icon}
                index={index}
                currentStep={currentStep}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <AnimatePresence>
        {path === "sale" ? (
          <motion.div
            className="border-t h-fit py-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-sm text-center mt-1">Lote seleccionado</p>
            {selectedTicket ? (
              <span className="text-[120px] font-bold mx-auto block w-fit">
                <NumberFlow value={Number(selectedTicket)} />
              </span>
            ) : (
              <span className="block my-5 mx-auto w-fit text-md font-semibold">
                Sin especificar
              </span>
            )}
            <Button
              className="h-12 w-full my-0"
              disabled={Number(selectedTicket) > 0 ? false : true}
              onClick={() => {
                setSearchParams({
                  step: "1",
                  ticket: selectedTicket!.toString(),
                });
              }}
            >
              Continuar
            </Button>
          </motion.div>
        ) : null}
      </AnimatePresence>
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
          : "border border-neutral-300 animate-pulse",
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
