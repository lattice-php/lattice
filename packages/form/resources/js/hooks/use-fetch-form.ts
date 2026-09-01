import { useCallback, useRef, useState } from "react";
import { apiFetch } from "@lattice-php/core/api";
import { dispatchActionError, getActionEffects } from "@lattice-php/ui/effects/dispatch";
import type { ActionResponse } from "@lattice-php/ui/effects/dispatch";
import { useEffectDispatcher } from "@lattice-php/ui/effects/use-effect-dispatcher";
import { useDebouncedCallback } from "@lattice-php/ui/lib/use-debounced-callback";
import { errorKeyBelongsTo, firstErrors } from "../lib/field-errors";
import type { FieldErrors } from "../lib/field-errors";
import { FORM_DEBOUNCE_MS } from "../lib/form-transport";
import { useFormValues } from "./values";

export type FetchFormOptions = {
  componentRef: string;
  endpoint: string;
  /** Extra payload merged into every request, e.g. a bulk action's selection. */
  extraData?: Record<string, unknown>;
  method: string;
  onBefore?: () => void;
  /** Fires on every failed submit: validation (422), a non-2xx response, or a thrown error. */
  onError?: () => void;
  onSuccess: (response: ActionResponse) => void;
  precognitive: boolean;
  validationDebounceMs?: number;
};

export type FetchForm = {
  clearErrors: (field: string) => void;
  errors: FieldErrors;
  processing: boolean;
  submit: () => void;
  touch: (fields: string[]) => void;
  validate: (field: string) => void;
  validateFields: (
    fields: string[],
    options?: { onSuccess?: () => void; onValidationError?: () => void },
  ) => void;
  validating: boolean;
};

/**
 * The fetch-based form runtime: submits the current form values as JSON,
 * dispatches the effects from the response body, and maps 422 bodies onto
 * field errors — with the same Precognition wiring the Inertia runtime gets
 * from the server. Shared by modal action forms and async inline forms;
 * ref renewal on 403 is apiFetch's job.
 */
export function useFetchForm({
  componentRef,
  endpoint,
  extraData,
  method,
  onBefore,
  onError,
  onSuccess,
  precognitive,
  validationDebounceMs = FORM_DEBOUNCE_MS,
}: FetchFormOptions): FetchForm {
  const values = useFormValues();
  const valuesRef = useRef(values);
  valuesRef.current = values;
  const extraDataRef = useRef(extraData);
  extraDataRef.current = extraData;

  const dispatch = useEffectDispatcher();
  const [errors, setErrors] = useState<FieldErrors>({});
  const [processing, setProcessing] = useState(false);
  const [validating, setValidating] = useState(false);

  const request = useCallback(
    (extraHeaders?: Record<string, string>): Promise<Response> =>
      apiFetch(endpoint, {
        body: JSON.stringify({ ...valuesRef.current, ...extraDataRef.current }),
        method,
        ref: componentRef,
        headers: extraHeaders,
        throwOnError: false,
      }),
    [componentRef, endpoint, method],
  );

  const clearErrors = useCallback((field: string) => {
    setErrors((current) =>
      current[field] === undefined ? current : { ...current, [field]: undefined },
    );
  }, []);

  const runValidation = useDebouncedCallback((field: string) => {
    void request({ Precognition: "true", "Precognition-Validate-Only": field })
      .then(async (response) => {
        if (response.status === 422) {
          const body = (await response.json()) as { errors?: Record<string, string[]> };
          setErrors((current) => ({ ...current, ...firstErrors(body.errors) }));

          return;
        }

        clearErrors(field);
      })
      .catch(() => {});
  }, validationDebounceMs);

  const validate = useCallback(
    (field: string) => {
      if (precognitive) {
        runValidation(field);
      }
    },
    [precognitive, runValidation],
  );

  const touch = useCallback(() => {}, []);

  const validateFields = useCallback(
    (fields: string[], options?: { onSuccess?: () => void; onValidationError?: () => void }) => {
      setValidating(true);

      void request({ Precognition: "true", "Precognition-Validate-Only": fields.join(",") })
        .then(async (response) => {
          if (response.status === 422) {
            const body = (await response.json()) as { errors?: Record<string, string[]> };
            setErrors((current) => ({ ...current, ...firstErrors(body.errors) }));
            options?.onValidationError?.();

            return;
          }

          if (!response.ok) {
            options?.onValidationError?.();

            return;
          }

          const cleared = fields.filter((field) => !field.includes("*"));
          setErrors((current) =>
            Object.fromEntries(
              Object.entries(current).filter(
                ([key]) => !cleared.some((name) => errorKeyBelongsTo(key, name)),
              ),
            ),
          );
          options?.onSuccess?.();
        })
        .catch(() => options?.onValidationError?.())
        .finally(() => setValidating(false));
    },
    [request],
  );

  const submit = useCallback(() => {
    setProcessing(true);
    onBefore?.();

    void request()
      .then(async (response) => {
        const body = (await response.json().catch(() => ({}))) as ActionResponse & {
          errors?: Record<string, string[]>;
        };

        dispatch(getActionEffects(body.effects));

        if (response.status === 422 && body.errors) {
          setErrors(firstErrors(body.errors));
          onError?.();

          return;
        }

        if (!response.ok) {
          onError?.();

          return;
        }

        setErrors({});
        onSuccess(body);
      })
      .catch((error: unknown) => {
        dispatchActionError(error);
        onError?.();
      })
      .finally(() => setProcessing(false));
  }, [dispatch, onBefore, onError, onSuccess, request]);

  return {
    clearErrors,
    errors,
    processing,
    submit,
    touch,
    validate,
    validateFields,
    validating,
  };
}
