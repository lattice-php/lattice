import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { Node, RendererComponent } from "@lattice-php/lattice/core/types";
import type { WizardStep } from "@lattice-php/lattice/types/generated";
import { cn } from "@lattice-php/lattice/lib/utils";
import { useT } from "@lattice-php/lattice/i18n";
import { Icon } from "@lattice-php/lattice/icons";
import { Button } from "@lattice-php/lattice/ui/button";
import { Spinner } from "@lattice-php/lattice/ui/spinner";
import { useFormContext } from "@lattice-php/lattice/form/hooks/context";
import {
  firstErroredStep,
  stepFieldNames,
  stepsWithErrors,
  stepValidationPaths,
} from "@lattice-php/lattice/form/lib/wizard-steps";

type WizardContextValue = { activeName: string };

const WizardContext = createContext<WizardContextValue>({ activeName: "" });

function getSteps(node: Node<"wizard">): { items: WizardStep[]; nodes: Node[] } {
  const nodes = (node.schema ?? []).filter((child) => child.type === "wizard-step");
  const items = nodes.map((child) => child.props as unknown as WizardStep);

  return { items, nodes };
}

export const WizardComponent: RendererComponent<"wizard"> = ({ children, node }) => {
  const { t } = useT("lattice");
  const { errors, processing, touch, validateFields, validating } = useFormContext();
  const { items, nodes } = useMemo(() => getSteps(node), [node]);
  const stepNames = useMemo(() => nodes.map((step) => stepFieldNames(step)), [nodes]);
  const isVertical = node.props.orientation === "vertical";

  const [activeIndex, setActiveIndex] = useState(0);
  const [visited, setVisited] = useState<Set<number>>(() => new Set([0]));
  const [completed, setCompleted] = useState<Set<number>>(() => new Set());
  const erroredSteps = useMemo(() => stepsWithErrors(stepNames, errors), [stepNames, errors]);
  const isLast = activeIndex === items.length - 1;

  const goTo = (index: number): void => {
    setActiveIndex(index);
    setVisited((previous) => new Set(previous).add(index));
  };

  const advance = (): void => {
    setCompleted((previous) => new Set(previous).add(activeIndex));

    if (!isLast) {
      goTo(activeIndex + 1);
    }
  };

  const onNext = (): void => {
    const step = nodes[activeIndex];
    const paths = step ? stepValidationPaths(step) : [];

    if (paths.length === 0) {
      advance();

      return;
    }

    touch(paths);
    validateFields(paths, { onSuccess: advance });
  };

  const wasProcessing = useRef(false);
  useEffect(() => {
    if (wasProcessing.current && !processing) {
      const target = firstErroredStep(stepNames, errors);

      if (target !== null && target !== activeIndex) {
        goTo(target);
      }
    }

    wasProcessing.current = processing;
  }, [processing, errors, stepNames, activeIndex]);

  const contextValue = useMemo(
    () => ({ activeName: items[activeIndex]?.name ?? "" }),
    [items, activeIndex],
  );

  return (
    <WizardContext.Provider value={contextValue}>
      <div className={cn("gap-6", isVertical ? "flex" : "grid")} data-slot="wizard">
        <ol
          aria-label={t("form.wizard.steps", "Steps")}
          className={cn("gap-1", isVertical ? "flex w-56 shrink-0 flex-col" : "flex flex-wrap")}
        >
          {items.map((step, index) => {
            const isActive = index === activeIndex;
            const isDone = completed.has(index);
            const hasError = erroredSteps.has(index);

            return (
              <li key={step.name}>
                <button
                  aria-current={isActive ? "step" : undefined}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-lt px-3 py-2 text-left text-sm",
                    isActive ? "bg-lt-muted font-medium text-lt-fg" : "text-lt-muted-fg",
                    !visited.has(index) && "cursor-not-allowed opacity-60",
                  )}
                  data-error={hasError || undefined}
                  data-test={`wizard-rail-${step.name}`}
                  disabled={!visited.has(index)}
                  id={`wizard-step-${step.name}-trigger`}
                  onClick={() => goTo(index)}
                  type="button"
                >
                  <span
                    className={cn(
                      "flex size-5 shrink-0 items-center justify-center rounded-full border text-xs",
                      hasError
                        ? "border-lt-danger text-lt-danger"
                        : isDone
                          ? "border-lt-primary bg-lt-primary text-lt-primary-fg"
                          : "border-lt-border",
                    )}
                  >
                    {isDone && !hasError ? (
                      <Icon className="size-lt-icon-sm" name="check" />
                    ) : (
                      index + 1
                    )}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate">{step.label}</span>
                    {isVertical && step.description && (
                      <span className="block truncate text-xs text-lt-muted-fg">
                        {step.description}
                      </span>
                    )}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>

        <div className="min-w-0 flex-1 space-y-6">
          {children}

          <div className="flex items-center justify-between gap-3">
            <Button
              data-test="wizard-back"
              disabled={activeIndex === 0 || processing}
              onClick={() => goTo(activeIndex - 1)}
              type="button"
              emphasis="outline"
            >
              {t("form.wizard.back", "Back")}
            </Button>

            {isLast ? (
              <Button data-test="wizard-finish" disabled={processing} type="submit">
                {processing && <Spinner />}
                {t("form.wizard.finish", "Finish")}
              </Button>
            ) : (
              <Button
                data-test="wizard-next"
                disabled={processing || validating}
                onClick={onNext}
                type="button"
              >
                {validating && <Spinner />}
                {t("form.wizard.next", "Next")}
              </Button>
            )}
          </div>
        </div>
      </div>
    </WizardContext.Provider>
  );
};

export const WizardStepComponent: RendererComponent<"wizard-step"> = ({ children, node }) => {
  const { activeName } = useContext(WizardContext);
  const name = node.props.name;
  const isActive = activeName === name;
  const [hasOpened, setHasOpened] = useState(isActive);

  useEffect(() => {
    if (isActive) {
      setHasOpened(true);
    }
  }, [isActive]);

  return (
    <section
      aria-labelledby={`wizard-step-${name}-trigger`}
      className={cn("space-y-8", !isActive && "hidden")}
      hidden={!isActive}
      id={`wizard-step-${name}-panel`}
    >
      {hasOpened ? (children as ReactNode) : null}
    </section>
  );
};
