# Cutting

The default failure is length. Every draft an agent hands over is roughly twice the size it should be. The excess is whole paragraphs: arguments for something nobody disputed, and narration of work nobody asked about.

## The method

The method is not a word count. Three questions, then iterate:

1. **What is this text for?** One action, one decision, one answer. Name it before you cut.
2. **Who reads it, and what do they already know?** Detail they can see for themselves, or that does not change what they do, is overexplaining.
3. **Does this phrase serve that?** Ask it of every phrase, not just every paragraph. Cut what fails. Re-read the whole thing. Ask again.

The iteration is the part that works. A first pass removes paragraphs, a second removes clauses, a third removes the hedge you did not notice you had doubled. Stop when a cut would take something the reader needs.

Purpose is the gate, not quality. A true, well-written, interesting phrase that does not serve this reader is still cut.

## What the measurements say

One real PR comment, across the rounds he asked for:

| Round | Words | What changed                                                          |
| ----- | ----- | --------------------------------------------------------------------- |
| 1     | 898   | The agent's first draft.                                              |
| 2     | 424   | "way too long, be concise. Simplified technical english."             |
| 3     | 330   | First person, one paragraph deleted, and the table rows it referenced |
| 4     | 388   | Table rows restored. The paragraph stayed gone.                       |

Two things to take from this. The landing zone was **43% of the first draft**. And round 4 went _up_, because round 3 had cut data along with the prose that discussed it. Prose is the fat. Tables, code and numbers are the meat, and they are cheap per unit of information.

His words on that: _"Its fine to have the table rows, just dropping the paragraph of text was intended."_

## The cut list, in order

Work top to bottom. Each pass is mechanical enough that you do not need taste for it.

1. Paragraphs whose content is already a table row. If the table says it, delete the paragraph. Do not delete the row.
2. Anything outside the scope the reader is in. A neighbouring bug, a related case, an observation about a different file. _"the `command` and `commands` bit being not part of this PR should just be left out, its not a useful paragraph."_ If it deserves attention it deserves its own ticket, not a paragraph here.
3. Your process: what you checked, what you almost concluded, which alternative you discarded and why. Report the finding, not the search.
4. Explanations of things visible in the artifact. _"The two nested lines came from that command, not from you"_ was cut with _"nobody talks like that and its not really adding anything."_ If a diff shows it, the diff shows it.
5. The closer. A final paragraph that restates the piece. Stop at the last fact. "Thanks again." is a complete closing for a PR comment.
6. Hedges and intensifiers: "essentially", "actually", "quite", "it's worth noting that", "importantly". Delete, do not replace.
7. Lead-ins. "Here's what I measured" earns its place once, before a table. "Let me walk through", "the following", "as mentioned above" never do.

## Then, per sentence

- Two sentences that share a subject usually want to be one. He asked for exactly this: _"I'd combine these two paragraphs."_
- If a sentence needs a comma-spliced aside to make sense, split it or cut the aside.
- Watch for the sentence that sounds profound and says nothing. _"Building the front end is what you actually run, and everything else is a consequence of it"_ got flagged as _"pretty odd? Not very human."_ If you could not say it out loud to someone, cut it.
- Keep verbs as verbs. "the implementation of caching" is "caching it", "provides validation of" is "validates". A nominalization is a verb the sentence is hiding, and a reader has to unfreeze it.
- Every pronoun, and every "this", "that" or "the change", must point at something the reader can name without scrolling. If it has been a paragraph since the noun, repeat the noun.
- Never open a paragraph with a code block. The sentence that motivates the code comes first. He flagged _"several sentence/paragraphs start with a codeblock... thats not right."_

## What cutting must not take

Cutting has a failure mode of its own, and it showed up once the drafts got good. A blog post
went 2381 words to 1483 under this document's pressure, and the human editor then put **133
words back**. He did not restore anything the cut list names. He restored orientation: which
project we are in, where the files sit, what is coming next. The clever sentences the cut had
preserved were the ones he deleted.

So the cut list is right about what to remove and silent about what to protect. Protect:

- **Orientation.** Where the reader is, what the thing is called, what surrounds it. A
  compressed fragment like "The example is a products API: one endpoint returning one record"
  is dense, not clear.
- **Signposting, in anything tutorial-shaped.** "That's next" earns its line when the reader
  is following along. The rule about cutting sentences that narrate the document is aimed at
  reports and reviews, not walkthroughs.
- **The concrete noun.** Compression that turns a named project into "the library" costs the
  reader more than it saves.

**One figure per sentence, and cash it out.** Cutting hard packs a sentence: a metaphor, a verb
frozen into a noun, and the two set side by side ("the drain holds the whole pipeline hostage").
Any one of those is fine alone. Two adjacent is what reads as dense. Unpack it by saying it as a
spoken sentence with the verbs doing the work, and never leave the reader inside a metaphor.

Being under the landing zone is only fine if what is missing is prose. If what is missing is
the reader's footing, the draft is not concise, it is thin.

## Density is a tell on its own

Length is not the only thing that reads as machine-written. A draft can hit its word count and still look wrong, because it arrives as a wall of uniform paragraphs.

_"Just too much prose in one big block, looks very AI."_

Prose is the most expensive form per unit of information and the one a model defaults to. So after the cut list, look at the shape rather than the count:

- Anything that is a list should be a list. Findings, follow-ups, asks, options. The converse holds too: causality and sequence stay in paragraphs, because bullets drop the joints (because, so, then) that carry an argument.
- A paragraph past roughly 60 words wants to be split, or was never a paragraph.
- Code, tables and numbers carry more per line than prose and read as human. Prefer them.
- Two consecutive paragraphs of similar length and rhythm is the pattern to break.

This is a separate pass from cutting, and it comes after. Cutting a wall of prose in half leaves a smaller wall.

## Where things have landed

Observations, not targets. These are where past drafts settled once they were cut properly, so they are useful for noticing you are in the wrong register. Being over is a prompt to re-read the cut list. Being under is not a problem. Never cut to hit a number, and never pad to reach one: a rerun request that needed one sentence should be one sentence.

| Purpose                       | Words                          | Paragraphs                           |
| ----------------------------- | ------------------------------ | ------------------------------------ |
| Slack, spontaneous            | under 40                       | 1                                    |
| Slack, a structured ask       | 60 to 150                      | a lead line plus bullets             |
| Public review of someone's PR | 150 to 250                     | a blocker, then one line per ask     |
| PR comment to a contributor   | 250 to 400                     | 6 to 9 short ones, plus a table      |
| Linear comment to a colleague | 300 to 900                     | headed sections, evidence at the end |
| Blog section                  | 150 to 400                     | 3 to 5                               |
| Doc page                      | as short as the subject allows |                                      |

Linear is the one place length is genuinely permitted, because the reader is a maintainer who asked for the detail and the alternative is a second round trip. It is still not permission to pad: the sections are headed so the reader can skip, and every claim carries evidence.
