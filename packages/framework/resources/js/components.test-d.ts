import { describe, expectTypeOf, it } from "vitest";
import {
  Button,
  Card,
  Checkbox,
  Combobox,
  DataTableGrid,
  DatePicker,
  FormField,
  Icon,
  Input,
  MultiSelect,
  Stack,
  Text,
  ToastCard,
  Toggle,
  Tooltip,
  type ToastCardProps,
  type TooltipProps,
} from "./components";

describe("the components barrel", () => {
  it("exposes the ui, form, and table surface with real prop contracts", () => {
    expectTypeOf(Button).toBeFunction();
    expectTypeOf(Card).toBeFunction();
    expectTypeOf(Icon).toBeFunction();
    expectTypeOf(Stack).toBeFunction();
    expectTypeOf(Text).toBeFunction();
    expectTypeOf(ToastCard).toBeFunction();
    expectTypeOf(Tooltip).toBeFunction();

    expectTypeOf(Checkbox).toBeFunction();
    expectTypeOf(Combobox).toBeFunction();
    expectTypeOf(DatePicker).toBeFunction();
    expectTypeOf(FormField).toBeFunction();
    expectTypeOf(Input).toBeFunction();
    expectTypeOf(MultiSelect).toBeFunction();
    expectTypeOf(Toggle).toBeFunction();

    expectTypeOf(DataTableGrid).toBeFunction();

    expectTypeOf<TooltipProps["open"]>().toEqualTypeOf<boolean | undefined>();
    expectTypeOf<ToastCardProps["variant"]>().not.toBeUnknown();
  });
});
