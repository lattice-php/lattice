import { Form as InertiaForm } from "@inertiajs/react";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { useMemo, useState } from "react";
import InputError from "@/components/input-error";
import PasskeyVerify from "@/components/passkey-verify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Spinner } from "@/components/ui/spinner";
import { getStringProp } from "@/lattice/core/props";
import type { LatticeRendererComponent } from "@/lattice/core/types";

const OTP_MAX_LENGTH = 6;

declare module "@/lattice/core/types" {
  interface LatticeComponentProps {
    "auth.passkey-verify": {
      label?: string;
      loadingLabel?: string;
      optionsUrl?: string;
      separator?: string;
      submitUrl?: string;
    };
    "auth.two-factor-challenge-form": {
      action?: string;
    };
  }
}

export const PasskeyVerifyComponent: LatticeRendererComponent<"auth.passkey-verify"> = ({
  node,
}) => (
  <div className="mx-auto w-full max-w-md">
    <PasskeyVerify
      label={getStringProp(node.props, "label")}
      loadingLabel={getStringProp(node.props, "loadingLabel")}
      routes={{
        options: {
          method: "get",
          url: getStringProp(node.props, "optionsUrl"),
        },
        submit: {
          method: "post",
          url: getStringProp(node.props, "submitUrl"),
        },
      }}
      separator={getStringProp(node.props, "separator")}
    />
  </div>
);

export const TwoFactorChallengeFormComponent: LatticeRendererComponent<
  "auth.two-factor-challenge-form"
> = ({ node }) => {
  const [showRecoveryInput, setShowRecoveryInput] = useState(false);
  const [code, setCode] = useState("");

  const content = useMemo(() => {
    if (showRecoveryInput) {
      return {
        description:
          "Please confirm access to your account by entering one of your emergency recovery codes.",
        title: "Recovery code",
        toggleText: "login using an authentication code",
      };
    }

    return {
      description: "Enter the authentication code provided by your authenticator application.",
      title: "Authentication code",
      toggleText: "login using a recovery code",
    };
  }, [showRecoveryInput]);

  const toggleRecoveryMode = (clearErrors: () => void): void => {
    setShowRecoveryInput((current) => !current);
    clearErrors();
    setCode("");
  };

  return (
    <InertiaForm
      action={getStringProp(node.props, "action")}
      data-lattice-component={node.id}
      method="post"
      resetOnError
      resetOnSuccess={!showRecoveryInput}
      className="mx-auto flex w-full max-w-md flex-col gap-6 rounded-lt border border-lt-border bg-lt-surface p-6 shadow-xs"
    >
      {({ errors, processing, clearErrors }) => (
        <div className="grid gap-6">
          <div className="grid gap-2 text-center">
            <h2 className="text-2xl font-semibold tracking-normal text-balance text-lt-fg">
              {content.title}
            </h2>
            <p className="text-base leading-7 text-lt-muted-fg">{content.description}</p>
          </div>

          {showRecoveryInput ? (
            <div className="grid gap-2">
              <Input
                name="recovery_code"
                type="text"
                placeholder="Enter recovery code"
                autoFocus
                required
              />
              <InputError message={errors.recovery_code} />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 text-center">
              <InputOTP
                name="code"
                maxLength={OTP_MAX_LENGTH}
                value={code}
                onChange={(value) => setCode(value)}
                disabled={processing}
                pattern={REGEXP_ONLY_DIGITS}
                autoFocus
              >
                <InputOTPGroup>
                  {Array.from({ length: OTP_MAX_LENGTH }, (_, index) => (
                    <InputOTPSlot key={index} index={index} />
                  ))}
                </InputOTPGroup>
              </InputOTP>
              <InputError message={errors.code} />
            </div>
          )}

          <Button type="submit" className="w-full" disabled={processing}>
            {processing && <Spinner />}
            Continue
          </Button>

          <div className="text-center text-sm text-lt-muted-fg">
            <span>or you can </span>
            <button
              type="button"
              className="cursor-pointer text-lt-fg underline decoration-lt-border underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-lt-border"
              onClick={() => toggleRecoveryMode(clearErrors)}
            >
              {content.toggleText}
            </button>
          </div>
        </div>
      )}
    </InertiaForm>
  );
};
