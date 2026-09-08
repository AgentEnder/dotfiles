# Reviewing someone else's PR, on a public repo

The reader is the author, and they are going to act on this. They can read the diff. What they cannot get anywhere else is which of your findings blocks, and what closing it looks like.

This is not `colleague.md`. That file is for replying to a reviewer on a private surface, where length is earned because the alternative is another round trip. Here the surface is public, the reader is the one being asked to change something, and a long comment costs them attention on the ask that actually matters.

## Ask for as much as you need. Describe each ask as little as you can.

The count of asks is not the problem, and do not cut a real one to hit a number. Five asks stated in a line each is a good review. One ask with four paragraphs under it is not.

_"Public review shouldn't limit the number of asks, its just that it should not overdescribe each ask. Some level of analysis is even fine, just don't flood the reviewer with info."_

So the budget is per ask, not per comment:

- **The blocker** gets the most room, and still not much: the mechanism in a sentence or two, the evidence that makes it credible, the fix in a line.
- **Everything else** gets one to three lines. A file reference, what is wrong, what to do.
- **Analysis is allowed** where it changes what the author does. A before/after that shows the behavior is analysis; a paragraph reconstructing how you found it is not.

## Evidence

Show the minimum that makes the ask credible, and prefer a form the reader scans. Two short code blocks contrasting old and new behavior beat any paragraph describing the same thing, and they survive being skimmed.

```
master:  Error: You cannot set "coverage.reportsDirectory" as <root>   -> file intact
this PR: src/a.spec.ts deleted, replaced by a directory of the same name
```

Cite `file.ts:line` rather than quoting the code back at the author. They have it open.

## Put each ask on its hunk, not in the body

_"can any of it be moved to file line comments attributed to individual hunk changes? That'd be preferred"_

Default to a review with inline comments anchored to the lines the PR changed, and a short summary body. GitHub already shows the author the diff around an inline comment, so the ask needs no setup and no quoted code, and the body stops being a list of file references the reader has to go and resolve.

What stays in the body: the verdict, the one ask worth naming up front, and a clause for anything you are filing elsewhere. Everything else goes on its line. The body lands well under the 150 to 250 above once the asks move out; 100 or so is normal.

Two things that make this work rather than fail:

- **Anchor only to lines the diff actually adds or changes.** GitHub rejects a comment outside the diff, and an anchor computed from the wrong side of a hunk fails the whole review call. Map the anchors off the unified diff and check each one before posting.
- **Merge near-identical asks.** Three comments saying "semicolon, see the style guide" is noise. One comment naming the other occurrences reads better and costs the author one thread instead of three.

Build it as a single review (`POST /repos/{owner}/{repo}/pulls/{n}/reviews` with `comments[]`), so the author gets one notification rather than one per ask. Write the payload to a file and let him send it.

## Cut these before posting

- **Agreement.** Decisions you looked at and endorsed do not need a section. Approving is the signal. A trade-off you want the author to reconsider is an ask; one you accept is silence.
- **Findings in other packages.** File them separately. One clause saying you will ("same shape exists in `@nx/jest`; I'll file those separately") tells the author it is not their problem and keeps it off their PR.
- **Findings you already decided not to block on.** Keep them in your own notes. Raising one and then saying it does not count spends the reader's attention twice.
- **Your process.** What you ran, what your environment could not do, which lanes you used, how many tests passed. See the public-surface rule in `colleague.md`.
- **Reassurance.** "The rest holds up" is one clause at the end, not a section explaining why each part is fine.

## Where it lands

A public review settles around **150 to 250 words**, which is well under the private-surface registers. Being over is a prompt to re-read the per-ask budget above, not to drop an ask.

Measured, `nrwl/nx#36658`, three rounds:

| Round | Words | What changed                                                                    |
| ----- | ----- | ------------------------------------------------------------------------------- |
| 1     | 1899  | Full review body, pipeline vocabulary and all.                                  |
| 2     | 903   | Em dashes, process narration, internal labels (`NET-NEW`/`TRIGGER`/`FIX`) gone. |
| 3     | 575   | _"too much prose in one big block, looks very AI"_: prose to bullets.           |
| 4     | 216   | _"way too lengthy for a public gh review"_: whole sections cut, not sentences.  |

Round 4 is the instructive one. Rounds 2 and 3 trimmed sentences and were still four times too long. What finally worked was deleting entire sections (agreement, cross-package follow-ups, minor test gaps) rather than tightening them.

Keep the long version. The full analysis went to a notes file, so the cut material was available when the author asked a follow-up question. Cutting for the reader is not discarding.
