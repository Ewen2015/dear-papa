export type DatePrecision = 'day' | 'month' | 'season' | 'postmark'

export interface Footnote {
  n: number
  text: string
}

export interface Letter {
  id: string
  order: number
  title: string
  sender: string
  recipient: string
  date: string
  dateKey: string
  year: number
  month: number
  day: number
  displayDate: string
  precision: DatePrecision
  dateNote: string | null
  age: number | null
  place: string
  headnote: string[]
  section: string
  sectionKey: 'intro' | 'childhood' | 'school' | 'youth'
  body: string
  paragraphs: string[]
  footnotes: Footnote[]
  charCount: number
}

export interface SectionMeta {
  key: string
  label: string
  caption: string
  range: string
  count: number
}

export interface ArchiveMeta {
  title: string
  originalTitle: string
  authors: string[]
  editors: string[]
  translator: string
  publisher: string
  edition: string
  source: string
  generatedAt: string
  totalLetters: number
  fatherSonLetters: number
  introLetters: number
  years: number[]
  yearRange: [number, number]
  activeDays: number
  leapLetters: number
  totalChars: number
  sections: SectionMeta[]
}

export interface Archive {
  meta: ArchiveMeta
  letters: Letter[]
}

export type SenderRole = 'father' | 'son' | 'other'
