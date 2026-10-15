import { describe, expect, test } from "bun:test"
import { forgotPasswordSchema, loginSchema, registerSchema, resetPasswordSchema } from "./auth.schema"

const validRegister = {
  name: "Ana Gómez",
  email: "ana@example.com",
  password: "12345678",
  confirmPassword: "12345678",
  terms: "on",
}

function firstIssue(result: { success: boolean; error?: { issues: { path: PropertyKey[]; message: string }[] } }) {
  return result.error?.issues[0]
}

describe("loginSchema", () => {
  test("accepts an email and any non-empty password", () => {
    expect(loginSchema.safeParse({ email: "ana@example.com", password: "x" }).success).toBe(true)
  })

  test("rejects an invalid email with a Spanish message", () => {
    const issue = firstIssue(loginSchema.safeParse({ email: "ana", password: "x" }))
    expect(issue?.message).toBe("Ingresa un correo electrónico válido.")
  })
})

describe("registerSchema", () => {
  test("accepts a complete sign-up", () => {
    expect(registerSchema.safeParse(validRegister).success).toBe(true)
  })

  test("rejects a name made only of spaces", () => {
    const issue = firstIssue(registerSchema.safeParse({ ...validRegister, name: "   " }))
    expect(issue?.path).toEqual(["name"])
  })

  test("requires at least 8 characters", () => {
    const issue = firstIssue(
      registerSchema.safeParse({ ...validRegister, password: "1234567", confirmPassword: "1234567" })
    )
    expect(issue?.message).toBe("La contraseña debe tener al menos 8 caracteres.")
  })

  test("flags mismatched passwords on the confirmation field", () => {
    const issue = firstIssue(registerSchema.safeParse({ ...validRegister, confirmPassword: "87654321" }))
    expect(issue?.path).toEqual(["confirmPassword"])
    expect(issue?.message).toBe("Las contraseñas no coinciden.")
  })

  test("requires accepting the terms", () => {
    const issue = firstIssue(registerSchema.safeParse({ ...validRegister, terms: undefined }))
    expect(issue?.path).toEqual(["terms"])
  })
})

describe("forgotPasswordSchema", () => {
  test("validates the email", () => {
    expect(forgotPasswordSchema.safeParse({ email: "ana@example.com" }).success).toBe(true)
    expect(forgotPasswordSchema.safeParse({ email: "" }).success).toBe(false)
  })
})

describe("resetPasswordSchema", () => {
  test("requires the token", () => {
    const issue = firstIssue(
      resetPasswordSchema.safeParse({ token: "", password: "12345678", confirmPassword: "12345678" })
    )
    expect(issue?.path).toEqual(["token"])
  })

  test("flags mismatched passwords", () => {
    const issue = firstIssue(
      resetPasswordSchema.safeParse({ token: "t", password: "12345678", confirmPassword: "1234567x" })
    )
    expect(issue?.path).toEqual(["confirmPassword"])
  })
})
