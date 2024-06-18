import { Model } from "@/models"
import { Serializer } from "@/serializers"
import { ValidateErrorType, Validator, getError } from "@/validators"
import "reflect-metadata"

export type FieldType<T extends Field, OptsT> = {
  new (): T & { init: (options?: OptsT) => void }
  create: (options?: any) => T
}

export type FieldOptions<Type = any> = {
  source?: string
  type?: any
  validators?: Validator<Type>[]
  nullable?: boolean
  readonly?: boolean
  many?: boolean
  default?: () => Type
}

/**
 * Base class for all fields.
 */
export class Field<T = any> implements Serializer {
  static fieldOptions?: FieldOptions
  static defaultValidators: Validator[] = []

  source?: string
  type?: any
  validators?: Validator<T>[]
  nullable?: boolean
  readonly?: boolean

  /**
   * Creates a new instance of the specified field class and initializes it with the provided options.
   */
  static create(this: new (options?: FieldOptions<any>) => Field<any>, options?: FieldOptions<any>) {
    const inst: Field = new this(options)
    inst.init(options)
    if (options?.many) return ListField.create({ child: inst })
    return inst
  }

  init(options?: FieldOptions<T>) {
    this.source = options?.source ?? this.source
    this.validators = options?.validators ?? this.validators
    this.nullable = options?.nullable ?? this.nullable
    this.readonly = options?.readonly ?? this.readonly
    if (options?.default) Object.defineProperty(this, "default", { get: options.default })
  }

  get call() {
    return (target: { constructor: typeof Model }, propertyKey: string) => {
      if (!Object.prototype.hasOwnProperty.call(target.constructor, "fields")) target.constructor.fields = {}
      const type = Reflect.getMetadata("design:type", target, propertyKey)
      this.type = this.processTypeClass(this.type || type)
      if (this.nullable === undefined) this.nullable = type === Object
      target.constructor.fields[propertyKey] = this
    }
  }

  processTypeClass(type: any): any {
    return type
  }

  /**
   * Converts the given data to its internal representation.
   */
  toInternalValue(data: any): T {
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

  get default(): T {
    return undefined as T
  }
}

export type ListFieldOptions<T> = FieldOptions<T[]> & { child?: Field }

/**
 * Base class for all list fields.
 */
export class ListField<T = any> extends Field<T[]> {
  static defaultValidators: Validator[] = [(v) => Array.isArray(v) || "Must be an array"]
  static defaultChild: Field = new Field()

  child!: Field

  static create<T>(options?: ListFieldOptions<T>) {
    const inst = new this()
    inst.init(options)
    return inst
  }

  init(options?: any): void {
    this.child = options?.child ?? this.child ?? (this.constructor as typeof ListField).defaultChild
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
