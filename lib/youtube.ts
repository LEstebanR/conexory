const ID_PATTERNS = [
  /youtube\.com\/watch\?(?:.*&)?v=([A-Za-z0-9_-]{11})/,
  /youtu\.be\/([A-Za-z0-9_-]{11})/,
  /youtube\.com\/embed\/([A-Za-z0-9_-]{11})/,
  /youtube\.com\/shorts\/([A-Za-z0-9_-]{11})/,
  /youtube\.com\/live\/([A-Za-z0-9_-]{11})/,
]

export function youtubeId(raw: string | null | undefined): string | null {
  if (!raw) return null
  const url = raw.trim()
  for (const re of ID_PATTERNS) {
    const match = url.match(re)
    if (match) return match[1]
  }
  return null
}

export function isYoutubeUrl(raw: string): boolean {
  return youtubeId(raw) !== null
}

export function youtubeEmbedUrl(id: string): string {
  return `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1`
}

export function youtubeThumb(id: string): string {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`
}
