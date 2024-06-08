import { Validator } from "@/validators"
import { Field, FieldOptions } from "./field"

export class FloatField extends Field<number> {
  static defaultValidators: Validator[] = [(v) => typeof v === "number" || "Must be a float"]

  get default() {
    return 0
  }
}

export function floatField(options?: FieldOptions<number>) {
  return FloatField.create(options).call
}
