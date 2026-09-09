# Markers

The full list behind [SKILL.md](SKILL.md)'s short one. None of these is
banned; the script flags them for a look. The test is always the same: delete
the word and read the sentence again. If nothing was lost, it was noise.

## Vocabulary

delve, tapestry, paramount, pivotal, leverage, showcase, underscore, seamless,
robust, crucial, vital, landscape, realm.

Also _crux_, _load-bearing_ and _honestly_, which a model uses to signal that
it has weighed something. State the thing that matters and why.

And the self-congratulatory adverbs: _deliberately, precisely, genuinely,
exactly, carefully, thoughtfully_. If a design choice was deliberate, the
reason demonstrates it.

The adverb sometimes earns its place. "You open it deliberately and close it
yourself" contrasts with a window that appears on its own, so the word is
carrying meaning. "The re-prompt is deliberately cheap" is not: delete it and
nothing is lost.

## Forced transitions

Moreover, Furthermore, Consequently, Additionally at the head of consecutive
sentences. Usually deletable with no loss.

## The rule of three

"fast, reliable, and secure." Three is what a model produces when it does not
know how many there are. Say two if there are two, or five if there are five.

## The colon hinge

A sentence whose left side labels what the right side does: "the clear
shape: ...", "the honest fix: ...", "what you were circling: ...". It is the
em dash in a different glyph, and it is what a draft turns into when the
dashes are stripped mechanically. A colon introduces a literal list or a code
block. Rewrite the rest as two sentences, or join them with because, so, but
or and.

## Verbless fragments as openers

"Two things worth watching." "The difference." "One caution." The fragment
names a topic and the next sentence says something about it, so it is the
announcing habit by other means. Merge the two: "The first thing to watch is
whether it holds on long threads." Fragments are fine inside parentheses.
This is also the shape of the over-corrected anti-AI register, so it is a
tell in both directions.

## "Not just X, but Y"

Also "X isn't about A, it's about B." Parallel contrast used to sound
profound. State the claim.

## Hype without a fact

"powerful", "elegant", "seamless" attached to nothing measurable. Replace with
the number, the constraint, or nothing.

## Metronome rhythm

Paragraphs of near-identical length, each opening the same way: four
consecutive `**BOLD** — gloss` paragraphs, say. Vary or merge.

## Bulleted paragraphs

A list where every item is a bolded sentence followed by three or four lines
of explanation. The bold is not the problem: a feature list with short labels
is ordinary README form, and an error-message list should bold the error. The
problem is that each item has grown into a paragraph, so the section delivers
prose while presenting as a summary.

**Do not fix this by deleting the hyphens.** Converting the bullets to
paragraphs moves the same words around. These sections are long because they
say too much. Find the fact each item exists to state, keep that, drop the
rest. Two useful questions:

- **Is it describing the figure or example below it?** That is already showing
  the reader. Cut the paraphrase; keep the fact the picture cannot state.
- **Is another section saying it too?** One of the two is the canonical home.

## The safe conclusion

A closing paragraph that summarises what was just said and commits to nothing.
Real docs end at the last useful sentence, or on a link. Delete the recap.

## Dramatised limits

A model reaches for the strongest available word when writing about something
a tool cannot do, and lands on a claim nobody meant. "Windows depends on
facilities it does not have" was published in one of these repos; every
facility had a counterpart under another name, and the true statement was "not
yet". Say what is missing and whether anyone intends to build it.

This is a voice problem that produces a factual one, so catch it in both
passes.

## Emotional flatline

Uniformly upbeat and formal. Where something is genuinely a downgrade, a
limitation or a footgun, say so plainly.

## Worked rewrites

| Before                                                             | After                                                              |
| ------------------------------------------------------------------ | ------------------------------------------------------------------ |
| `` `aws-vault` — AWS only.``                                       | `` `aws-vault`: AWS only.``                                        |
| The manager never holds a decision — that's the prompt's job — so… | The manager never holds a decision (that is the prompt's job), so… |
| Splitting them is the point: the window that interrupts you…       | They are split so the window that interrupts you…                  |
| The real cost: every box re-resolves the corpus.                   | Every box re-resolves the corpus, so                               |
| not because typing is nicer but because the flow checks its work   | Prefer this path. The flow checks its work:                        |
| `3` and `1` are distinct on purpose. A denial is final —           | `3` and `1` are distinct. A denial is final, so                    |

## Where the register legitimately differs

Contributor docs and source comments are written for whoever changes the code
and carry rationale a user page should not. They may be discursive. They are
still subject to everything above; being internal is not a licence for
three-clause sentences.

A figure caption is the tightest register there is: one or two sentences,
present tense, describing what the reader is looking at.
