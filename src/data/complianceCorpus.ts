// CHAP AI Compliance Corpus — v1 Scope: IRC §6656 (Failure to Deposit Penalty)
//
// This file is the grounding knowledge base the CHAP AI widget uses to
// answer compliance questions. Every citation the model returns must point
// to an entry here — the widget layer enforces this via chapValidation.ts.
//
// IMPORTANT: The `content` field for every entry below is a PLACEHOLDER.
// The founder must populate each entry with verbatim text from the primary
// source before production launch. Do NOT paraphrase or fabricate statute
// language — the widget's value depends on citation integrity.
//
// Adding a new entry: pick a stable `id` slug, match the CorpusEntry shape
// exactly, and populate `tags` with lowercase keywords that describe
// likely-matching user questions (the retrieval layer uses these).

export type CorpusSourceType = "usc" | "cfr" | "irs_guidance" | "pse_written";

export interface CorpusEntry {
  id: string;
  title: string;
  citation: string;
  sourceType: CorpusSourceType;
  jurisdiction: string;
  sourceUrl: string;
  content: string;
  tags: string[];
}

const PLACEHOLDER = "[Founder to populate with verbatim primary source text]";

export const COMPLIANCE_CORPUS: CorpusEntry[] = [
  {
    id: "irc-6656-a",
    title: "IRC §6656(a) — Imposition of the failure-to-deposit penalty",
    citation: "26 U.S.C. §6656(a)",
    sourceType: "usc",
    jurisdiction: "federal",
    sourceUrl: "https://www.law.cornell.edu/uscode/text/26/6656#a",
    content: PLACEHOLDER,
    tags: [
      "failure to deposit",
      "deposit penalty",
      "penalty imposition",
      "employment taxes",
      "941",
      "940",
      "deposit",
    ],
  },
  {
    id: "irc-6656-b",
    title: "IRC §6656(b) — Amount of the penalty (four-tier structure)",
    citation: "26 U.S.C. §6656(b)",
    sourceType: "usc",
    jurisdiction: "federal",
    sourceUrl: "https://www.law.cornell.edu/uscode/text/26/6656#b",
    content: PLACEHOLDER,
    tags: [
      "penalty amount",
      "penalty rate",
      "2 percent",
      "5 percent",
      "10 percent",
      "15 percent",
      "tier",
      "four tier",
      "days late",
      "late deposit",
    ],
  },
  {
    id: "irc-6656-c",
    title: "IRC §6656(c) — Exception for first-time depositors",
    citation: "26 U.S.C. §6656(c)",
    sourceType: "usc",
    jurisdiction: "federal",
    sourceUrl: "https://www.law.cornell.edu/uscode/text/26/6656#c",
    content: PLACEHOLDER,
    tags: [
      "first time depositor",
      "new employer",
      "exception",
      "waiver",
      "abatement",
      "first time",
    ],
  },
  {
    id: "irc-6656-d",
    title: "IRC §6656(d) — Authority to abate penalty for inadvertent failures",
    citation: "26 U.S.C. §6656(d)",
    sourceType: "usc",
    jurisdiction: "federal",
    sourceUrl: "https://www.law.cornell.edu/uscode/text/26/6656#d",
    content: PLACEHOLDER,
    tags: [
      "abatement",
      "inadvertent",
      "reasonable cause",
      "waiver",
      "relief",
      "first-time abatement",
    ],
  },
  {
    id: "irc-6656-e-de-minimis",
    title: "IRC §6656(e) — De minimis exception / safe harbor",
    citation: "26 U.S.C. §6656(e)",
    sourceType: "usc",
    jurisdiction: "federal",
    sourceUrl: "https://www.law.cornell.edu/uscode/text/26/6656#e",
    content: PLACEHOLDER,
    tags: [
      "de minimis",
      "safe harbor",
      "small shortfall",
      "underpayment",
      "exception",
      "threshold",
    ],
  },
  {
    id: "irc-6302-c",
    title: "IRC §6302(c) — Mode or time of collection of employment taxes",
    citation: "26 U.S.C. §6302(c)",
    sourceType: "usc",
    jurisdiction: "federal",
    sourceUrl: "https://www.law.cornell.edu/uscode/text/26/6302#c",
    content: PLACEHOLDER,
    tags: [
      "deposit schedule",
      "deposit timing",
      "semi-weekly",
      "monthly",
      "next-day deposit",
      "100000",
      "lookback period",
      "deposit rules",
    ],
  },
  {
    id: "cfr-31-6302-1",
    title: "26 CFR §31.6302-1 — Federal tax deposit rules for employment taxes",
    citation: "26 C.F.R. §31.6302-1",
    sourceType: "cfr",
    jurisdiction: "federal",
    sourceUrl: "https://www.ecfr.gov/current/title-26/chapter-I/subchapter-C/part-31/subpart-G/section-31.6302-1",
    content: PLACEHOLDER,
    tags: [
      "deposit rules",
      "regulation",
      "eftps",
      "deposit schedule",
      "monthly depositor",
      "semi-weekly depositor",
      "lookback",
      "safe harbor deposit",
    ],
  },
  {
    id: "irs-pub-15",
    title: "IRS Publication 15 — Employer's Tax Guide (deposit schedules & penalties)",
    citation: "IRS Pub. 15 (Circular E)",
    sourceType: "irs_guidance",
    jurisdiction: "federal",
    sourceUrl: "https://www.irs.gov/pub/irs-pdf/p15.pdf",
    content: PLACEHOLDER,
    tags: [
      "publication 15",
      "circular e",
      "employer tax guide",
      "deposit schedule",
      "monthly",
      "semi-weekly",
      "lookback period",
      "form 941",
    ],
  },
  {
    id: "irm-20-1-1-3-reasonable-cause",
    title: "IRM 20.1.1.3 — Reasonable Cause (penalty abatement standards)",
    citation: "IRM 20.1.1.3",
    sourceType: "irs_guidance",
    jurisdiction: "federal",
    sourceUrl: "https://www.irs.gov/irm/part20/irm_20-001-001",
    content: PLACEHOLDER,
    tags: [
      "reasonable cause",
      "abatement",
      "ordinary business care and prudence",
      "penalty relief",
      "irm",
      "internal revenue manual",
      "facts and circumstances",
    ],
  },
  {
    id: "pse-analysis-6656-patterns",
    title: "PSE Analysis — Common §6656 trigger patterns in multi-state payroll",
    citation: "PSE Compliance Intelligence Note 001",
    sourceType: "pse_written",
    jurisdiction: "federal",
    sourceUrl: "https://payrollsynergyexperts.com/chap-ai",
    content: PLACEHOLDER,
    tags: [
      "pse analysis",
      "deposit timing error",
      "semi-weekly vs monthly",
      "depositor status change",
      "lookback period mistake",
      "pattern",
      "common triggers",
    ],
  },
];

export function getCorpusEntry(id: string): CorpusEntry | undefined {
  return COMPLIANCE_CORPUS.find((e) => e.id === id);
}

export function getAllCorpusEntries(): CorpusEntry[] {
  return COMPLIANCE_CORPUS;
}

export function getCorpusIds(): string[] {
  return COMPLIANCE_CORPUS.map((e) => e.id);
}
