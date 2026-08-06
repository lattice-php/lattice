// Pulls in the umbrella's ComponentProps augmentation so Node<"action"> etc.
// resolve to typed props when tsc resolves siblings through dist (workspace
// typecheck); the root-tsconfig run gets the augmentation via its global include.
import "@lattice-php/lattice";
