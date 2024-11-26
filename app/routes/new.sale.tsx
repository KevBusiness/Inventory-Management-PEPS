import { useSearchParams } from "@remix-run/react";
import React from "react";
import { BsCardChecklist } from "react-icons/bs";
import { GiFlowerPot } from "react-icons/gi";
import { LiaSaveSolid } from "react-icons/lia";
import { TbInvoice } from "react-icons/tb";
import { ProgressBar } from "~/components/progressBar";

const steps = [
  { label: "Seleccionar Ticket", icon: <TbInvoice /> },
  { label: "Actualizar Cantidades", icon: <GiFlowerPot /> },
  { label: "Confirmar Venta", icon: <BsCardChecklist /> },
  { label: "Guardar Venta", icon: <LiaSaveSolid /> },
];

export default function NewSale() {
  const [searchParams, setSearchParams] = useSearchParams();
  const step = searchParams.get("step");
  return (
    <div className="flex overflow-hidden h-full">
      <ProgressBar steps={steps} currentStep={parseInt(step!) || 0} />
    </div>
  );
}
