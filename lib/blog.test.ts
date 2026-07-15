import { describe, test, expect } from "bun:test"
import { getAllPosts, getRelatedPosts } from "./blog"

describe("getAllPosts", () => {
  test("returns posts with the expected shape", () => {
    const posts = getAllPosts()
    expect(posts.length).toBeGreaterThan(0)
    for (const post of posts) {
      expect(typeof post.slug).toBe("string")
      expect(typeof post.title).toBe("string")
      expect(typeof post.date).toBe("string")
      expect(typeof post.description).toBe("string")
      expect(Array.isArray(post.tags)).toBe(true)
      expect(post.readingTime).toBeGreaterThanOrEqual(1)
    }
  })

  test("sorts posts by date, most recent first", () => {
    const dates = getAllPosts().map((p) => p.date)
    const sortedDescending = [...dates].sort((a, b) => (a < b ? 1 : -1))
    expect(dates).toEqual(sortedDescending)
  })
})

describe("getRelatedPosts", () => {
  test("excludes the given slug and respects the limit", () => {
    const [first] = getAllPosts()
    const related = getRelatedPosts(first.slug, 2)
    expect(related.length).toBeLessThanOrEqual(2)
    expect(related.some((p) => p.slug === first.slug)).toBe(false)
  })

  test("returns an empty array for a slug that doesn't exist", () => {
    expect(getRelatedPosts("this-slug-does-not-exist")).toEqual([])
  })
})
