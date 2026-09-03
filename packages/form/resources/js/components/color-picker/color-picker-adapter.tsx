import type { RendererComponent } from "@lattice-php/core";
import { cn } from "@lattice-php/ui/lib/utils";
import { ColorPicker, normalizeHex } from "./color-picker";
import { controlSurface } from "@lattice-php/ui/lib/control";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@lattice-php/ui/components/popover/popover";
import { SimpleField } from "../base/simple-field";

export const ColorPickerAdapter: RendererComponent<"field.color-picker"> = ({ node }) => {
  const props = node.props;

  return (
    <SimpleField node={node} label={props.label ?? ""}>
      {({ name, value, readOnly, disabled, commit }, controlProps) => {
        const hex = normalizeHex(value);

        return (
          <Popover>
            <input name={name} type="hidden" value={hex ?? ""} />
            <PopoverTrigger asChild>
              <button
                {...controlProps}
                aria-readonly={readOnly && !disabled ? true : undefined}
                className={cn(controlSurface(), "flex items-center gap-2 text-left")}
                data-test={`color-picker-${name}`}
                disabled={disabled}
                onClick={readOnly ? (event) => event.preventDefault() : undefined}
                type="button"
              >
                {hex ? (
                  <>
                    <span
                      aria-hidden="true"
                      className="size-4 shrink-0 rounded-full border border-lt-border"
                      style={{ background: hex }}
                    />
                    <span className="tabular-nums">{hex}</span>
                  </>
                ) : (
                  <span className="text-lt-muted-fg">{props.placeholder ?? ""}</span>
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent className="p-3">
              <ColorPicker
                onChange={(next) => commit(next)}
                palette={props.palette}
                value={hex ?? "#6b7280"}
              />
            </PopoverContent>
          </Popover>
        );
      }}
    </SimpleField>
  );
};
