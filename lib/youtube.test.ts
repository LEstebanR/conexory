import { describe, test, expect } from "bun:test"
import { youtubeId, isYoutubeUrl, youtubeEmbedUrl, youtubeThumb } from "./youtube"

const VIDEO_ID = "dQw4w9WgXcQ"

describe("youtubeId", () => {
  test("extracts the id from a watch URL", () => {
    expect(youtubeId(`https://www.youtube.com/watch?v=${VIDEO_ID}`)).toBe(VIDEO_ID)
  })

  test("extracts the id from a youtu.be short URL", () => {
    expect(youtubeId(`https://youtu.be/${VIDEO_ID}`)).toBe(VIDEO_ID)
  })

  test("extracts the id from an embed URL", () => {
    expect(youtubeId(`https://www.youtube.com/embed/${VIDEO_ID}`)).toBe(VIDEO_ID)
  })

  test("extracts the id from a shorts URL", () => {
    expect(youtubeId(`https://www.youtube.com/shorts/${VIDEO_ID}`)).toBe(VIDEO_ID)
  })

  test("extracts the id from a live URL", () => {
    expect(youtubeId(`https://www.youtube.com/live/${VIDEO_ID}`)).toBe(VIDEO_ID)
  })

  test("trims surrounding whitespace", () => {
    expect(youtubeId(`  https://youtu.be/${VIDEO_ID}  `)).toBe(VIDEO_ID)
  })

  test("returns null for a non-YouTube URL", () => {
    expect(youtubeId("https://example.com/not-a-video")).toBeNull()
  })

  test("returns null for empty or nullish input", () => {
    expect(youtubeId("")).toBeNull()
    expect(youtubeId(null)).toBeNull()
    expect(youtubeId(undefined)).toBeNull()
  })
})

describe("isYoutubeUrl", () => {
  test("true for a valid YouTube URL", () => {
    expect(isYoutubeUrl(`https://youtu.be/${VIDEO_ID}`)).toBe(true)
  })

  test("false for a non-YouTube URL", () => {
    expect(isYoutubeUrl("https://vimeo.com/123")).toBe(false)
  })
})

describe("youtubeEmbedUrl", () => {
  test("builds the embed URL with the expected params", () => {
    expect(youtubeEmbedUrl(VIDEO_ID)).toBe(
      `https://www.youtube.com/embed/${VIDEO_ID}?rel=0&modestbranding=1`
    )
  })
})

describe("youtubeThumb", () => {
  test("builds the thumbnail URL", () => {
    expect(youtubeThumb(VIDEO_ID)).toBe(`https://i.ytimg.com/vi/${VIDEO_ID}/hqdefault.jpg`)
  })
})
