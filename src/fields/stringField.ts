import { Validator } from "@/validators"
import { fieldDecorator } from "./createFieldDecorator"
import { Field, FieldOptions } from "./field"

export class StringField extends Field<string> {
  static defaultValidators: Validator[] = [(v) => typeof v === "string" || "Must be a string"]

  get default() {
    return ""
  }
}

export const stringField = fieldDecorator<FieldOptions<string>>(StringField)
