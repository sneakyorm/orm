export type Validator<V = any> = (v: V) => true | ValidateErrorType

export type ValidateErrorType = string | string[] | Record<string, any>

export function getError(error: true | ValidateErrorType) {
  if (error !== true) {
    return error
  }
}

export function toValidateErrorType(error: ValidateErrorType | undefined) {
  if (error) return error
  return true
}
