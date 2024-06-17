import { Validator } from "@/validators"
import { fieldDecorator } from "./createFieldDecorator"
import { Field, FieldOptions } from "./field"

export class FloatField extends Field<number> {
  static defaultValidators: Validator[] = [(v) => typeof v === "number" || "Must be a float"]

  get default() {
    return 0
  }
}

export const floatField = fieldDecorator<FieldOptions<number>>(FloatField)
