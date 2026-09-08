# Choosing a form

Prose is the most expensive way to carry information and the first thing to cut. Before writing
a paragraph, check whether one of these carries it better. This is not decoration: in the
`#36717` PR comment, a five-row table replaced what would have been five paragraphs, and it was
the part that survived every cut.

## Table

**Reach for one when** you are comparing more than two things across more than one dimension.
Version-by-behaviour matrices, before-and-after, option tradeoffs, "who owns what".

Then **delete the prose that says the same thing.** That is the whole point, and it is the step
that gets skipped. The paragraph goes, the rows stay.

Give the reader one sentence before the table saying how to read a cell, including how you
produced it. "Each cell is `nx show project a --json` on a real workspace." Then the table.
Then
one clause per row group that needs interpreting, not one per row.

`oxfmt` reflows column widths, so do not hand-align.

## Code block

**Reach for one when** the reader will copy it, or when it is the artifact under discussion.

- Adding lines to an existing file: **show a diff**, not the whole file.
- Lines that came from a command: show the command in its own block. That replaces the sentence
  explaining where they came from.
- Config: show the shorthand a reader should actually use.
- Terminal output: paste it raw, prompt line included. In Slack that is the norm.
- **Never open a sentence or a paragraph with a code block.** Prose motivates, then code.

## Image or diagram

**Reach for one when** the shape is the point: a task graph, an architecture, a
before-and-after
of a UI, a screenshot of the failure.

- Blog posts: yes, and task graph visualisations especially. Ask for them proactively.
- Slack: screenshots are normal and need no ceremony.
- PR and Linear comments: rare. A table usually beats a diagram there.
- Ground any generated image in what the surrounding artifacts actually look like, not in what
  looks good in isolation. See `blog.md`.

## Bullets

**Reach for them when** the items are parallel and each is one line.

Not for breaking up a paragraph, and not with a bolded lead-in on every item. In Slack use `•`
and one line per item. In markdown, if a bullet needs three sentences it is a paragraph or a
table row, and it wants to be one of those instead.

## Headings

**Reach for them when** the reader will want to skip. Linear comments and docs, yes. A PR
comment to a contributor, usually not: at 300 to 400 words there is nothing to skip past.

## Plain prose

What is left. Use it for the argument, the concession, the reason, and the apology, which are
the four things nothing else carries.
