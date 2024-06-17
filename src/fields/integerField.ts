import { Validator } from "@/validators"
import { fieldDecorator } from "./createFieldDecorator"
import { Field, FieldOptions } from "./field"

export class IntegerField extends Field<number> {
  static defaultValidators: Validator[] = [
    (v) => (typeof v === "number" && Number.isInteger(v)) || "Must be an integer",
  ]

  get default() {
    return 0
  }
}

export const integerField = fieldDecorator<FieldOptions<number>>(IntegerField)
