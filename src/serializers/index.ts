import { ValidateErrorType } from "@/validators"

export class Serializer {
  /**
   * Converts the given data to its internal representation.
   */
  toInternalValue(data: any): any {
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
  runValidators(value: any): ValidateErrorType | undefined {
    return
  }
}
