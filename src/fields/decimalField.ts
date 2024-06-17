import { Validator } from "@/validators"
import { Decimal } from "decimal.js"
import { fieldDecorator } from "./createFieldDecorator"
import { Field, FieldOptions } from "./field"

export class DecimalField extends Field<Decimal> {
  static defaultValidators: Validator[] = [(v) => v instanceof Decimal || "Must be a decimal"]

  get default(): Decimal {
    return new Decimal(0)
  }

  toInternalValue(data: any): Decimal {
    return new Decimal(data)
  }

  toRepresentationValue(data: Decimal): string {
    return data.toString()
  }
}

export const decimalField = fieldDecorator<FieldOptions<Decimal>>(DecimalField)
