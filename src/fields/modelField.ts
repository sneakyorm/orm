import { assert_ok } from "@/errors"
import { BaseModel, ModelSet, ModelType } from "@/models"
import { Validator } from "@/validators"
import { fieldDecorator } from "./createFieldDecorator"
import { Field, FieldOptions } from "./field"

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

  _validateType(type: any) {
    assert_ok(type !== Object, "Please specify the type of the model field")
  }

  init(options?: ModelFieldOptions<T>) {
    super.init(options)
    if (options?.type) this.type = options?.type
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

export const modelField = fieldDecorator<ModelFieldOptions>(ModelField)
