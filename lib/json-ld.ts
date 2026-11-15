// JSON.stringify leaves "<" intact, so user text containing "</script>" would
// close the JSON-LD tag and inject markup. < is equivalent inside JSON.
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c")
}
