import { assert_ok } from "@/errors"
import { BaseModel, ModelSet, ModelType } from "@/models"
import { Validator } from "@/validators"
import { Field, FieldOptions } from "./field"

export type ModelFieldOptions<T> = FieldOptions<T> & { type: ModelType<T> }

export class ModelField<T extends BaseModel> extends Field<T> {
  static defaultValidators: Validator[] = [
    (v) => v instanceof BaseModel || v instanceof ModelSet || "Must be an instance of Model",
    (v) => v.runValidators() || true,
  ]

  declare type: ModelType<T>

  constructor(options?: ModelFieldOptions<T>) {
    super(options)
    if (options?.type) this.type = options?.type
  }

  static create<T>(options?: ModelFieldOptions<T>) {
    return super.create<T>(options)
  }

  _validateType(type: any) {
    assert_ok(type !== Object, "Please specify the type of the model field")
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

export function modelField<T extends BaseModel>(options?: ModelFieldOptions<T>) {
  return ModelField.create(options).call
}
