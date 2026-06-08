import { createPlugin, lazyComponent } from "@/lattice/core/registry";
import type { RendererComponent, RendererComponentModule } from "@/lattice/core/types";

type AuthComponentName = "PasskeyVerifyComponent" | "TwoFactorChallengeFormComponent";

const loadAuthComponents = () => import("./components/auth-components");

function loadAuthComponent<TType extends string>(
  name: AuthComponentName,
): () => Promise<RendererComponentModule<TType>> {
  return async () => {
    const components = await loadAuthComponents();

    return {
      default: components[name] as RendererComponent<TType>,
    };
  };
}

export const authComponents = createPlugin({
  components: {
    "auth.passkey-verify": lazyComponent(loadAuthComponent("PasskeyVerifyComponent")),
    "auth.two-factor-challenge-form": lazyComponent(
      loadAuthComponent("TwoFactorChallengeFormComponent"),
    ),
  },
  name: "lattice/auth",
});
