import { Validator } from "@/validators"
import { toZonedTime } from "date-fns-tz"
import { Field, FieldOptions } from "./field"

export type TimestampFieldOptions = FieldOptions<Date> & { format?: string; timeZone?: string }

export class TimestampField extends Field<Date> {
  static defaultValidators: Validator[] = [(v) => v instanceof Date || "Must be a Date"]
  static defaultTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone

  timeZone: string

  constructor(options?: TimestampFieldOptions) {
    super(options)
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

export function timestampField(options?: TimestampFieldOptions) {
  return TimestampField.create(options).call
}
