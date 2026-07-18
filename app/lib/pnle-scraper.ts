import { z } from "zod"
import { PNLE_SCRAPE_URLS } from "./pnle-topics"

const scrapedQuestionSchema = z.object({
  text: z.string().min(1),
  choices: z.array(z.object({ key: z.string(), text: z.string().min(1) })).length(4),
  correctAnswer: z.string().min(1),
  rationale: z.string().min(1),
})

export type ScrapedQuestion = z.infer<typeof scrapedQuestionSchema>

function cleanText(s: string): string {
  return s.replace(/\s+/g, " ").trim()
}

function extractQuestionsFromText(raw: string): ScrapedQuestion[] {
  const questions: ScrapedQuestion[] = []

  const answerSection = raw.match(/Answer[s]?\s*(?:and\s*)?Rationale[s]?[:\s]*([\s\S]*)/i)
  const bodySection = answerSection ? raw.slice(0, answerSection.index) : raw
  const answerText = answerSection ? answerSection[1] : ""

  const answerMap = new Map<string, { key: string; rationale: string }>()
  const answerRegex = /(\d+)\.\s*\*{0,2}Answer:\s*\(([A-D])\)\s*\*{0,2}([\s\S]*?)(?=\n\s*(?:\d+\.\s*\*{0,2}Answer:|$))/gi
  let amatch: RegExpExecArray | null
  while ((amatch = answerRegex.exec(answerText)) !== null) {
    const num = amatch[1]
    const key = amatch[2].toUpperCase()
    let rest = amatch[3].trim()
    const dotIdx = rest.indexOf(".")
    const rationale = dotIdx > 0 ? rest.slice(dotIdx + 1).trim() : rest
    answerMap.set(num, { key, rationale })
  }
  if (answerMap.size === 0) {
    const altAnswerRegex = /(\d+)\.\s*\*{0,2}([A-D])\s*\.\s*\*{0,2}([\s\S]*?)(?=\n\s*(?:\d+\.\s*\*{0,2}|$))/gi
    while ((amatch = altAnswerRegex.exec(answerText)) !== null) {
      answerMap.set(amatch[1], { key: amatch[2].toUpperCase(), rationale: amatch[3].trim() })
    }
  }

  const questionRegex = /(\d+)\.\s+([\s\S]*?)(?=\n\s*(?:\d+\.|Answer|$))/g
  let qmatch: RegExpExecArray | null
  while ((qmatch = questionRegex.exec(bodySection)) !== null) {
    const num = qmatch[1]
    let block = qmatch[2].trim()
    if (!block) continue

    const choiceLines: string[] = []
    const choiceRegex = /^\s{2,}([1-4])\.\s+(.+)$/gm
    let cmatch: RegExpExecArray | null
    while ((cmatch = choiceRegex.exec(block)) !== null) {
      choiceLines.push(cmatch[2].trim())
    }

    block = block.replace(/\s{2,}[1-4]\.\s+.+/g, "").trim()
    const text = cleanText(block)
    if (!text || choiceLines.length !== 4) continue

    const ans = answerMap.get(num)
    if (!ans) continue

    questions.push({
      text,
      choices: [
        { key: "A", text: choiceLines[0] },
        { key: "B", text: choiceLines[1] },
        { key: "C", text: choiceLines[2] },
        { key: "D", text: choiceLines[3] },
      ],
      correctAnswer: ans.key,
      rationale: cleanText(ans.rationale),
    })
  }

  return questions
}

let scrapeCache: Record<string, ScrapedQuestion[]> = {}

export function clearCache(): void {
  scrapeCache = {}
}

export function getCachedScraped(area: string): ScrapedQuestion[] {
  return scrapeCache[area] || []
}

export async function scrapePnleQuestions(area: string): Promise<ScrapedQuestion[]> {
  const cached = getCachedScraped(area)
  if (cached.length > 0) return cached

  const urls = PNLE_SCRAPE_URLS[area]
  if (!urls || urls.length === 0) return []

  const all: ScrapedQuestion[] = []
  const seen = new Set<string>()

  for (const url of urls) {
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; PNLE-Bot/1.0)" },
        signal: AbortSignal.timeout(15000),
      })
      if (!res.ok) continue
      const html = await res.text()

      const bodyMatch = html.match(
        /<article[\s\S]*?<\/article>|<div\s+(?:id|class)=["'](?:post-|entry-content|thecontent|main-content)["'][\s\S]*?<\/div>/i,
      )
      const content = bodyMatch ? bodyMatch[0] : html

      const textContent = content
        .replace(/<[^>]+>/g, "\n")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#8217;/g, "'")
        .replace(/&#8211;/g, "-")
        .replace(/&#038;/g, "&")
        .replace(/\n{3,}/g, "\n\n")

      const questions = extractQuestionsFromText(textContent)
      for (const q of questions) {
        const key = q.text.slice(0, 80)
        if (!seen.has(key)) {
          seen.add(key)
          all.push(q)
        }
      }
    } catch {
      continue
    }
  }

  all.sort(() => Math.random() - 0.5)
  const sample = all.slice(0, 12)
  scrapeCache[area] = sample

  return sample
}

export function formatScrapedAsExamples(questions: ScrapedQuestion[]): string {
  if (questions.length === 0) return ""
  return questions
    .slice(0, 6)
    .map(
      (q, i) =>
        `Reference Exam Question #${i + 1}:\n${JSON.stringify(
          {
            text: q.text,
            choices: q.choices,
            correctAnswer: q.correctAnswer,
            rationale: q.rationale,
          },
          null,
          2,
        )}`,
    )
    .join("\n\n")
}
