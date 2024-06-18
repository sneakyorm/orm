import { assert_ok } from "@/errors"
import { BaseModel, ModelSet, ModelType } from "@/models"
import { Validator } from "@/validators"
import { format as formatDate, toZonedTime } from "date-fns-tz"
import { Decimal } from "decimal.js"
import { Field, FieldOptions } from "./base"
import { fieldDecorator } from "./fieldDecorator"

export class StringField extends Field<string> {
  static defaultValidators: Validator[] = [(v) => typeof v === "string" || "Must be a string"]

  get default() {
    return ""
  }
}
export const stringField = fieldDecorator(StringField)

export class IntegerField extends Field<number> {
  static defaultValidators: Validator[] = [
    (v) => (typeof v === "number" && Number.isInteger(v)) || "Must be an integer",
  ]

  get default() {
    return 0
  }
}
export const integerField = fieldDecorator(IntegerField)

export class FloatField extends Field<number> {
  static defaultValidators: Validator[] = [(v) => typeof v === "number" || "Must be a float"]

  get default() {
    return 0
  }
}
export const floatField = fieldDecorator(FloatField)

export class BooleanField extends Field<boolean> {
  static defaultValidators: Validator[] = [(v) => typeof v === "boolean" || "Must be a boolean"]

  get default() {
    return false
  }
}
export const booleanField = fieldDecorator(BooleanField)

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
export const timestampField = fieldDecorator(TimestampField)

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
export const dateTimeField = fieldDecorator(DateTimeField)

export class DateField extends DateTimeField {
  static defaultValidators: Validator[] = [(v) => v instanceof Date || "Must be a Date"]
  static defaultFormat = "yyyy-MM-dd"
  static defaultTimeZone = DateTimeField.defaultTimeZone
}
export const dateField = fieldDecorator(DateField)

export class DecimalField extends Field<Decimal> {
  static defaultValidators: Validator[] = [(v) => v instanceof Decimal || "Must be a decimal"]

  toInternalValue(data: any): Decimal {
    return new Decimal(data)
  }

  toRepresentationValue(data: Decimal): string {
    return data.toString()
  }

  get default(): Decimal {
    return new Decimal(0)
  }
}
export const decimalField = fieldDecorator(DecimalField)

export type ModelFieldOptions<T extends BaseModel = BaseModel> = FieldOptions<T> & { type?: ModelType<T> }
export class ModelField<T extends BaseModel> extends Field<T> {
  static defaultValidators: Validator[] = [
    (v) => v instanceof BaseModel || v instanceof ModelSet || "Must be an instance of Model",
    (v) => v.runValidators() || true,
  ]

  declare type: ModelType<T>

  static create(options?: ModelFieldOptions) {
    return super.create(options)
  }

  init(options?: ModelFieldOptions<T>) {
    super.init(options)
    if (options?.type) this.type = options?.type
  }

  processTypeClass(type: any) {
    assert_ok(type !== Object, "Please specify the type of the model field")
    return type
  }

  toInternalValue(data: any): T {
    return this.type.create(data)
  }

  toRepresentation(data: T) {
    return data.toRepresentation()
  }

  get default() {
    return this.type.create()
  }
}
export const modelField = fieldDecorator(ModelField)
