import { after } from "next/server"

// Inside a request, the send runs after the response so a slow third party
// never delays it. Outside one (scripts, tests), after() throws and we send inline.
export function sendWithoutBlocking(send: () => Promise<void>): Promise<void> {
  try {
    after(send)
    return Promise.resolve()
  } catch {
    return send()
  }
}
