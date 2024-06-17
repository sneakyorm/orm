import { Validator } from "@/validators"
import { fieldDecorator } from "./createFieldDecorator"
import { DateTimeField, DateTimeFieldOptions } from "./dateTimeField"

export class DateField extends DateTimeField {
  static defaultValidators: Validator[] = [(v) => v instanceof Date || "Must be a Date"]
  static defaultFormat = "yyyy-MM-dd"
  static defaultTimeZone = DateTimeField.defaultTimeZone
}

export const dateField = fieldDecorator<DateTimeFieldOptions>(DateField)
