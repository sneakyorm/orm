import { Validator } from "@/validators"
import { DateTimeField, DateTimeFieldOptions } from "./dateTimeField"

export class DateField extends DateTimeField {
  static defaultValidators: Validator[] = [(v) => v instanceof Date || "Must be a Date"]
  static defaultFormat = "yyyy-MM-dd"
  static defaultTimeZone = DateTimeField.defaultTimeZone
}

export function dateField(options?: DateTimeFieldOptions) {
  return DateField.create(options).call
}
