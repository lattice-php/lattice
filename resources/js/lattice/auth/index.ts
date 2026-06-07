import { createLatticePlugin, lazyComponent } from "@/lattice/core/registry";
import type {
  LatticeRendererComponent,
  LatticeRendererComponentModule,
} from "@/lattice/core/types";

type AuthComponentName = "PasskeyVerifyComponent" | "TwoFactorChallengeFormComponent";

const loadAuthComponents = () => import("./components/auth-components");

function loadAuthComponent<TType extends string>(
  name: AuthComponentName,
): () => Promise<LatticeRendererComponentModule<TType>> {
  return async () => {
    const components = await loadAuthComponents();

    return {
      default: components[name] as LatticeRendererComponent<TType>,
    };
  };
}

export const authComponents = createLatticePlugin({
  components: {
    "auth.passkey-verify": lazyComponent(loadAuthComponent("PasskeyVerifyComponent")),
    "auth.two-factor-challenge-form": lazyComponent(
      loadAuthComponent("TwoFactorChallengeFormComponent"),
    ),
  },
  name: "lattice/auth",
});
