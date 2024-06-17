import { Validator } from "@/validators"
import { fieldDecorator } from "./createFieldDecorator"
import { Field, FieldOptions } from "./field"

export class BooleanField extends Field<boolean> {
  static defaultValidators: Validator[] = [(v) => typeof v === "boolean" || "Must be a boolean"]

  get default() {
    return false
  }
}

export const booleanField = fieldDecorator<FieldOptions<boolean>>(BooleanField)
