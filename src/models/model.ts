import { Field } from "@/fields"
import { assign } from "@/utils"
import { BaseModel, ModelFields, ModelType, UnwrapFields } from "./baseModel"
import { ModelSet } from "./modelSet"

/**
 * Base class for all models.
 */
export class Model extends BaseModel {
  static fields: Record<string, Field> = {}

  declare errors?: Record<string, any>

  static create<T extends Model>(this: new () => T, data?: Partial<ModelFields<T>>) {
    const inst = new this()
    for (const [name, field] of Object.entries((this as unknown as typeof Model).fields)) {
      if ((inst as any)[name] === undefined) (inst as any)[name] = field.default
    }
    if (data) assign(inst, (this as unknown as typeof Model).toInternalValue(data))
    return inst
  }

  static toInternalValue(data: any): any {
    const obj: Record<string, any> = {}
    for (const [name, field] of Object.entries(this.fields)) {
      let value = data[field.source ?? name]
      if (value !== undefined) obj[name] = field.toInternalValue(value)
    }
    return obj
  }

  static toRepresentation(data: any) {
    const obj: Record<string, any> = {}
    for (const [name, field] of Object.entries(this.fields)) {
      if (field.readonly) continue
      if (field.nullable && data === null) var value = null
      else var value = field.toRepresentation(data[name])
      obj[field.source ?? name] = value
    }
    return obj
  }

  static runValidators(value: any) {
    const errors: Record<string, any> = {}
    for (const [name, field] of Object.entries(this.fields)) {
      let error
      if ((error = field.runValidators(value[name])) !== undefined) {
        errors[name] = error
      }
    }
    if (!Object.keys(errors).length) return
    return errors
  }

  static exclude<T, K extends keyof T = keyof T>(
    this: new () => T,
    ...fields: K[]
  ): ModelType<Omit<T, K>, typeof Model> {
    const ModelClass = this as unknown as typeof Model
    return class extends ModelClass {
      static fields = Object.fromEntries(Object.entries(ModelClass.fields).filter(([k]) => !fields.includes(k as K)))
    } as any
  }

  static include<T, Fields extends Record<string, Field>>(
    this: new () => T,
    fields: Fields,
  ): ModelType<T & UnwrapFields<Fields>, typeof Model> {
    const ModelClass = this as unknown as typeof Model
    return class extends ModelClass {
      static fields = { ...ModelClass.fields, ...fields }
    } as any
  }

  toRepresentation() {
    return (this.constructor as typeof Model).toRepresentation(this)
  }

  runValidators() {
    return (this.constructor as typeof Model).runValidators(this)
  }

  validate(): boolean {
    this.errors = this.runValidators()
    return !Object.keys(this.errors ?? {}).length
  }

  resetFromData(data: Partial<ModelFields<this>>) {
    return assign(this, (this.constructor as typeof Model).toInternalValue(data))
  }

  static get Set() {
    const ModelClass = this
    class ItModelSet extends ModelSet {
      static model = ModelClass
    }
    Object.defineProperty(this, "Set", { value: ItModelSet })
    return ItModelSet
  }
}
