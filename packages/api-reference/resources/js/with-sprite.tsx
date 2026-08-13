import { SpriteProvider, useSprite } from "@lattice-php/ui/icons";
import {
  ApiReference as BareApiReference,
  type ApiReferenceProps,
} from "./api-reference/ApiReference";
import { sprite } from "./icons/sprite.generated";

/**
 * The npm entry's ApiReference: falls back to the bundled icon sprite when no
 * SpriteProvider is mounted above, so standalone consumers get icons without
 * any build-tool wiring. A host-provided sprite always wins.
 */
export function ApiReference(props: ApiReferenceProps): React.ReactNode {
  const outer = useSprite();
  const content = <BareApiReference {...props} />;

  if (outer.href || outer.source) {
    return content;
  }

  return <SpriteProvider sprite={sprite}>{content}</SpriteProvider>;
}

export type { ApiReferenceProps };
