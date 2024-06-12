import { ModelSet, useBranch } from "@/index"
import { User } from "./models"

test("Test Model", () => {
  const obj = User.create({ name: "Eugene Reese" })
  expect(obj.name).toEqual("Eugene Reese")
  expect(obj.toRepresentation()).toEqual({
    name: "Eugene Reese",
    age: 999,
    addresses: [],
    info: [],
    createdAt: expect.any(String),
  })
})

test("Test Operation Hint", () => {
  expect(() => ModelSet.model).toThrow()
  expect(() => ModelSet.inst).toThrow()
})

test("Test useBranch", () => {
  const user = useBranch(User.create({ name: "John" }))

  user.name = "John Doe"
  expect(user.name).toEqual("John Doe")
  user.$reset()
  expect(user.name).toEqual("John")

  user.name = "Bob"
  user.$backup()
  user.name = "Rob"
  user.$restore()
  expect(user.name).toEqual("Bob")

  const user2 = user.$subBranch()
  user2.name = "Ethan"
  expect(user.name).toEqual("Bob")
  expect(user2.name).toEqual("Ethan")
  user2.$commit()
  expect(user.name).toEqual("Ethan")

  const user3 = user.$copy()
  user3.name = "Tom"
  expect(user.name).toEqual("Ethan")
  expect(user3.name).toEqual("Tom")
})
