import { Field, FieldType } from "./base"

export function fieldDecorator<T extends Field, OptsT>(fieldType: FieldType<T, OptsT>) {
  function decorator(options?: OptsT): (target: any, propertyKey: string) => void

  function decorator(target: any, propertyKey: string): void

  function decorator(optionsOrTarget?: any, propertyKey?: string) {
    if (propertyKey) return fieldType.create().call(optionsOrTarget, propertyKey)
    return fieldType.create(optionsOrTarget).call
  }

  return decorator
}
