# Commenting on a community contributor's PR

The reader is an outside contributor who spent their own time on a repo they do not own. They
want to know whether their work landed, what happens next, and whether they wasted the evening.
Everything else is optional.

## Shape

1. Thank them, and say sorry if they hit a bug. One line each.
2. If it is your bug, say so in the first person, immediately, with the PR numbers. Once.
3. Say what happens next, and what it means for their PR.
4. The evidence. A table if there is more than one dimension.
5. The one thing still open, with the cause and the fix.
6. "Thanks again."

## Register

- **First person, always.** "We" reads as an institution talking down. He corrected an entire
  draft with _"'We' -> 'I'"_.
- **Humble, and specific about it.** Credit what they actually did: the bisect, the linked
  issues, the failing test. Not "great work".
- **Never claim maintainer authority as the reason.** _"'and picking one is our call to make'
  sounds a bit overzealous."_ The reason you are taking it over is that the decisions were
  yours and you want to check them, not that you outrank them.
- **Thankful, not over-explanatory.** His words. Gratitude is two sentences, not a paragraph.
- **Say the PR stays theirs.** If you are pushing onto their branch, say that.
- Do not raise problems that are not theirs. If you found an adjacent bug, file it separately
  and leave it out, unless the table already covers it in a row.

## The worked example

`nrwl/nx#36717`. Four rounds, 898 words down to 388. The final text:

```markdown
Thanks for the report and the patch, and sorry you hit this.

The regression is mine. I wrote #36049 and #36142, and the identity stamp I added in #36142 is
what drops your `options` on the path where nothing is being replaced. You bisected it faster
than I would have.

I'll take it the rest of the way, since the fix turns on decisions I made and I want to check
them against the older releases. I'll push onto your branch, so the PR stays yours.

Here is what I measured. Each cell is `nx show project a --json` on a real workspace: a local
`createNodesV2` plugin for the inferred target, `nx.json` for `targetDefaults`, `project.json`
for the project layer. `echo` is the `targetDefaults` command, `tsc` the inferred one.

| #   | scenario                                | nx 22.7.8           | nx 23.0.2            | `master`           | this PR                    |
| --- | --------------------------------------- | ------------------- | -------------------- | ------------------ | -------------------------- |
| 1   | inferred target; TD `options.command`   | `echo`, fields kept | same as 22           | **`tsc`** (#36700) | same as 22 ✅              |
| 2   | inferred target; TD top-level `command` | `echo`, fields kept | `tsc`, never applied | `tsc`, fields kept | `echo`, **fields dropped** |

Rows 1 and 3 are fixed. Rows 4 and 5 match 22, so nothing new there.

Row 2 still isn't. `"build": { "command": "..." }` replaces the inferred target instead of
merging into it, so `dependsOn`, `cache`, `inputs`, `outputs` and `cwd` are lost. The
`options: { command: ... }` spelling keeps them, and 22 kept them for both. Cause:
`resolveCommandSyntacticSugar` puts `executor: 'nx:run-commands'` on the entry, and with the
stamp skipped that makes it incompatible at merge time. Deleting that synthesized executor
fixes it and keeps the tests green. I'll handle it.

One small thing: the `commands` test gives `@nx/js/typescript` an `options.commands` target,
but the plugin emits a top-level `command` plus `cwd`.

Thanks again.
```

(Table abridged here. The real one carried all five rows.)

## What got cut on the way there

Everything below was in the 898-word draft and none of it survived:

- A verification narrative: "I checked your spec against master".
- A docs link, a quoted precedence rule, and an explanation of an internal short-circuit.
- A paragraph on `command` versus `commands` being out of scope for this PR. Cut as _"not a
  useful paragraph"_. The two table rows that covered the same ground were kept.
- A closing paragraph on why the problem outgrew a single PR.
- Every instance of "we".

## Before you post

- Run the unslop scanner, then `oxfmt`.
- Check the identity of anyone you name. `content/areas/nx/docs/REVIEWERS.md` maps names to
  GitHub handles. The mea culpa in the example deliberately omits a third PR because a
  colleague authored it, which only a check would tell you.
- Draft it to a file. He posts it.
