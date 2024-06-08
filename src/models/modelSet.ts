import { assert_ok, throwError } from "@/errors"
import { ValidateErrorType } from "@/validators"
import { BaseModel, ModelType } from "./baseModel"

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
    return (target: any) => {
      this.model = target
      Object.defineProperty(target, "Set", { get: () => this })
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
