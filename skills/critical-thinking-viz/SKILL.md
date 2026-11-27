---
name: critical-thinking-viz
description: Turn a claim, post, tweet, quote or argument into a visual critical-thinking breakdown - an argument map with stated and hidden premises, fallacy and bias labels, optional Venn diagrams and counterexample tests. Outputs an interactive HTML page (Artifact), a 16:9 PNG infographic for social replies, or both. Use when the user pastes a claim and asks what is wrong with it, which fallacy or bias it is, for an argument map or diagram of it, or for an image to reply with.
---

# Critical thinking visualizer

Turn one claim into a picture of its reasoning: what is said, what it silently needs, where it breaks, and the strongest version the evidence supports.

One data file drives both outputs:

- **page**: interactive HTML. Argument map with arrows, set pictures, buttons that strike a premise and show the conclusion falling, a charitable reading. It has a language switch and a light / dark / auto theme switch, both remembered per browser. On wide screens the map stays pinned on the left while the tests and their strike buttons sit on the right. Publish it as an Artifact when the Artifact tool is available, or save it as a local `.html` file.
- **card**: a 1600 × 900 PNG (rendered at 2x) with the argument map on the left and up to two Venn pictures on the right, one PNG per language. Made for X, Threads or Facebook replies.

## 1. Ask what to make

Unless the user already said, ask (AskUserQuestion when available, both questions in one call):

1. **Output**: **Both** (recommended: page to explore, card to post) · **Interactive page** only · **Infographic picture** only
2. **Languages**: **Vietnamese + English** (default) · only the language the user wrote in · other (user names them)

Put the user's own language first in `langs`; it is the page's default and the first card. Quote the claim in its original language for that language, and translate it for the others.

## 2. Analyse before you draw

Work through this on the full text the user gave, including replies or context they pasted. Context often holds the actual reasons, and the weak spots are usually there.

1. **Conclusion.** What does the author want the reader to believe? Phrase it as one sentence starting with ∴.
2. **Stated premises.** The reasons actually given, in their words, shortened. 2–4 of them.
3. **Hidden premises.** What must also be true for the conclusion to follow? Ask: "what sentence, added here, would make this valid?" Usually 1–2. These are the targets.
4. **Label every box.** Tags use three tones:
   - `ok`: true or partly true ("True", "Partly true"). Say so. A fair map marks true premises as true.
   - `bad`: a named fallacy or flaw (Hasty generalization, Anecdotal evidence, Biased sample, Category mistake, Red herring, False cause, Equivocation, Appeal to authority, Single cause, Opinion stated as fact, Proves too much…).
   - `warn`: a softer problem or a cognitive bias (Confirmation bias, Availability heuristic, Loaded language, Stereotype…).
   Give each box a one-line note saying why, in plain words.
5. **Tests.** For each weak premise, one way to knock it out:
   - parallel cases: the same reasoning applied where the answer is obvious (swap the group, the field, the direction);
   - a counterexample;
   - "who is in the sample?" for anecdotes.
6. **Set pictures (optional).** Use a Venn when the claim is about groups or categories ("all X are Y", "X is part of Y", "people like X do Y"). Usually two panels: **what the claim implies** (`inside`) and **what the evidence shows** (`overlap`, with the evidence as dots in the overlap). Skip it when the claim isn't about groups.
7. **Charitable reading.** The strongest version the evidence does support. End on it.

Rules:

- Criticise the argument, never the person. No mocking.
- Do not invent statistics, studies or quotes. Hedge general facts ("most couples are within a few years of age") or leave them out.
- Do not repeat unsourced accusations about real people as facts. Describe them as "claims about celebrities, no source".
- When the analysis relies on facts from outside the user's text (news, dates, numbers), list them in `sources`, and put a one-line `card.footer` naming them. Mark sources you could not read (paywall, login) as "further reading", not as evidence.
- Quote premises and the conclusion verbatim from the post where possible (translated for other languages, saying so in `claim.who`), and keep the author's own qualifiers so the map is not a straw man.
- Keep box text short: about 90 characters for a premise, 120 for a note. The card shrinks text that overflows, but short text reads better.

## 3. Write the data file

Write JSON to a scratch location. Every piece of text can be a plain string (same in all languages) or an object per language, `{ "vi": "…", "en": "…" }`; arrays too (`"body": { "vi": [...], "en": [...] }`). Keep ids, `kind`, `tone` and `layout` plain. Schema (see `examples/` for complete bilingual files):

```jsonc
{
  "langs": ["vi", "en"],              // first one is the default; "langNames": { "vi": "Tiếng Việt" } is optional
  "pageTitle": "Math and CS",         // 2–4 word name for the page/Artifact
  "title": "Is math now part of CS?", // page H1
  "eyebrow": "X · Argument map",
  "claim": {
    "who": "<b>Name</b> @handle",     // HTML allowed; may be omitted
    "text": "“The claim, quoted”",
    "context": ["Short paraphrase of replies or follow-ups"]
  },
  "lead": "One or two sentences: what holds up, where it breaks. HTML allowed.",
  "argument": {
    "premises": [                     // 2–5; the card shows the first 4
      { "id": "p1", "kind": "stated", "text": "P1: …", "tags": [{ "label": "True", "tone": "ok" }], "note": "…" },
      { "id": "h1", "kind": "hidden", "text": "(hidden) …", "tags": [{ "label": "Hasty generalization", "tone": "bad" }], "note": "…" }
    ],
    "conclusion": { "text": "∴ …", "tags": [...], "note": "What the evidence does support: <b>…</b>", "after": "No longer follows" }
  },
  "vennLead": "…",
  "venn": [                           // optional, 0–3 panels (card uses first 2)
    { "tag": "The claim", "tone": "bad", "layout": "inside",
      "a": { "label": "Math" }, "b": { "label": "CS" },  // inside: A sits inside B
      "note": "…", "cardNote": "shorter note for the card" },
    { "tag": "What the evidence shows", "tone": "ok", "layout": "overlap",
      "a": { "label": "Math" }, "b": { "label": "CS" },
      "items": { "a": ["only-A", "lines"], "b": ["only-B", "lines"], "both": ["overlap label"] },
      "dots": 3, "note": "…" }
  ],
  "testsLead": "…",
  "tests": [
    { "target": "h1", "button": "hidden premise", "kind": "Hidden premise · parallel cases", "title": "…",
      "parallels": [["case", "so … ?", "so"]], "body": ["paragraph, HTML allowed"] }
  ],
  "steelman": { "title": "The charitable reading", "quote": "…", "body": ["…"] },
  "sources": { "title": "Sources", "items": [
    { "label": "Wikipedia: …", "url": "https://…", "note": "what this source backs" } ] },
  "labels": { },                      // optional overrides of UI strings (see below)
  "card": { "eyebrow": "…", "headline": "…", "premises": [{ "note": "shorter" }], "conclusion": {}, "footer": "Sources: … · …" }
}
```

- Venn labels: keep each title under ~20 characters and each `items` line under ~12 characters; split longer text into lines.
- UI strings (section titles, legend, Strike / Restore, theme names) are built in for `vi` and `en` in `templates/i18n.js`. For another language, give every key in `labels` as per-language objects; the keys are listed in `CTV_LABELS.en` in that file.
- `card` overrides are optional: use them when a note is too long for the picture.

## 4. Build

```bash
node <skill-dir>/scripts/build.mjs page <data.json> <out.html>
node <skill-dir>/scripts/build.mjs card <data.json> <out.png> --lang vi
node <skill-dir>/scripts/build.mjs both <data.json> <out-dir>     # page.html + card.<lang>.png per language
```

The script validates the data first, says what is missing, and warns about text that lacks a translation (it falls back to the first language). The card needs Chrome or Edge; set `CHROME_PATH` if it is not found.

## 5. Check, then deliver

- **Card**: open each PNG with the Read tool once (translations change line lengths). Look for text running past a circle or box, labels touching, or a box crammed to tiny text. Fix the data (shorter text, split Venn lines), rebuild, and look once more at most.
- **Page**: publish `page.html` with the Artifact tool (run its `quickstart` first if your instructions require it; give a short `icon` such as "logic" and a one-sentence `description`). Without the Artifact tool, give the user the file path.
- Send the PNG(s) to the user (SendUserFile when available) and give its full path. Mention it lives in a scratch folder if it does.
- In your reply, summarise the breakdown in a few lines: each box, its label, and the charitable reading. Offer a one-line reply the user could post with the image.
