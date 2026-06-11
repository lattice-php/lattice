import { FormInput, House, PanelsTopLeft, Table } from "lucide-react";
import type { IconRendererFunction } from "@lattice/lattice";

const icons = {
  house: House,
  "form-input": FormInput,
  table: Table,
  "panels-top-left": PanelsTopLeft,
};

export const appIcons: IconRendererFunction = ({ className, icon }) => {
  const Icon = icons[icon as keyof typeof icons];

  if (!Icon) {
    return null;
  }

  return <Icon aria-hidden="true" className={className} />;
};
