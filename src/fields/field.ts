import { Serializer } from "@/serializers"
import { ValidateErrorType, Validator, getError } from "@/validators"
import "reflect-metadata"

export type FieldOptions<Type = any> = {
  source?: string
  type?: any
  validators?: Validator<Type>[]
  nullable?: boolean
  readonly?: boolean
  many?: boolean
}

/**
 * Base class for all fields.
 */
export class Field<Type = any> implements Serializer {
  static defaultValidators: Validator[] = []

  source?: string
  type?: any
  validators?: Validator<Type>[]
  nullable?: boolean
  readonly?: boolean

  constructor(options?: FieldOptions<Type>) {
    this.source = options?.source
    this.validators = options?.validators
    this.nullable = options?.nullable
    this.readonly = options?.readonly
  }

  /**
   * Creates a new instance of the specified field class and initializes it with the provided options.
   */
  static create<T>(this: new (options?: FieldOptions<T>) => Field<T>, options?: FieldOptions<T>) {
    let inst: Field = new this(options)
    if (options?.many) {
      inst = new ListField({ child: inst })
    }
    return inst
  }

  get call() {
    return (target: any, propertyKey: string) => {
      if (!Object.keys(target.constructor).includes("fields")) target.constructor.fields = {}
      if (propertyKey in target.constructor.fields) return
      const type = Reflect.getMetadata("design:type", target, propertyKey)
      this.type = this.type || type
      this._validateType(this.type)
      if (this.nullable === undefined) this.nullable = type === Object
      target.constructor.fields[propertyKey] = this
    }
  }

  _validateType(type: any) {}

  /**
   * Converts the given data to its internal representation.
   */
  toInternalValue(data: any): Type {
    return data
  }

  /**
   * Converts the given data to its external representation.
   */
  toRepresentation(data: any): any {
    return data
  }

  /**
   * Runs the validators for the given value and returns any validation errors found.
   */
  runValidators(value: any) {
    if (value === null || value === undefined) {
      if (this.nullable) return
      throw new Error("Value cannot be null")
    }
    for (const validator of [...(this.constructor as typeof Field).defaultValidators, ...(this.validators || [])]) {
      const error = getError(validator(value))
      if (error !== undefined) return error
    }
  }

  get default(): Type {
    return undefined as Type
  }
}

/**
 * Base class for all list fields.
 */
export class ListField<Type = any> extends Field<Type[]> {
  static defaultValidators: Validator[] = [(v) => Array.isArray(v) || "Must be an array"]
  static defaultChild: Field = new Field()

  child: Field

  constructor(options?: FieldOptions<Type[]> & { child: Field }) {
    super(options)
    this.child = options?.child || (this.constructor as typeof ListField).defaultChild
  }

  runValidators(value: any[]) {
    if (value === null || value === undefined) {
      if (this.nullable) return
      throw new Error("Value cannot be null")
    }
    const errors: Record<string, ValidateErrorType> = {}
    for (const [index, i] of Object.entries(value)) {
      const error = this.child.runValidators(i)
      if (error !== undefined) errors[index] = i
    }
    return errors
  }

  get default() {
    return []
  }
}
