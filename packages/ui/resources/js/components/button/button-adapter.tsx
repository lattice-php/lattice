import { IconRenderer } from "../../icons";
import { Button } from "./button";
import { nodeIdentity } from "@lattice-php/core/test-id";
import type { RendererComponent } from "@lattice-php/core/types";
import { ActionTrigger, type TriggerState, useClickBehavior } from "../../click-behavior";
import { useNavigation } from "../../navigation";

const ButtonAdapter: RendererComponent<"button"> = ({ node }) => {
  const { label, icon } = node.props;
  const variant = node.props.variant ?? null;
  const emphasis = node.props.emphasis ?? "solid";
  const testId = nodeIdentity(node);
  const behavior = useClickBehavior(node.props);
  const { Link } = useNavigation();
  const size = icon ? "icon" : "md";
  const content = icon ? (
    <>
      <IconRenderer className="size-lt-icon-md" icon={icon} />
      {label ? <span className="sr-only">{label}</span> : null}
    </>
  ) : (
    label
  );

  const triggerButton = ({ onClick, processing }: TriggerState) => (
    <Button
      data-test={testId}
      disabled={processing}
      emphasis={emphasis}
      onClick={onClick}
      size={size}
      variant={variant}
    >
      {content}
    </Button>
  );

  if (behavior.kind === "navigate") {
    return (
      <Button asChild data-test={testId} emphasis={emphasis} variant={variant} size={size}>
        <Link href={behavior.href} method={behavior.method ?? undefined}>
          {content}
        </Link>
      </Button>
    );
  }

  if (behavior.kind === "action") {
    return <ActionTrigger action={behavior.action}>{triggerButton}</ActionTrigger>;
  }

  if (behavior.kind === "effects" || behavior.kind === "modal") {
    return triggerButton({ onClick: behavior.onClick, processing: false });
  }

  return (
    <Button
      data-test={testId}
      emphasis={emphasis}
      size={size}
      type={node.props.buttonType}
      variant={variant}
    >
      {content}
    </Button>
  );
};

export default ButtonAdapter;
