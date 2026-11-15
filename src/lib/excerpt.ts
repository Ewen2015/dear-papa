const SALUTATION = /^(?:最?亲爱的|我亲爱的)/u

export function cleanText(text: string): string {
  return text
    .replace(/\[\d+\]/g, '')
    .replace(/［[^］]*］/g, '')
    .replace(/([，、；：])\s*([。！？])/g, '$2')
    .replace(/([。！？])\s*[，、；：]/g, '$1')
    .replace(/([，、；：])\1+/g, '$1')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

/** First readable line of a letter, skipping the salutation. */
export function letterExcerpt(paragraphs: string[], max = 56): string {
  const source =
    paragraphs.find(
      (paragraph) => cleanText(paragraph).length > 12 && !SALUTATION.test(paragraph),
    ) ??
    paragraphs[0] ??
    ''
  const text = cleanText(source)
  if (text.length <= max) return text

  const slice = text.slice(0, max)
  const boundary = Math.max(
    slice.lastIndexOf('。'),
    slice.lastIndexOf('！'),
    slice.lastIndexOf('？'),
    slice.lastIndexOf('；'),
  )
  return boundary >= max * 0.55
    ? `${slice.slice(0, boundary + 1)}…`
    : `${slice.trimEnd()}…`
}
