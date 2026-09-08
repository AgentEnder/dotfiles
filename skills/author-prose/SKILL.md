---
name: author-prose
description: >-
  Author or rewrite prose so it reads the way Craigory actually writes, sized to the purpose it
  is for. Covers a comment on a community contributor's PR, an issue filed on a repo you do not
  own, a Linear comment to a colleague, a Slack message, a blog post, and documentation, and can
  sweep a repo's markdown for the habits that mark a page as machine-written. Use whenever you
  are about to hand the user text that another human will read: a PR body or description, a PR
  or issue comment, a Linear or GitHub reply, a Slack draft, a release note, a blog post, a
  README, a design note, a guide. Also use when asked to review, tidy, trim, de-slop or
  fact-check written docs; when prose "reads like AI wrote it"; when a page is longer than its
  subject warrants; or when the user says "make this sound like me", "too long", "be concise",
  "trim this", "that's not how I'd say it", or rejects a draft as wordy, over-explanatory or
  robotic.
user-invocable: true
argument-hint: "[path or purpose] - one draft plus who it is for, or paths to sweep"
---

# Writing as Craigory

Usually you are editing, not writing. The argument, the evidence, and what he wants to say are his. This skill decides how much of it survives and in what register.

Two modes. **One artifact for one reader** is the common one, and the rest of this file is about it. **Sweeping a repo's markdown** is the other: run the audit script and work its findings, per `references/docs.md`.

```sh
node ~/dotfiles/skills/author-prose/scripts/prose-audit.mjs [paths...]
```

## Order of operations

1. **`unslop-text` first.** It removes the mechanical tells and it has a scanner. Run it before you think about voice, because most of what makes a draft wrong is not voice at all.
   ```bash
   python3 ~/dotfiles/skills/unslop-text/scripts/unslop_text_scan.py <file>
   ```
2. **Name the purpose and the reader**, then read exactly one reference below. What the reader has to do after reading decides how much detail earns its place. That judgement is the hard part, not a word count.
3. **Cut, then cut again** (`references/conciseness.md`). This is the bulk of the work, and it is iterative: paragraphs go on the first pass, clauses on the second.
4. **Format**, for anything markdown. Prose goes one line per paragraph, so a later edit rewraps nothing and the diff stays on the sentence that changed:

   ```bash
   npx oxfmt -c ~/dotfiles/skills/author-prose/config/.oxfmtrc.json <file>
   ```

   `proseWrap` is config-only. Every CLI spelling is rejected (`Error: --proseWrap is not expected in this context`), so `-c` at a config kept here is the way to get it in one command without leaving an `.oxfmtrc.json` in the working directory. Default is `preserve`, which keeps whatever line breaks you typed.

   oxfmt is not installed globally, so let the package manager fetch it. It reflows tables and normalises spacing, so run it last, after the cutting settles. Drop `-c` when the repo has its own `.oxfmtrc.json` and you want the repo's rules.

   **oxfmt COLLAPSES table padding, and he wants tables expanded.** It rewrites an aligned table to minimal pipes (`| --- | --- |`). Unwrapped paragraphs and padded tables are both wanted, so the aligner runs AFTER oxfmt, never before, or oxfmt flattens it again:

   ```bash
   python3 ~/dotfiles/skills/author-prose/scripts/align-md-tables.py <file>
   ```

   Verify by pipe position, not by eye: a 200-char row wraps in the terminal and an aligned table reads as broken. Equal `|` offsets on every row is the check.

5. **Show him the draft** with `preview-prose` when it is going to another human and is close to done. Prose on the left, his notes on the right; it returns his feedback, so loop through step 3 again with it rather than defending the draft.
6. **Report the word count before and after.** He reads that number as the signal that a cut actually happened.

## Pick the reference

| Writing to                                  | Read                           |
| ------------------------------------------- | ------------------------------ |
| a PR body (yours, any repo)                 | `references/pr-body.md`        |
| someone else's PR, reviewing it publicly    | `references/review-comment.md` |
| a community contributor's PR/issue          | `references/community-pr.md`   |
| a maintainer, on your PR in their repo      | `references/upstream-pr.md`    |
| a maintainer, filing an issue in their repo | `references/upstream-issue.md` |
| a colleague, replying to their review       | `references/colleague.md`      |
| Slack                                       | `references/slack.md`          |
| the blog                                    | `references/blog.md`           |
| docs, a README, a guide                     | `references/docs.md`           |
| any of them, choosing a form                | `references/interjections.md`  |

## The rules that hold everywhere

**Cut before you polish.** A well-phrased paragraph that the reader does not need is still the problem. `references/conciseness.md` is the largest document here.

**No em dashes.** Not one. He has called them agent slop in as many words, and they are the single loudest tell. A comma, a colon, a period or parentheses always work. His own Linear history is full of them. Those comments were drafted by agents on his behalf, so they show what a model reaches for, not house style. Do not calibrate on them.

Cut these first, in this order:

- The "it's not X, it's Y" cadence, and its cousins ("this isn't just A, it's B").
- **Any sentence whose shape is doing rhetorical work**, which is the same instinct in
  disguise: "X works. Y does not." / "You only run one of these by hand. The rest come along
  for the ride." / "That is the payoff." An editor deleted every one of these from a blog
  draft as sounding "horrible". Test: if it would land in a conference talk, cut it.
- Rules of three. Three adjectives, three parallel clauses, three-item lists that exist for rhythm rather than because there are three things.
- Your own deliberation. What you considered, verified, ruled out, or found interesting is not content. _"Things I question here don't necessarily need to be in the blog."_
- Sentences that narrate the document. "Here is what I found", "the following section covers", a closing paragraph that restates the one above it.
- Anything the reader cannot act on.

**Simplified technical English.** Short sentences. One clause where two would do. Concrete nouns. He asks for this by name.

**Own mistakes in the first person, plainly, once.** "The regression is mine." Not a paragraph of apology, and not a passive construction that hides who did it.

**Never send it, unless he approved it in a preview.** Draft to a file or into the conversation and let him send it. That holds unconditionally for PR comments and Linear comments.

**Slack is the one exception, and only through `preview-prose`.** Show him the draft with that skill, then send with `slack_send_message` when he approved it. It reports the outcome on the first line of stdout and exits 0 whatever he decided. `status=cancelled` is a cancel: stop and ask. `status=empty` is an empty buffer, which is approval outright. `status=feedback` gives you what he typed, and **you** decide whether it is approval or a change request. There is no keyword list, on purpose: one would read `yeah thats fine, send it` as a change request.

A nonzero exit means the preview itself broke. It is not an answer, and it is never a send.

Let ambiguity fall to the safe side. Any ask, correction, question or condition makes it a change request even when it sits next to praise, so `lgtm but fix the second sentence` means revise and show him again. Approval is a buffer that asks for nothing. If you cannot tell, you do not have approval: quote what he wrote and ask.

Set `PREVIEW_PROSE_ON_ACCEPT` to name the send before you run it, e.g. `post to the #nx thread as you, from your account`. It puts that line in the buffer next to the save instruction. Without it, an empty save only means "no notes", and that is not consent to publish under his name. If you did not run the preview, you do not have approval; fall back to `slack_send_message_draft`.

## Feeding corrections back into this skill

When he corrects a draft, decide whether the correction belongs in this file before you apply it and move on. A correction that stays in the conversation gets made again next week.

**The generality test.** Would it hold for a different reader, a different subject, and the next draft of this kind? If yes it is a rule, and it goes in the matching reference. If it only holds for this artifact, fix the draft and leave the skill alone.

**One case is a data point.** Wait for a second instance before writing it down, unless he states it in general terms himself. "way too long, be concise" and "no em dashes" are general on their face. "drop the paragraph about `command` and `commands`" is not, though the reason under it (out of scope for this reader) already is, and that reason is what gets recorded.

Never encode the subject matter, or a preference for one reader that you have seen once. Accepting a draft is not stating a preference.

Prefer amending an existing rule to adding a new one. Every draft yields a correction, so this file grows by accretion unless you fold each instance into the rule it is an instance of.

Say what you changed and why it generalised, in one line, so he can overrule the call.

## Related skills

- `unslop-text`: the mechanical tells and the scanner. Always compatible, always first.
- `nx-blog-post`: owns the nx-blog mechanics, the voice corpus to read, and the vale rules. `references/blog.md` here adds only what one draft cycle taught, and does not restate it.
- `babysit`: owns the Slack review-split draft. `references/slack.md` here is the voice for it.
- `preview-prose`: shows him a draft in a Herdr tab and returns his notes. It is also the only route to sending a Slack message without asking, via its `status=empty`.
