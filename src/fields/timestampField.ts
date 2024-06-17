import { Validator } from "@/validators"
import { toZonedTime } from "date-fns-tz"
import { fieldDecorator } from "./createFieldDecorator"
import { Field, FieldOptions } from "./field"

export type TimestampFieldOptions = FieldOptions<Date> & { format?: string; timeZone?: string }

export class TimestampField extends Field<Date> {
  static defaultValidators: Validator[] = [(v) => v instanceof Date || "Must be a Date"]
  static defaultTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone

  timeZone!: string

  static create(options?: TimestampFieldOptions) {
    return super.create(options)
  }

  init(options?: TimestampFieldOptions) {
    super.init(options)
    this.timeZone = options?.timeZone || (this.constructor as typeof TimestampField).defaultTimeZone
  }

  toInternalValue(data: any) {
    return new Date(data)
  }

  toRepresentation(data: Date): any {
    return toZonedTime(data, this.timeZone).getTime()
  }

  get default() {
    return new Date()
  }
}

export const timestampField = fieldDecorator<TimestampFieldOptions>(TimestampField)
