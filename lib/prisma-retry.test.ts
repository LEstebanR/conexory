import { describe, test, expect } from "bun:test"
import { Prisma } from "@prisma/client"
import { isRetryableConnectionError, withConnectionRetry } from "./prisma-retry"

const CLIENT_VERSION = "6.19.3"
const UNREACHABLE_MESSAGE =
  "\nInvalid `prisma.property.findMany()` invocation:\n\n\nCan't reach database server at `ep-proud-unit-aqpl2g8k-pooler.c-8.us-east-1.aws.neon.tech:5432`"

function unreachableError() {
  return new Prisma.PrismaClientInitializationError(UNREACHABLE_MESSAGE, CLIENT_VERSION)
}

describe("isRetryableConnectionError", () => {
  test("detects an unreachable server even when Prisma stripped the error code", () => {
    const error = unreachableError()
    expect(error.errorCode).toBeUndefined()
    expect(isRetryableConnectionError(error)).toBe(true)
  })

  test("detects an unreachable server by error code", () => {
    expect(
      isRetryableConnectionError(
        new Prisma.PrismaClientInitializationError("boom", CLIENT_VERSION, "P1001"),
      ),
    ).toBe(true)
  })

  test("detects a connection closed by the server", () => {
    expect(
      isRetryableConnectionError(
        new Prisma.PrismaClientKnownRequestError("Server has closed the connection.", {
          code: "P1017",
          clientVersion: CLIENT_VERSION,
        }),
      ),
    ).toBe(true)
  })

  test("detects a WebSocket that the Neon adapter could not open", () => {
    const event = new ErrorEvent("error", {
      message: "Received network error or non-101 status code.",
    })
    expect(isRetryableConnectionError(event)).toBe(true)
  })

  test("detects a pooled connection that dropped or timed out", () => {
    expect(isRetryableConnectionError(new Error("Connection terminated unexpectedly"))).toBe(true)
    expect(
      isRetryableConnectionError(new Error("Connection terminated due to connection timeout")),
    ).toBe(true)
  })

  test("ignores a connection the app closed on purpose", () => {
    expect(isRetryableConnectionError(new Error("Connection terminated"))).toBe(false)
  })

  test("ignores authentication failures reported by the adapter", () => {
    expect(
      isRetryableConnectionError(
        new Prisma.PrismaClientKnownRequestError(
          "Authentication failed against the database server",
          { code: "P1000", clientVersion: CLIENT_VERSION },
        ),
      ),
    ).toBe(false)
  })

  test("ignores a misconfiguration that retrying cannot fix", () => {
    expect(
      isRetryableConnectionError(
        new Prisma.PrismaClientInitializationError(
          "error: Environment variable not found: DATABASE_URL.",
          CLIENT_VERSION,
        ),
      ),
    ).toBe(false)
  })

  test("ignores query errors and non-Prisma errors", () => {
    expect(
      isRetryableConnectionError(
        new Prisma.PrismaClientKnownRequestError("Unique constraint failed", {
          code: "P2002",
          clientVersion: CLIENT_VERSION,
        }),
      ),
    ).toBe(false)
    expect(isRetryableConnectionError(new Error("Can't reach database server"))).toBe(false)
    expect(isRetryableConnectionError(undefined)).toBe(false)
  })
})

describe("withConnectionRetry", () => {
  const noDelays = { delaysMs: [0, 0] }

  test("returns the result without retrying when the query succeeds", async () => {
    let calls = 0
    const result = await withConnectionRetry(async () => {
      calls++
      return "ok"
    }, noDelays)

    expect(result).toBe("ok")
    expect(calls).toBe(1)
  })

  test("retries a connection blip and returns the recovered result", async () => {
    let calls = 0
    const result = await withConnectionRetry(async () => {
      calls++
      if (calls < 3) throw unreachableError()
      return "ok"
    }, noDelays)

    expect(result).toBe("ok")
    expect(calls).toBe(3)
  })

  test("gives up after exhausting the retries", async () => {
    let calls = 0
    const run = withConnectionRetry(async () => {
      calls++
      throw unreachableError()
    }, noDelays)

    await expect(run).rejects.toThrow("Can't reach database server")
    expect(calls).toBe(3)
  })

  test("retries a WebSocket that failed to open", async () => {
    let calls = 0
    const result = await withConnectionRetry(async () => {
      calls++
      if (calls < 2) throw new ErrorEvent("error")
      return "ok"
    }, noDelays)

    expect(result).toBe("ok")
    expect(calls).toBe(2)
  })

  test("does not retry an error unrelated to the connection", async () => {
    let calls = 0
    const run = withConnectionRetry(async () => {
      calls++
      throw new Error("nope")
    }, noDelays)

    await expect(run).rejects.toThrow("nope")
    expect(calls).toBe(1)
  })
})
