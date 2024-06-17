import { NotImplementedError } from "@/errors"
import { Serializer } from "@/serializers"
import { assign } from "@/utils"

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
