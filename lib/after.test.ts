import { describe, test, expect, mock } from "bun:test"
import { sendWithoutBlocking } from "./after"

// next/server is mocked globally in test-setup.ts: after() throws, as outside a request.
describe("sendWithoutBlocking", () => {
  test("sends inline when called outside a request", async () => {
    const send = mock(() => Promise.resolve())

    await sendWithoutBlocking(send)

    expect(send).toHaveBeenCalledTimes(1)
  })
})
