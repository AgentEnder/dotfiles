---
name: review-prose
description: >-
  Review a draft against the author-prose guidance and return a located critique: file:line,
  what is wrong, which rule it breaks, and the fix. Use when asked to review, critique, audit
  or do a pass on prose that already exists, when the user says "review this", "what's wrong
  with this draft", "does this read like AI", "give me notes", or invokes /review-prose. This
  is the counterpart to /preview-prose: there the user reviews, here you do.
user-invocable: true
argument-hint: '[path to the draft] - and who it is for'
---

# Reviewing prose

`author-prose` writes. `preview-prose` puts a draft in front of the user so **they** review it.
This is the third case: **you** review, and hand back a critique they can act on line by line.

**You are not the author here.** Do not rewrite the draft, do not hand back a revised version,
and do not fix things silently as you go. A review that arrives as a new draft cannot be argued
with, and the point of a review is that they get to disagree.

The one exception is a mechanical defect with exactly one right answer (a hard-wrapped
paragraph, a broken link, a snippet that no longer matches its source file). Fix those and say
you did, in a single line at the end. Everything else is a finding.

## Do not duplicate the guidance

The rules live in `author-prose` and there is one copy:

```
~/dotfiles/skills/author-prose/SKILL.md          the universal rules and the cut list
~/dotfiles/skills/author-prose/references/       one file per purpose; read the matching one
~/dotfiles/skills/author-prose/MARKERS.md        the tells
```

Read the reference for what the draft **is** (`blog.md` for a post, `pr-body.md` for a PR
description, and so on) before reading the draft. Reviewing without it produces generic
writing-teacher notes, which is the failure mode of this skill.

## Order of operations

1. **Run the mechanical passes first** and keep the output. They find things reading does not,
   and they cost nothing:

   ```bash
   python3 ~/dotfiles/skills/unslop-text/scripts/unslop_text_scan.py <file>
   node ~/dotfiles/skills/author-prose/scripts/prose-audit.mjs <file>
   ```

   For an nx-blog post also run vale per the `nx-blog-post` skill. The binary is a mise shim
   with no global version, so `mise x vale@3.15.2 -- vale --config=.vale.ini <file>`.

   **Verify each hit before reporting it.** These scanners have a known false-positive rate:
   the hedging regex fires on "depends on it the way it depends on anything else", and the
   long-sentence count includes deliberate ones. A finding you did not confirm by reading the
   line is noise, and noise is what makes a reviewer ignorable.

2. **Fact-check anything checkable.** This outranks every style note. If the draft documents a
   real repo, parse its code blocks and diff them field by field against the source; do not read
   them side by side. If it makes a claim about behaviour, run the thing. A post that reads
   beautifully and describes a config that no longer exists is worse than a clumsy accurate one.

3. **Read for the argument**, once, without noting style. What is the piece claiming, and does
   the shape serve it? Structural findings are worth more than every sentence-level note
   combined, and they are the ones you will miss if you start at the top and work down.

4. **Read for voice**, against the reference you loaded in step 0.

5. **Report.**

## What a finding looks like

One per issue, most severe first, each carrying its own evidence:

```
blog.mdoc:128  epigram
    "You only ever run one of these by hand. The rest come along for the ride:"
    A balanced sentence doing rhetorical work. blog.md records an editor deleting
    every one of these as sounding "horrible".
    → "This is what our ideal task pipeline should look like."
```

Anchor to a line, quote the text, name the rule, propose the replacement. A note the author
cannot locate is a note they cannot act on.

## Severity, in order

1. **Wrong.** Contradicts the source, the code, or observable behaviour.
2. **Stale.** Was true, is not now. Claims about a PR's state, a version, an inferred target.
3. **Structural.** The section is in the wrong place, the piece opens on the wrong thing, a
   heading promises something the section does not deliver.
4. **Voice.** The epigram, the trailing flourish, the bare imperative, the counterfactual aside,
   over-compression that costs the reader their orientation. See `references/blog.md`.
5. **Mechanical.** Code-span openers, hard wrapping, em dashes, formatting.

Report in this order regardless of where they sit in the file. If you have nothing above
severity 4, say the draft is sound and give the voice notes as suggestions rather than defects.

## What is not a finding

- **A deliberate choice you would have made differently.** Register, structure and emphasis are
  the author's. Note it once if it is genuinely load-bearing, then let it go.
- **A tell the scanner named but the sentence does not have.** See step 1.
- **Anything a previous reviewer already settled.** Read the PR comments first when the draft
  is on one. Re-litigating a resolved thread wastes everyone's turn, and the author has usually
  already argued the case better than you will.
- **House style you are guessing at.** If you are unsure whether "frontend" or "front end" is
  the convention, check what the repo does rather than asserting one.

## Handing it over

Findings go in chat by default. When there are many, or they are spread across a long piece,
offer `preview-prose` instead: it anchors each note to its line in a tuicr tab, which is easier
to work through than a list in chat, and lets them reply per finding.

Never apply a batch of voice findings yourself and call it a review.
