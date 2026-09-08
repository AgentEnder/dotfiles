# Commenting to a colleague (Linear, or a PR review reply)

The reader is a maintainer who already left you feedback, or who owns the ticket. They know the codebase. They do not need the background, and they will skip anything that reads as padding.

This is the one register where length is earned, because the alternative to detail is another round trip. It is not permission to pad.

**That earned length is private-surface only.** It holds for Linear, and for a reply in a thread that already has the context. It does not transfer to a public review of someone else's PR, where you are the one asking for changes and the reader's attention belongs to the ask: that is `review-comment.md`, and it lands three to five times shorter.

## Shape

Headed sections, so the reader can skip to the one they care about. A pattern that works:

```markdown
Fixed at `<sha>`. <one line saying what the state now is.>

## Critical - <the finding, restated in their words>

<what you did, and why. Where you deviated from their sketch, say so and say why.>

## Suggestions

- **<item>** - taken / dropped, and the reason if it is not obvious.

## Evidence

<test counts, CI state, what you could not verify and who covers it.>
```

## Register

- **Concede first, then explain.** "The Critical was mine and you traced it further than I had." Never open with the defence.
- **Name where you disagreed, in its own paragraph.** "One place I went the other way from your sketch" followed by the principle you applied, and then an offer to reverse it. Do not bury a deviation inside a list.
- **Correcting someone gets an explicit frame.** "Correcting this for the record, since it is the reverse of what shipped and it is the kind of thing that gets acted on later." Then the fact, then the evidence, then why the wrong version is a reasonable thing to have believed.
- **Say what you did not do**, when the work was yours to do. "Still not addressed, so they are not assumed done" plus the list. Silence reads as done. This covers scope you owned and dropped, not tooling that failed you: for that, see the public-surface rule below.
- **Flag maintainer calls as maintainer calls.** Where a decision was theirs to make and you made it, name it and offer to unwind it.
- Evidence goes last and is concrete: test counts, shas, CI state.
- **On a public surface, cut what you could not run.** GitHub is public. A list of what your environment could not execute reads as an agent narrating its own limits, and it is the clearest single tell that the comment was machine-drafted. Give the results you have. Where a gap genuinely changes what the reader should do, name it as theirs to close ("worth a CI run before merge"), never as yours to confess. Linear is private and the team reports coverage honestly there, so it stays.

## The trap

Your own Linear history is dense with em dashes, and reads as if that were house style. Those comments were drafted by agents on your behalf and posted with light editing. **They are evidence of what a model reaches for, not of how he writes.** Strip them.

The same goes for their length. Several run past 900 words because nobody trimmed them, not because that was the target.

## Slack is not this

A question to a colleague in Slack is one or two sentences and looks nothing like the above. See `slack.md`. Structure belongs to the ticket; Slack is for pointing at the ticket.
