import { Icon } from "@lattice-php/lattice";
import type { IconName } from "./sprite-icons";

// The generated IconName is the actual sprite set — unknown names are rejected.
const known: IconName = "house";
const custom: IconName = "spark";
// @ts-expect-error - not an icon in the sprite
const unknown: IconName = "definitely-not-an-icon";

// Via the generated KnownIcons augmentation, `<Icon name>` autocompletes to the
// sprite's icons (and, being loose, still accepts any string).
const example = <Icon name="spark" />;

export { custom, example, known, unknown };
