import { Validator } from "@/validators"
import { Field, FieldOptions } from "./field"

export class StringField extends Field<string> {
  static defaultValidators: Validator[] = [(v) => typeof v === "string" || "Must be a string"]

  get default() {
    return ""
  }
}

export function stringField(options?: FieldOptions<string>) {
  return StringField.create(options).call
}
