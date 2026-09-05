import type { Option } from "@lattice-php/core";
import { Collapsible } from "@lattice-php/ui/components/collapsible/collapsible";
import { Grid, type GridBreakpointMap } from "@lattice-php/ui/components/grid/grid";
import { useT } from "@lattice-php/ui/i18n";
import { InfoTooltip } from "@lattice-php/ui/primitives/info-tooltip";
import { Checkbox } from "../checkbox/checkbox";
import { Label } from "../../primitives/label";

export type CheckboxGroupProps = {
  bulkToggleable?: boolean;
  collapsed?: boolean;
  collapsible?: boolean;
  columns?: GridBreakpointMap;
  disabled?: boolean;
  idPrefix: string;
  onChange: (next: string[]) => void;
  options: Option[];
  readOnly?: boolean;
  testId: string;
  value: string[];
};

type OptionGroup = { label: string | null; options: Option[] };

/** Buckets options by their `group` label, keeping first-seen group order. */
function groupOptions(options: Option[]): OptionGroup[] {
  const groups: OptionGroup[] = [];

  for (const option of options) {
    const label = option.group ?? null;
    const existing = groups.find((group) => group.label === label);

    if (existing) {
      existing.options.push(option);

      continue;
    }

    groups.push({ label, options: [option] });
  }

  return groups.sort((a, b) => Number(a.label !== null) - Number(b.label !== null));
}

function checkedState(selected: string[], values: string[]): boolean | "indeterminate" {
  const count = values.filter((value) => selected.includes(value)).length;

  if (count === 0) {
    return false;
  }

  return count === values.length ? true : "indeterminate";
}

export function CheckboxGroup({
  bulkToggleable = false,
  collapsed = false,
  collapsible = false,
  columns,
  disabled = false,
  idPrefix,
  onChange,
  options,
  readOnly = false,
  testId,
  value,
}: CheckboxGroupProps) {
  const { t } = useT("lattice");
  const selectAllLabel = t("form.checkbox-group.select-all", "Select all");
  const groups = groupOptions(options);

  function toggle(optionValue: string): void {
    onChange(
      value.includes(optionValue)
        ? value.filter((item) => item !== optionValue)
        : [...value, optionValue],
    );
  }

  function toggleAll(values: string[]): void {
    const selectAll = checkedState(value, values) !== true;

    onChange(
      selectAll
        ? [...value, ...values.filter((item) => !value.includes(item))]
        : value.filter((item) => !values.includes(item)),
    );
  }

  function bulkToggle(values: string[], label: string, key: string) {
    return (
      <Checkbox
        aria-label={label}
        aria-readonly={readOnly && !disabled ? true : undefined}
        checked={checkedState(value, values)}
        data-test={`${testId}-toggle-${key}`}
        disabled={disabled}
        onCheckedChange={() => {
          if (readOnly) {
            return;
          }

          toggleAll(values);
        }}
      />
    );
  }

  function optionGrid(group: OptionGroup) {
    return (
      <Grid className="gap-y-3" columns={columns ?? { default: 1 }}>
        {group.options.map((option) => {
          const id = `${idPrefix}-${option.value}`;

          return (
            <div className="flex items-start gap-3" key={option.value}>
              <Checkbox
                aria-readonly={readOnly && !disabled ? true : undefined}
                checked={value.includes(option.value)}
                className="mt-0.5"
                data-test={`${testId}-${option.value}`}
                disabled={disabled}
                id={id}
                onCheckedChange={() => {
                  if (readOnly) {
                    return;
                  }

                  toggle(option.value);
                }}
              />
              <div className="grid gap-0.5">
                <div className="flex items-center">
                  <Label htmlFor={id}>{option.label}</Label>
                  <InfoTooltip content={option.tooltip} />
                </div>
                {option.description && (
                  <p className="text-sm text-lt-muted-fg">{option.description}</p>
                )}
              </div>
            </div>
          );
        })}
      </Grid>
    );
  }

  return (
    <div className="grid gap-4">
      {bulkToggleable && options.length > 0 && (
        <div className="flex items-center gap-3">
          {bulkToggle(
            options.map((option) => option.value),
            selectAllLabel,
            "all",
          )}
          <span className="text-sm text-lt-muted-fg">{selectAllLabel}</span>
        </div>
      )}

      {groups.map((group) => {
        if (group.label === null) {
          return <div key="ungrouped">{optionGrid(group)}</div>;
        }

        const header = (
          <div className="flex items-center gap-3">
            {bulkToggleable &&
              bulkToggle(
                group.options.map((option) => option.value),
                group.label,
                group.label,
              )}
            <span className="text-sm font-medium text-lt-fg">{group.label}</span>
          </div>
        );

        if (!collapsible) {
          return (
            <div className="grid gap-3" key={group.label}>
              {header}
              {optionGrid(group)}
            </div>
          );
        }

        return (
          <Collapsible
            data-test={`${testId}-group-${group.label}`}
            defaultOpen={!collapsed}
            key={group.label}
            trigger={header}
          >
            {optionGrid(group)}
          </Collapsible>
        );
      })}
    </div>
  );
}
