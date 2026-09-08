# Documentation

The whole documentation register. Absorbed from the former `docs-voice` skill, which no longer
exists separately.

## Which register

Two live here, and picking the wrong one is the main mistake.

| Writing                                    | Register                      |
| ------------------------------------------ | ----------------------------- |
| README, repo docs, a design note, a skill  | this document                 |
| A guide meant to read like him teaching it | the blog voice, see `blog.md` |

**They conflict.** The docs register fights `you can` and hedging, which the guide
voice uses deliberately. `nx-blog-post` already records this: for a guide, the published corpus
wins. For a README or an internal doc, this document wins outright.

## Calibrate against real docs, never against the tree

Most documentation in these repos was drafted by an agent. Its habits are evidence of what a
model reaches for by default, not of a style anyone chose. Never justify a construction by how
common it already is in the tree. That reasoning is circular, and it is how the patterns
accumulated in the first place.

Sampled from ripgrep's `GUIDE.md`, the `gh` manual and aws-vault's README:

| Trait           | Them                                          | The default drift               |
| --------------- | --------------------------------------------- | ------------------------------- |
| Em dashes       | 3 or 4 in an entire document                  | 30 on a page                    |
| Sentence length | 8 to 18 words                                 | a long tail past 30             |
| Section endings | Stop at the last fact. No recap.              | A closer restating the section  |
| Caveats         | Plain: "Note:", a conditional clause, a table | Dramatised with emphasis        |
| Tradeoffs       | A comparison table                            | Persuasive prose                |
| Mood            | Imperative ("Run `gh auth login`")            | "You can run", "You'll want to" |
| Bold            | Rare, reserved for a critical negation        | Bold on every list item         |
| Editorialising  | Absent. Facts, then stop.                     | "deliberately", "actually"      |

Representative of the target register:

> "ripgrep is a command line tool that searches your files for patterns that you give it."

It states a fact and stops. It does not tell you the fact is important.

Zero em dashes, not three or four. That is the one place to go past the sample.

## Sweep a repo

```sh
node ~/dotfiles/skills/author-prose/scripts/prose-audit.mjs [paths...]
```

Advisory, always exits 0. It finds candidates, you decide. Nothing here is a gate, because
every
one of these findings has a legitimate exception. `--json` for machine output, `--budget=<n>`
to
change the per-file prose-word ceiling (default 1200).

Inside a checkout that `brain sync` has installed into, the same script is at
`.claude/skills/author-prose/scripts/prose-audit.mjs`.

## The two failure modes worth ranking first

**A claim that is wrong** outranks every style finding. Verify against the file that owns the
answer, never against another page. Two pages agreeing means nothing, since one was likely
copied from the other.

Overstating a limitation counts as wrong. "It depends on facilities the platform does not have"
and "nobody has built it yet" are different claims, and a model reaches for the stronger one.

**A page longer than anyone will read** is next, and it is the one that resists fixing, because
rearranging a page feels like fixing it.

## Cutting

Reformatting reads as editing and is not. Unbulleting a list, splitting a sentence, swapping a
dash for a comma: the page holds the same material afterwards.

Measure. The script prints prose words per file. Record the number before and after. Under
about
10% and you rearranged it. Real cuts run 20 to 30%.

Volume lives in four places, and none of them is punctuation:

- A section narrating a figure or example beneath it. The picture is already showing the
  reader.
  Keep only what it cannot state.
- The same fact in two sections of one page.
- Onboarding for something a worked example already demonstrates.
- A section written for a different audience. Contributor mechanics on a user page, porting
  notes in a guide. Move it rather than delete it.

A move is one commit. Cutting a paragraph from one page and adding it to another is two edits
that must land together. Land half and the content exists nowhere. This has happened, to a
warning about data loss.

## The markers to remove

In the order they tend to show up. The full list, the vocabulary and worked rewrites are in
[MARKERS.md](../MARKERS.md).

- Em dashes. Default to a comma, colon, parentheses, or full stop. Any bracketing pair is a
  defect.
- Editorialising adverbs: _deliberately, precisely, genuinely, actually, exactly, carefully,
  thoughtfully_. If a choice was deliberate, the reason shows it. Saying "deliberately" asks to
  be believed instead.
- The rule of three. "fast, reliable, and secure." Three is what a model writes when it does
  not
  know how many there are. Say two if there are two.
- Bulleted paragraphs, where every item is a bolded sentence plus a paragraph. Fix by cutting
  each item down, never by converting the list to prose. Same words, no gain.
- "Not just X, but Y" and other parallel contrasts used to sound profound.
- The safe conclusion: a closing paragraph that recaps and commits to nothing. End on the last
  useful sentence, or a link.
- Metronome rhythm. Consecutive paragraphs of equal length opening the same way.
- Hype with no fact attached: _seamless, powerful, robust_.

## What not to do

- Do not unbullet to hit a word count. Measure. If the count did not move, neither did the
  problem.
- Do not flatten a real caveat. Where something is a downgrade, a limitation or a footgun, say
  so in the plain words a colleague would use. Uniform upbeat formality is itself a marker.
- Do not edit generated prose in place. If a file comes from a generator, the fix is upstream
  in
  the doc comment or template. Editing the output loses the work at the next regen.
- Do not invent scope. A prose pass that starts renaming APIs has stopped being a prose pass.
- Repetition is sometimes correct. A safety-critical one-liner may be worth restating where a
  reader will act on it. Duplicated explanation is the problem, a duplicated warning usually is
  not.

## Design docs live in brain

Architecture notes, plans and decision history live in `~/repos/brain`, not in the repo. When a
change lands that alters what a brain doc describes, update the doc. Nothing else will catch
the
drift, because there is no copy in the repo. Search with the `brain-search` skill first.
