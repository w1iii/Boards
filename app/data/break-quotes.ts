interface Quote {
  text: string
  author: string
}

const quotes: Quote[] = [
  {
    text: "Nursing is not just a profession, it's a calling. Every question you answer today brings you closer to the patients who need you tomorrow.",
    author: "Florence Nightingale",
  },
  {
    text: "The trained nurse has become one of the great blessings of humanity, taking a place beside the physician and the priest.",
    author: "Florence Nightingale",
  },
  {
    text: "Let us never consider ourselves finished nurses. We must be learning all of our lives.",
    author: "Florence Nightingale",
  },
  {
    text: "Nurses dispense comfort, compassion, and caring without even a prescription.",
    author: "Val Saintsbury",
  },
  {
    text: "Your NLE journey is not about perfection. It's about progress, one question at a time.",
    author: "BOARDS.",
  },
  {
    text: "Rest is not idleness. It is medicine for the mind — and every nurse knows the value of medicine.",
    author: "BOARDS.",
  },
  {
    text: "The best nurses are those who care for themselves as compassionately as they will care for others.",
    author: "BOARDS.",
  },
  {
    text: "Nursing is an art: and if it is to be made an art, it requires as exclusive a devotion, as hard a preparation, as any painter's or sculptor's work.",
    author: "Florence Nightingale",
  },
  {
    text: "Small steps lead to big victories. Every question mastered is a patient better served.",
    author: "BOARDS.",
  },
  {
    text: "Nursing is not for everyone. It takes a heart of gold, a backbone of steel, and a spirit that cannot be broken.",
    author: "BOARDS.",
  },
  {
    text: "You don't need to see the whole staircase. Just take the first step — then rest, then the next.",
    author: "BOARDS.",
  },
  {
    text: "The art of nursing is to refresh the spirit as well as heal the body. Start by refreshing your own.",
    author: "BOARDS.",
  },
  {
    text: "Burnout is not a badge of honor. A rested mind answers more accurately than a tired one.",
    author: "BOARDS.",
  },
  {
    text: "Nursing school taught you the science. NLE prep refines the art. Breaks sharpen both.",
    author: "BOARDS.",
  },
  {
    text: "The best preparation for tomorrow is doing your best today — and knowing when to stop.",
    author: "BOARDS.",
  },
  {
    text: "Nurses are the heart of healthcare. Take care of your heart so you can care for others.",
    author: "BOARDS.",
  },
  {
    text: "Courage doesn't always roar. Sometimes courage is the quiet voice at the end of the day saying, 'I will try again tomorrow.'",
    author: "Mary Anne Radmacher",
  },
  {
    text: "Believe you can and you're halfway there. Rest when you need to, then finish the journey.",
    author: "Theodore Roosevelt",
  },
]

export function getRandomQuote(): Quote {
  return quotes[Math.floor(Math.random() * quotes.length)]
}

export function getQuotes(): Quote[] {
  return quotes
}
