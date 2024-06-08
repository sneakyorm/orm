import { BaseModel } from "@/models"
import { deepcopy } from "@/utils"

/**
 * The `ModelBranch` class represents a branch of data in a model.
 * It provides methods for managing the state of the model, including backup, restore, copy, and merge operations.
 */
export class ModelBranch<T extends BaseModel> {
  $defaultData: any
  $backupData?: any
  $master?: ModelBranch<T>

  constructor(public $model: T) {
    this.$defaultData = $model.toRepresentation()
  }

  /**
   * Resets the model to its default state.
   */
  $reset() {
    this.$model.resetFromData(deepcopy(this.$defaultData))
  }

  /**
   * Creates a backup of the current state of the model.
   */
  $backup() {
    this.$backupData = this.$model.toRepresentation()
  }

  /**
   * Restores the model to its backup state.
   */
  $restore() {
    this.$model.resetFromData(this.$backupData)
  }

  /**
   * Creates a copy of this branch, including its default data and master branch.
   */
  $copy() {
    // TODO Maybe we should use deep clone
    const newBranch = useBranch<T>((this.$model.constructor as typeof BaseModel).create(this.$model.toRepresentation()))
    newBranch.$defaultData = deepcopy(this.$defaultData)
    newBranch.$master = this.$master
    return newBranch
  }

  /**
   * Creates a new branch based on this branch.
   */
  $subBranch() {
    const newBranch = useBranch<T>((this.$model.constructor as typeof BaseModel).create(this.$model.toRepresentation()))
    newBranch.$master = this
    return newBranch
  }
  /**
   * Merges this branch with another branch.
   */
  $merge(other: ModelBranch<T>, commitToTopLevel = false) {
    this.$model.resetFromData(other.$model.toRepresentation())
    if (commitToTopLevel) this.$commit(commitToTopLevel)
  }

  /**
   * Commits the changes to the master branch.
   */
  $commit(commitToTopLevel = true) {
    this.$master?.$merge(this, commitToTopLevel)
  }
}

type Branch<T extends BaseModel> = T & ModelBranch<T>

/**
 * Creates a new branch based on the given model.
 */
export function useBranch<T extends BaseModel>(model: T): Branch<T> {
  return new Proxy(new ModelBranch(model), {
    get(target: any, prop) {
      return prop in model ? (model as any)[prop] : target[prop]
    },
    set(target, prop, value) {
      ;(model as any)[prop] = value
      return true
    },
  }) as Branch<T>
}
