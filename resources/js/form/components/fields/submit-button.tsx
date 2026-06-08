import { Button } from "@/lattice/core/components/button";
import { Spinner } from "@/lattice/core/components/spinner";
import { getStringProp } from "@/lattice/core/props";
import type { RendererComponent } from "@/lattice/core/types";
import { useLatticeForm } from "../context";

declare module "@/lattice/core/types" {
  interface ComponentProps {
    "form.submit-button": {
      label?: string;
      variant?: "default" | "destructive" | "ghost" | "link" | "outline" | "secondary";
    };
  }
}

export const SubmitButtonComponent: RendererComponent<"form.submit-button"> = ({ node }) => {
  const { processing } = useLatticeForm();

  return (
    <Button
      disabled={processing}
      type="submit"
      className="mt-4 w-full"
      variant={node.props?.variant ?? "default"}
    >
      {processing && <Spinner />}
      {getStringProp(node.props, "label", "Submit")}
    </Button>
  );
};
