import { dateTimeField, integerField, modelField, stringField } from "@/fields"
import { Model, ModelSet } from "@/models"

export class InfoSet extends ModelSet<Info> {}

@InfoSet.bind
export class Info extends Model {
  @stringField()
  name!: string
}

export class User extends Model {
  @stringField()
  name!: string
  @integerField()
  age: number = 999
  @stringField({ many: true })
  addresses!: string[]
  @modelField()
  info!: InfoSet
  @dateTimeField()
  createdAt!: Date
}
