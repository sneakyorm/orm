import { Validator } from "@/validators"
import { format as formatDate, toZonedTime } from "date-fns-tz"
import { fieldDecorator } from "./createFieldDecorator"
import { TimestampField, TimestampFieldOptions } from "./timestampField"

export type DateTimeFieldOptions = TimestampFieldOptions & { format?: string }

export class DateTimeField extends TimestampField {
  static defaultValidators: Validator[] = [(v) => v instanceof Date || "Must be a Date"]
  static defaultFormat = "yyyy-MM-dd HH:mm:ss"
  static defaultTimeZone = TimestampField.defaultTimeZone

  format!: string

  static create(options?: DateTimeFieldOptions) {
    return super.create(options)
  }

  init(options?: DateTimeFieldOptions) {
    super.init(options)
    this.format = options?.format || (this.constructor as typeof DateTimeField).defaultFormat
  }

  toRepresentation(data: Date): any {
    return formatDate(toZonedTime(data, this.timeZone), this.format)
  }
}

DateTimeField

export const dateTimeField = fieldDecorator<DateTimeFieldOptions>(DateTimeField)
