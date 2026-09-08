# PR bodies

## Sample the right era

PRs since roughly June 2025 are agent-drafted and are the thing this document corrects, not the
model for it. `nrwl/nx#31428` (2025-06-02) is the first with a Claude trailer, and by July 2025
the invented-heading shape had taken over.

For the baseline, read PRs from before 2025-06:

```sh
gh pr list --repo nrwl/nx --author AgentEnder --state merged --limit 40 \
  --search "created:2024-01-01..2025-05-31 sort:created-desc" --json number,title,body
```

## The three shapes

Pick by how much the reader needs, not by what the template offers.

**One or two sentences, no headings.** A chore or a cleanup where the title already says it.

> Reduces some unnecessary permissions to ease future risks.

> Nx release doesn't replace version specified by `*`, whereas our custom script used to do so
>
> Fixes https://github.com/nx-dotnet/nx-dotnet/issues/876

**The template, filled thin.** The common case, and the default.

```markdown
## Current Behavior

If a project has an input that references multiple named inputs, and one of those named inputs
excludes a workspace file that was included by the other, the file is still included.

## Expected Behavior

Excludes take preference

## Related Issue(s)

<!-- Please link the issue being fixed so it gets closed when this is merged. -->

Fixes #
```

**The template plus evidence.** When the change is visual, or a log is the proof. Screenshot of
the bug under Current, screenshot of the fix under Expected. Nothing else changes.

## The template

`nrwl/nx/.github/PULL_REQUEST_TEMPLATE.md` is authoritative and ships the HTML comments. Leave
them in. He does, and a body without them reads as generated.

Headings flex when the change is not a bug fix. `## Future Behavior` for a deprecation,
`## Updated Behavior` for a migration. Add an ad-hoc sub-heading (`### Without Verbose`) only
when a comparison needs one.

A breaking change opens with the trailer, above the first heading:

```markdown
BREAKING CHANGE: Plugins will need to migrate to create nodes v2 if they haven't already to stay
supported.

## Current Behavior
```

## Length

Human-era bodies run about 60 words. `#36788`, agent-drafted, ran about 700.

| Section          | Budget                                                         |
| ---------------- | -------------------------------------------------------------- |
| Current Behavior | 1 to 4 sentences. A code block if the config is the bug.       |
| Expected         | Often one sentence. A fragment is fine.                        |
| Related Issue(s) | `Fixes #NNNNN`, or `Fixes #` left bare when there is no issue. |

"Excludes take preference" is a complete Expected Behavior. So is "`getDefaultPlugins` should
store its cache under its own var".

## Register

- Present tense, plain, no throat-clearing.
- **"We" is correct here**, unlike a comment on a contributor's PR. This is the team's codebase.
  "We retry NX_VERSION_CHANGED errors." "We normalize this to prevent plugin authors from making
  an easy mistake."
- State the bug as a maintainer sees it, including the mechanism when you know it. "Because of
  some improper caching logic in `getPlugins`, if `loadSpecifiedNxPlugins` throws the result of
  `getDefaultPlugins` is cached as if it was the result of `getPlugins`."
- No polishing pass. Contractions, the occasional typo and a dropped apostrophe all survive in
  the real ones. Do not imitate the typos, but do not add polish the body never had either.

## Evidence, when it earns its place

- A screenshot of the bug under Current Behavior, and of the fix under Expected.
  `<img width="1077" alt="image" src="https://github.com/user-attachments/assets/..." />`
- Terminal output pasted raw in a fence, showing the new line.
- A code block holding the offending config or the actual logic, when naming it in prose would
  take longer.

## What to stop doing

Every row is a real heading from a recent agent-drafted body.

| Cut                                             | Because                                            |
| ----------------------------------------------- | -------------------------------------------------- |
| `## Summary`                                    | The title is the summary.                          |
| `## Changes Made` / `## Implementation Details` | A bulleted restatement of the diff.                |
| `## Test Plan` with checkboxes                  | CI is the test plan.                               |
| `## Verification` with test counts              | Belongs in the Linear comment. See `colleague.md`. |
| `### Why X rather than Y`                       | Design rationale belongs in a code comment.        |
| `## Additional Notes`                           | If it mattered it had a home already.              |
| `🤖 Generated with [Claude Code]`               | Attribution is off in `~/.claude/settings.json`.   |

Also cut: em dashes, and any sentence explaining a decision the reviewer has not questioned yet.

## Where the cut material goes

The reasoning is not worthless, it is misplaced. A body that grew to 700 words usually holds
three things that each have a better home:

- **Why this approach and not that one** goes in a code comment next to the thing it explains.
- **Test counts, CI state, what you could not verify** goes in the Linear comment, where a
  maintainer asked for it. See `colleague.md`.
- **An adjacent bug you noticed** goes in its own ticket.

Move it rather than delete it, then let the body drop back to the template.
