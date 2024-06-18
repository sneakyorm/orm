import { NotImplementedError, assert_ok, throwError } from "@/errors"
import { Field } from "@/fields"
import { Serializer } from "@/serializers"
import { assign } from "@/utils"
import { ValidateErrorType } from "@/validators"

export type ModelType<T = any, Base extends typeof BaseModel = typeof BaseModel> = Omit<Base, "create"> & {
  new (): T
  create: ((data?: any) => T) & Base["create"]
} & Serializer

export type ModelInst<T extends ModelType> = T extends ModelType<infer Type> ? Type : never

export class BaseModel {
  /**
   * An object containing any validation errors found.
   */
  errors?: any

  /**
   * Creates a new instance of the class using the provided data.
   */
  static create(data?: any): any {
    throw new NotImplementedError()
  }

  /**
   * Converts the given data to its internal representation.
   */
  static toInternalValue(data: any): any {
    throw new NotImplementedError()
  }

  /**
   * Converts the given data to its external representation.
   */
  static toRepresentation(data: any): any {
    throw new NotImplementedError()
  }

  /**
   * Runs the validators for each field in the model and returns any errors found.
   */
  static runValidators(value: any): any {
    throw new NotImplementedError()
  }

  /**
   * Returns the representation of the model instance.
   */
  toRepresentation() {
    return (this.constructor as typeof BaseModel).toRepresentation(this)
  }

  /**
   * Runs the validators for the current model instance and returns any validation errors found.
   */
  runValidators() {
    return (this.constructor as typeof BaseModel).runValidators(this)
  }

  /**
   * Validates the current instance whether the instance is valid or not.
   */
  validate(): boolean {
    this.errors = this.runValidators()
    return !Object.keys(this.errors ?? {}).length
  }

  resetFromData(data: any) {
    assign(this, (this.constructor as typeof BaseModel).toInternalValue(data))
  }
}

export type UnwrapFields<T> = { [K in keyof T]: T[K] extends Field<infer Type> ? Type : T[K] }

export type ModelFields<T> = Omit<
  Pick<T, { [K in keyof T]: T[K] extends Function ? never : K }[keyof T]>,
  keyof BaseModel
>

export type ModelData<T extends Model> = Partial<ModelFields<T>> & Record<string, any>

/**
 * Base class for all models.
 */
export class Model extends BaseModel {
  static fields: Record<string, Field> = {}

  declare errors?: Record<string, any>

  static create<T extends Model>(this: new () => T, data?: ModelData<T>) {
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

  static get Set(): typeof ModelSet {
    const ModelClass = this
    class ItModelSet extends ModelSet {
      static model = ModelClass
    }
    Object.defineProperty(this, "Set", { value: ItModelSet })
    return ItModelSet as typeof ModelSet
  }

  static set Set(value) {
    Object.defineProperty(this, "Set", { value: value })
  }
}

export interface ArrayLike<T> {
  length: number

  get(index: number): T

  set(index: number, value: T): this

  forEach(fn: (x: T) => any): void

  filter(fn: (x: T) => boolean): this

  map(fn: (x: T) => any): this

  find(fn: (x: T) => boolean): T | undefined

  some(fn: (x: T) => boolean): boolean

  every(fn: (x: T) => boolean): boolean
}

/**
 * Base class for all model sets.
 */
export class ModelSet<T extends BaseModel = BaseModel> extends BaseModel implements ArrayLike<T> {
  declare errors?: ValidateErrorType[]
  list: T[] = []

  static create<T extends ModelSet>(this: new () => T, data?: any[]) {
    const inst = new this()
    if (data) inst.list = (this as unknown as typeof ModelSet).toInternalValue(data) as T[]
    return inst
  }

  static toInternalValue(data: any[]): any[] {
    assert_ok(Array.isArray(data), `Param data must be an array: ${data}`)
    return data.map((x) => this.model.create(x))
  }

  static toRepresentation(data: ModelSet) {
    return data.list.map((x) => x.toRepresentation())
  }

  static runValidators(value: ModelSet) {
    const errors = value.list.map((x) => x.runValidators()).filter((x) => x !== undefined) as ValidateErrorType[]
    if (!Object.keys(errors).length) return
    return errors
  }

  _setToNew(data: T[]) {
    const inst = (this.constructor as typeof ModelSet).create() as this
    inst.list = data
    return inst
  }

  toRepresentation() {
    return (this.constructor as typeof ModelSet).toRepresentation(this)
  }

  runValidators() {
    return (this.constructor as typeof ModelSet).runValidators(this)
  }

  validate(): boolean {
    this.errors = this.runValidators()
    return !Object.keys(this.errors ?? {}).length
  }

  resetFromData(data?: any[]) {
    this.list = (this.constructor as typeof ModelSet).toInternalValue(data || [])
    return this
  }

  get(index: number) {
    return this.list[index]
  }

  set(index: number, value: T) {
    this.list[index] = value
    return this
  }

  forEach(fn: (x: T) => any) {
    this.list.forEach(fn)
  }

  filter(fn: (x: T) => boolean) {
    return this._setToNew(this.list.filter(fn))
  }

  map(fn: (x: T) => any) {
    return this._setToNew(this.list.map(fn))
  }

  find(fn: (x: T) => boolean) {
    return this.list.find(fn)
  }

  some(fn: (x: T) => boolean) {
    return this.list.some(fn)
  }

  every(fn: (x: T) => boolean) {
    return this.list.every(fn)
  }

  static get bind() {
    return (target: typeof Model) => {
      this.model = target
      target.Set = this
    }
  }

  static get model(): ModelType {
    return throwError("ModelSet must be bound to a model")
  }

  static set model(v) {
    Object.defineProperty(this, "model", { value: v })
  }

  static get inst(): ModelSet {
    return throwError("This property is only for type annotation")
  }

  get length() {
    return this.list.length
  }

  set length(v) {
    this.list.length = v
  }
}
