import { describe, test, expect, mock, beforeEach, spyOn } from "bun:test"
import { renderToStaticMarkup } from "react-dom/server"
import type { ReactElement } from "react"
import { SUPPORT_EMAIL } from "./urls"

const mockSend = mock((...args: [unknown]) => {
  void args
  return Promise.resolve({ data: { id: "email-1" }, error: null })
})

class FakeResend {
  emails = { send: mockSend }
}

mock.module("resend", () => ({ Resend: FakeResend }))

const {
  sendWelcome,
  sendSubscriptionConfirmation,
  sendPaymentFailed,
  sendRenewalReminder,
  sendSubscriptionCancelled,
  sendResetPasswordEmail,
  sendVerificationEmail,
  sendPropertyLimitReached,
  sendReengagement,
  sendWinback,
} = await import("./email")
const { unsubscribeToken } = await import("./unsubscribe")

beforeEach(() => {
  mockSend.mockClear()
})

function lastCall(): { from: string; to: string; subject: string; react?: unknown; html?: string; replyTo?: string } {
  return mockSend.mock.calls[0][0] as ReturnType<typeof lastCall>
}

describe("sender and reply address", () => {
  const sends: [string, () => Promise<void>][] = [
    ["sendWelcome", () => sendWelcome("agent@example.com", "Luis")],
    ["sendSubscriptionConfirmation", () => sendSubscriptionConfirmation("agent@example.com", "Luis")],
    ["sendPaymentFailed", () => sendPaymentFailed("agent@example.com", "Luis")],
    ["sendRenewalReminder", () => sendRenewalReminder("agent@example.com", "Luis", new Date("2026-08-15"), true)],
    ["sendSubscriptionCancelled", () => sendSubscriptionCancelled("agent@example.com", "Luis")],
    ["sendResetPasswordEmail", () => sendResetPasswordEmail("agent@example.com", "Luis", "https://conexory.com/r?t=a")],
    ["sendVerificationEmail", () => sendVerificationEmail("agent@example.com", "Luis", "https://conexory.com/v?t=a")],
  ]

  test.each(sends)("%s sends from no-reply and routes replies to support", async (_name, send) => {
    await send()
    const call = lastCall()
    expect(call.from).toBe("Conexory <no-reply@conexory.com>")
    expect(call.replyTo).toBe(SUPPORT_EMAIL)
  })
})

describe("sendWelcome", () => {
  test("sends from the verified domain with the right subject and recipient", async () => {
    await sendWelcome("agent@example.com", "Luis Ramirez")
    const call = lastCall()
    expect(call.from).toBe("Conexory <no-reply@conexory.com>")
    expect(call.to).toBe("agent@example.com")
    expect(call.subject).toBe("Bienvenido a Conexory")
    expect(call.react).toBeDefined()
  })

  test("renders a greeting with the recipient's first name and the dashboard link", async () => {
    await sendWelcome("agent@example.com", "Luis Ramirez")
    const html = renderToStaticMarkup(lastCall().react as ReactElement)
    expect(html).toContain("Hola, Luis")
    expect(html).toContain("/dashboard/properties/new")
  })
})

describe("sendSubscriptionConfirmation", () => {
  test("sends the Pro welcome subject", async () => {
    await sendSubscriptionConfirmation("agent@example.com", "Luis")
    expect(lastCall().subject).toBe("¡Bienvenido a Conexory Pro!")
  })
})

describe("sendPaymentFailed", () => {
  test("sends the payment-failed subject", async () => {
    await sendPaymentFailed("agent@example.com", "Luis")
    expect(lastCall().subject).toBe("No pudimos cobrar tu plan Pro de Conexory")
  })
})

describe("sendRenewalReminder", () => {
  test("sends the renewal reminder with a rendered date", async () => {
    await sendRenewalReminder("agent@example.com", "Luis", new Date("2026-08-15"), true)
    const call = lastCall()
    expect(call.subject).toBe("Tu plan Pro de Conexory se renueva pronto")
    expect(call.react).toBeDefined()
  })

  test("mentions the saved payment method when there is one", async () => {
    await sendRenewalReminder("agent@example.com", "Luis", new Date("2026-08-15"), true)
    const html = renderToStaticMarkup(lastCall().react as ReactElement)
    expect(html).toContain("con el")
    expect(html).toContain("método de pago que tienes registrado")
  })

  test("asks the user to add a payment method when there isn't one", async () => {
    await sendRenewalReminder("agent@example.com", "Luis", new Date("2026-08-15"), false)
    const html = renderToStaticMarkup(lastCall().react as ReactElement)
    expect(html).toContain("no tenemos un método de")
  })
})

describe("sendSubscriptionCancelled", () => {
  test("sends the cancellation subject", async () => {
    await sendSubscriptionCancelled("agent@example.com", "Luis")
    expect(lastCall().subject).toBe("Tu plan Pro de Conexory fue cancelado")
  })
})

describe("sendResetPasswordEmail", () => {
  test("sends the reset-password subject with the reset url", async () => {
    await sendResetPasswordEmail("agent@example.com", "Luis", "https://conexory.com/reset-password?token=abc")
    expect(lastCall().subject).toBe("Recupera tu contraseña de Conexory")
  })
})

describe("sendVerificationEmail", () => {
  test("sends the verification subject with the verify url", async () => {
    await sendVerificationEmail("agent@example.com", "Luis", "https://conexory.com/verify?token=abc")
    expect(lastCall().subject).toBe("Confirma tu correo de Conexory")
  })
})

describe("failed sends", () => {
  test("reports Resend's returned error without the recipient's address", async () => {
    const consoleError = spyOn(console, "error").mockImplementation(() => {})
    mockSend.mockImplementationOnce(() =>
      Promise.resolve({
        data: null,
        error: { name: "validation_error", message: "Invalid `to` field: agent@example.com" },
      } as never),
    )
    try {
      await sendResetPasswordEmail("agent@example.com", "Luis", "https://conexory.com/reset?token=x")
      expect(consoleError).toHaveBeenCalledWith("Email failed to send: reset_password", {
        template: "reset_password",
        errorName: "validation_error",
        errorMessage: "Invalid `to` field: [email]",
      })
    } finally {
      consoleError.mockRestore()
    }
  })

  test("stays quiet when the send succeeds", async () => {
    const consoleError = spyOn(console, "error").mockImplementation(() => {})
    try {
      await sendWelcome("agent@example.com", "Luis")
      expect(consoleError).not.toHaveBeenCalledWith(expect.stringContaining("Email failed"), expect.anything())
    } finally {
      consoleError.mockRestore()
    }
  })
})

describe("lifecycle emails", () => {
  const user = { id: "u1", email: "agent@example.com", name: "Luis Ramirez" }
  type LifecycleCall = ReturnType<typeof lastCall> & { headers?: Record<string, string> }

  const cases = [
    { send: sendPropertyLimitReached, subject: "Llegaste a tus 3 propiedades gratis en Conexory", cta: "/dashboard/upgrade" },
    { send: sendReengagement, subject: "Tu primera propiedad en Conexory está a un minuto", cta: "/dashboard/properties/new" },
    { send: sendWinback, subject: "Tu plan Pro de Conexory te está esperando", cta: "/dashboard/upgrade" },
  ]

  for (const { send, subject, cta } of cases) {
    test(`${subject}: subject, CTA and unsubscribe link`, async () => {
      await send(user)
      const call = lastCall() as LifecycleCall
      expect(call.from).toBe("Conexory <no-reply@conexory.com>")
      expect(call.replyTo).toBe(SUPPORT_EMAIL)
      expect(call.to).toBe("agent@example.com")
      expect(call.subject).toBe(subject)
      const html = renderToStaticMarkup(call.react as ReactElement)
      expect(html).toContain("Hola, Luis")
      expect(html).toContain(cta)
      expect(html).toContain(`/email/baja?token=${encodeURIComponent(unsubscribeToken("u1"))}`)
      expect(html).toContain("Dejar de recibir estos correos")
    })

    test(`${subject}: one-click unsubscribe headers`, async () => {
      await send(user)
      const { headers } = lastCall() as LifecycleCall
      expect(headers?.["List-Unsubscribe"]).toMatch(/^<.+\/api\/email\/unsubscribe\?token=.+>$/)
      expect(headers?.["List-Unsubscribe-Post"]).toBe("List-Unsubscribe=One-Click")
    })
  }

  test("transactional emails carry no unsubscribe link", async () => {
    await sendWelcome("agent@example.com", "Luis")
    const html = renderToStaticMarkup(lastCall().react as ReactElement)
    expect(html).not.toContain("Dejar de recibir estos correos")
  })
})
