import { Field, FieldType } from "./field"

export function fieldDecorator<OptsT, T extends Field = Field>(fieldType: FieldType<T>) {
  function decorator(options?: OptsT): (target: any, propertyKey: string) => void

  function decorator(target: any, propertyKey: string): void

  function decorator(optionsOrTarget?: any, propertyKey?: string) {
    if (propertyKey) return fieldType.create().call(optionsOrTarget, propertyKey)
    return fieldType.create(optionsOrTarget).call
  }

  return decorator
}
