#!/usr/bin/env node
/**
 * Turn the extracted Chinese edition of Dear Papa into a dated letter archive.
 *
 * Source: data/source/dear-papa.txt
 * Output: src/data/letters.json
 *
 * The source is an EPUB text extraction: paragraphs are single long lines,
 * page breaks are marked ===PAGE n===, and footnotes sit at the end of a
 * chapter. We only take the letters themselves, not the preface, chapter
 * introductions, or end matter.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SOURCE = path.join(ROOT, 'data/source/dear-papa.txt');
const OUTPUT = path.join(ROOT, 'src/data/letters.json');

const raw = fs.readFileSync(SOURCE, 'utf8').replace(/\r/g, '');
const lines = raw.split('\n').map((line) => line.replace(/\s+$/u, ''));
const isBlank = (line) => !line || !line.trim();
const text = (index) => (lines[index] ?? '').trim();

const SECTION_NAMES = ['引子', '序', '幼年时期', '寄宿学校', '青年时期', '尾声', '致谢'];
const SECTION_META = {
  引子: {
    key: 'intro',
    label: '引子',
    caption: '帕特里克问：你了解你父亲吗？',
    range: '1925',
  },
  幼年时期: {
    key: 'childhood',
    label: '幼年时期',
    caption: '第一封信、非洲、勇气、猫',
    range: '1932—1942',
  },
  寄宿学校: {
    key: 'school',
    label: '寄宿学校',
    caption: '坎特伯雷、战争、每月两封信',
    range: '1943—1946',
  },
  青年时期: {
    key: 'youth',
    label: '青年时期',
    caption: '斯坦福、哈佛、非洲、告别',
    range: '1948—1961',
  },
};

function findSectionStart(name) {
  const exact = lines.findIndex((line) => line.trim() === name);
  if (exact === -1) throw new Error(`Section not found: ${name}`);
  return exact;
}

function nextNonBlank(index) {
  let cursor = index + 1;
  while (cursor < lines.length && isBlank(lines[cursor])) cursor += 1;
  return cursor;
}

function prevNonBlank(index) {
  let cursor = index - 1;
  while (cursor >= 0 && isBlank(lines[cursor])) cursor -= 1;
  return cursor;
}

function isSectionHeading(line) {
  const value = line.trim();
  return (
    SECTION_NAMES.includes(value) ||
    /^第[一二三]章(?:\s|$)/u.test(value) ||
    value === '感谢上帝，你还能写信 ——代译后记'
  );
}

function isCaption(line) {
  return /^\d{4}年(?:前后)?.*摄于/u.test(line.trim());
}

function cleanLine(line) {
  return line
    .replace(/^===PAGE\s+\d+===$/u, '')
    .replace(/\s*\[(\d+)\]/gu, '[$1]')
    .trim();
}

function paragraphsFrom(start, end, excluded = new Set()) {
  const paragraphs = [];
  let current = [];
  for (let i = start; i < end; i += 1) {
    const line = cleanLine(lines[i]);
    if (!line || isSectionHeading(line) || isCaption(line) || excluded.has(i)) {
      if (current.length) {
        paragraphs.push(current.join(''));
        current = [];
      }
      continue;
    }
    current.push(line);
  }
  if (current.length) paragraphs.push(current.join(''));
  return paragraphs.filter((paragraph) => paragraph.trim().length > 0);
}

function parseExactDate(dateText) {
  const match = dateText.match(/^(\d{4})年(\d{1,2})月(\d{1,2})日(?:（([^）]+)）)?$/u);
  if (!match) return null;
  const [, year, month, day, note] = match;
  return {
    year: Number(year),
    month: Number(month),
    day: Number(day),
    displayDate: `${Number(year)}年${Number(month)}月${Number(day)}日`,
    precision: 'day',
    dateNote: null,
    age: note && /(\d+)岁/u.test(note) ? Number(note.match(/(\d+)岁/u)[1]) : null,
  };
}

function parseDate(dateText, metaLines) {
  const exact = parseExactDate(dateText);
  if (exact) return exact;

  const monthEnd = dateText.match(/^(\d{4})年(\d{1,2})月末$/u);
  if (monthEnd) {
    const year = Number(monthEnd[1]);
    const month = Number(monthEnd[2]);
    const day = new Date(year, month, 0).getDate();
    return {
      year,
      month,
      day,
      displayDate: `${year}年${month}月末`,
      precision: 'month',
      dateNote: '原信只记到月末，未写具体日期',
      age: null,
    };
  }

  const season = dateText.match(/^(\d{4})年夏末，无日期$/u);
  if (season) {
    return {
      year: Number(season[1]),
      month: 8,
      day: 31,
      displayDate: `${season[1]}年夏末`,
      precision: 'season',
      dateNote: '原信未写日期，只能确定是夏末',
      age: null,
    };
  }

  if (dateText === '未写日期') {
    const postmark = metaLines.find((line) => line.startsWith('邮戳：'));
    const postmarkMatch = postmark?.match(/^邮戳：(\d{4})年(\d{1,2})月(\d{1,2})日$/u);
    if (postmarkMatch) {
      const year = Number(postmarkMatch[1]);
      const month = Number(postmarkMatch[2]);
      const day = Number(postmarkMatch[3]);
      return {
        year,
        month,
        day,
        displayDate: `${year}年${month}月${day}日`,
        precision: 'postmark',
        dateNote: `原信未写日期，据邮戳定为 ${year} 年 ${month} 月 ${day} 日`,
        age: null,
      };
    }
  }

  throw new Error(`Unrecognised date: ${dateText}`);
}

const SALUTATION = /^(最?亲爱的|我亲爱的|我最亲爱的|亲爱的老|最亲爱的老)/u;
const RECIPIENT = /^致(?!谢|意)(.{1,26})$/u;
const FOOTNOTE_DEF = /^\[(\d+)\]/u;

function sectionRange(name, nextName) {
  const start = findSectionStart(name);
  const end = nextName ? findSectionStart(nextName) : lines.length;
  return { start, end };
}

function collectFootnotes(start, end) {
  // Footnote definitions are the contiguous block at the end of a chapter.
  // Keeping them separate from inline markers matters: a line inside a
  // letter can also begin with [3], but it is not a definition.
  const map = new Map();
  const defIndices = new Set();
  let cursor = end - 1;
  while (cursor >= start) {
    const line = cleanLine(lines[cursor]);
    if (!line || isSectionHeading(line) || isCaption(line)) {
      cursor -= 1;
      continue;
    }
    const match = line.match(FOOTNOTE_DEF);
    if (!match) break;
    const number = Number(match[1]);
    const value = line.replace(/^\[\d+\]\s*/u, '').trim();
    if (value) map.set(number, value);
    defIndices.add(cursor);
    cursor -= 1;
  }
  return { map, defIndices };
}

function referencedFootnotes(paragraphs, footnoteMap) {
  const numbers = new Set();
  for (const paragraph of paragraphs) {
    for (const match of paragraph.matchAll(/\[(\d+)\]/gu)) numbers.add(Number(match[1]));
  }
  return [...numbers]
    .sort((a, b) => a - b)
    .filter((number) => footnoteMap.has(number))
    .map((number) => ({ n: number, text: footnoteMap.get(number) }));
}

function buildLetter({ title, recipient, dateText, metaLines, bodyStart, bodyEnd, section, footnoteMap, defIndices, order }) {
  const date = parseDate(dateText, metaLines);
  const dateIndex = metaLines.indexOf(dateText);
  const afterDate = metaLines.slice(dateIndex + 1);
  const placeIndex = afterDate.findIndex((line) => !line.startsWith('邮戳：'));
  const place = placeIndex === -1 ? '' : afterDate[placeIndex];
  const headnote = afterDate
    .filter((line, index) => index !== placeIndex)
    .filter((line) => !line.startsWith('邮戳：'))
    .filter(Boolean);

  const paragraphs = paragraphsFrom(bodyStart, bodyEnd, defIndices);
  const body = paragraphs.join('\n\n');
  const footnotes = referencedFootnotes(paragraphs, footnoteMap);
  const year = date.year;
  const month = date.month;
  const day = date.day;
  const dateKey = `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  const id = `${year}-${dateKey}-${String(order).padStart(3, '0')}`;
  const patrickWriting = recipient.startsWith('致欧内斯特');
  const sender = patrickWriting ? '帕特里克·海明威' : '欧内斯特·海明威';
  const recipientName = recipient.replace(/^致/u, '').trim();

  return {
    id,
    order,
    title: title || '未标题',
    sender,
    recipient: recipientName,
    date: `${year}-${dateKey}`,
    dateKey,
    year,
    month,
    day,
    displayDate: date.displayDate,
    precision: date.precision,
    dateNote: date.dateNote,
    age: date.age,
    place,
    headnote,
    section: section.label,
    sectionKey: section.key,
    body,
    paragraphs,
    footnotes,
    charCount: body.replace(/\s/gu, '').length,
  };
}

function parseSection(name, nextName) {
  const section = SECTION_META[name];
  const { start, end } = sectionRange(name, nextName);
  const { map: footnoteMap, defIndices } = collectFootnotes(start, end);
  const headers = [];
  for (let i = start + 1; i < end; i += 1) {
    if (RECIPIENT.test(text(i))) headers.push(i);
  }

  const letters = [];
  for (let index = 0; index < headers.length; index += 1) {
    const headerIndex = headers[index];
    const recipient = text(headerIndex);
    const title = text(prevNonBlank(headerIndex));
    const firstMetaIndex = nextNonBlank(headerIndex);

    // Find the salutation, but do not run into the next letter.
    const nextHeader = headers[index + 1] ?? end;
    let salutationIndex = -1;
    let metaEnd = nextHeader;
    for (let i = firstMetaIndex; i < Math.min(firstMetaIndex + 24, nextHeader); i += 1) {
      if (SALUTATION.test(text(i))) {
        salutationIndex = i;
        break;
      }
    }

    const metaLines = [];
    for (let i = firstMetaIndex; i < (salutationIndex === -1 ? Math.min(firstMetaIndex + 18, nextHeader) : salutationIndex); i += 1) {
      if (!isBlank(lines[i])) metaLines.push(cleanLine(lines[i]));
    }

    const dateText = metaLines[0] ?? '';
    let bodyStart;
    if (salutationIndex !== -1) {
      bodyStart = salutationIndex;
      metaEnd = salutationIndex;
    } else {
      // Telegrams have no salutation. Their body is the first long line.
      const longLine = metaLines.findIndex((line, i) => i > 1 && line.length >= 40);
      const bodyIndex = longLine === -1 ? -1 : metaLines[longLine];
      if (bodyIndex !== -1) {
        for (let i = firstMetaIndex; i < nextHeader; i += 1) {
          if (cleanLine(lines[i]) === bodyIndex) {
            bodyStart = i;
            metaEnd = i;
            break;
          }
        }
      }
      if (bodyStart === undefined) {
        bodyStart = firstMetaIndex + 1;
        metaEnd = bodyStart;
      }
    }

    // Rebuild metaLines bounded by the actual metadata block.
    const boundedMeta = [];
    for (let i = firstMetaIndex; i < metaEnd; i += 1) {
      if (!isBlank(lines[i])) boundedMeta.push(cleanLine(lines[i]));
    }

    const nextTitleIndex = nextHeader === end ? end : prevNonBlank(nextHeader);
    const bodyEnd = Math.max(bodyStart, nextTitleIndex);
    letters.push(
      buildLetter({
        title,
        recipient,
        dateText,
        metaLines: boundedMeta,
        bodyStart,
        bodyEnd,
        section,
        footnoteMap,
        defIndices,
        order: letters.length + 1,
      }),
    );
  }

  return letters;
}

function parseIntroLetter() {
  const { start, end } = sectionRange('引子', '序');
  const dateIndex = lines.findIndex(
    (line, index) => index >= start && index < end && /^1925年7月1日$/u.test(line.trim()),
  );
  if (dateIndex === -1) throw new Error('Intro letter date not found');
  const placeIndex = nextNonBlank(dateIndex);
  const salutationIndex = nextNonBlank(placeIndex);
  const stopIndex = lines.findIndex(
    (line, index) => index > salutationIndex && line.trim().startsWith('这封信展示出海明威复杂的个性'),
  );
  const { map: footnoteMap, defIndices } = collectFootnotes(start, end);
  const date = parseDate('1925年7月1日', []);
  const paragraphs = paragraphsFrom(
    salutationIndex,
    stopIndex === -1 ? end : stopIndex,
    defIndices,
  );
  const body = paragraphs.join('\n\n');
  return {
    id: '1925-07-01-000',
    order: 0,
    title: '给司各特·菲茨杰拉德',
    sender: '欧内斯特·海明威',
    recipient: 'F. 司各特·菲茨杰拉德',
    date: '1925-07-01',
    dateKey: '07-01',
    year: date.year,
    month: date.month,
    day: date.day,
    displayDate: date.displayDate,
    precision: 'day',
    dateNote: '收在引子里的一封早期信，写给菲茨杰拉德',
    age: null,
    place: text(placeIndex),
    headnote: ['全书引子中的一封早期信，不是父子通信'],
    section: '引子',
    sectionKey: 'intro',
    body,
    paragraphs,
    footnotes: referencedFootnotes(paragraphs, footnoteMap),
    charCount: body.replace(/\s/gu, '').length,
  };
}

const introLetter = parseIntroLetter();
const childhood = parseSection('幼年时期', '寄宿学校');
const school = parseSection('寄宿学校', '青年时期');
const youth = parseSection('青年时期', '尾声');
const letters = [introLetter, ...childhood, ...school, ...youth].sort((a, b) => {
  if (a.date === b.date) return a.order - b.order;
  return a.date.localeCompare(b.date);
});

// Reassign order after sorting, keeping the intro at 0.
letters.forEach((letter, index) => {
  letter.order = index + 1;
  letter.id = `${letter.year}-${letter.dateKey}-${String(index + 1).padStart(3, '0')}`;
});

const years = [...new Set(letters.map((letter) => letter.year))].sort((a, b) => a - b);
const activeDays = new Set(letters.map((letter) => letter.dateKey));
const leapLetters = letters.filter((letter) => letter.dateKey === '02-29');
const fatherSon = letters.filter((letter) => letter.sectionKey !== 'intro');

const sections = [
  {
    ...SECTION_META['引子'],
    count: letters.filter((letter) => letter.sectionKey === 'intro').length,
  },
  {
    ...SECTION_META['幼年时期'],
    count: letters.filter((letter) => letter.sectionKey === 'childhood').length,
  },
  {
    ...SECTION_META['寄宿学校'],
    count: letters.filter((letter) => letter.sectionKey === 'school').length,
  },
  {
    ...SECTION_META['青年时期'],
    count: letters.filter((letter) => letter.sectionKey === 'youth').length,
  },
];

const payload = {
  meta: {
    title: '亲爱的老爸：海明威父子家书',
    originalTitle: 'Dear Papa: The Letters of Patrick and Ernest Hemingway',
    authors: ['欧内斯特·海明威', '帕特里克·海明威'],
    editors: ['布伦丹·海明威', '斯蒂芬·亚当斯'],
    translator: '姜向明',
    publisher: '上海译文出版社',
    edition: '2024 年 9 月，ISBN 9787532796298',
    source: 'data/source/dear-papa.txt',
    totalLetters: letters.length,
    fatherSonLetters: fatherSon.length,
    introLetters: letters.length - fatherSon.length,
    years,
    yearRange: [years[0], years[years.length - 1]],
    activeDays: activeDays.size,
    leapLetters: leapLetters.length,
    totalChars: letters.reduce((sum, letter) => sum + letter.charCount, 0),
    sections,
  },
  letters,
};

fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
fs.writeFileSync(OUTPUT, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');

const bySection = sections.map((section) => `${section.label} ${section.count}`).join(' · ');
console.log(`Parsed ${letters.length} letters (${fatherSon.length} father–son + ${letters.length - fatherSon.length} intro).`);
console.log(bySection);
console.log(`Years ${years[0]}–${years[years.length - 1]} · ${activeDays.size} active dates · ${leapLetters.length} leap-day letter(s)`);
console.log(`Wrote ${path.relative(ROOT, OUTPUT)}`);
