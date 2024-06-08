import { Validator } from "@/validators"
import { Field, FieldOptions } from "./field"

export class BooleanField extends Field<boolean> {
  static defaultValidators: Validator[] = [(v) => typeof v === "boolean" || "Must be a boolean"]

  get default() {
    return false
  }
}

export function booleanField(options?: FieldOptions<boolean>) {
  return BooleanField.create(options).call
}
