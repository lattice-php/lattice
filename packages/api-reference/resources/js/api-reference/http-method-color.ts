import type { ColorName } from "@lattice-php/lattice/types/generated";

export function httpMethodColor(method: string): ColorName {
  switch (method) {
    case "GET":
      return "info";
    case "POST":
      return "success";
    case "PUT":
    case "PATCH":
      return "warning";
    case "DELETE":
      return "danger";
    default:
      return "default";
  }
}
