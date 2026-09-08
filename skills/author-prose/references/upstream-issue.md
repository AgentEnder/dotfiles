# Filing an issue in a repo you do not own

The reader is the one from `upstream-pr.md`: a maintainer with commit rights, no obligation to you,
and a queue. Read that file for the register. What differs here is that you have no PR in flight,
so nothing about you is on their board yet and the issue carries its own standing or none.

## Read their issue list before you write the title

Every repo has a house title style, and thirty of theirs teaches it faster than any rule here.

```sh
gh issue list --repo <owner>/<repo> --state all --limit 30
```

Domorium titles every issue `<observation>, so <consequence>`: "The conformance corpus is fetched
on every run, so a dead socket fails a README-only change". Matching that costs nothing, and it is
the first signal that you read the repo before filing in it.

## Quote their own decision back to them

An issue that asks a maintainer to adopt your opinion competes with everything else in the queue.
An issue that shows them a step they already chose and did not finish is barely a request.

So look for the decision before you write the report: an ADR, CONTRIBUTING, a release runbook, the
PR that made the change. Quote the sentence, then show the state that contradicts it. Ours opened:

> ADR 0006 lists the old listings as a consequence of the rebrand:
>
> > their old listings need deprecation or migration notices when the new releases are published
>
> That step looks like it never ran.

When no such decision exists you are making a proposal, not reporting a defect. Say that in a
sentence and ask, rather than dressing the proposal in evidence it has not earned.

## Report the state they cannot see

A maintainer can read their own code, so restating it spends attention. What they cannot see from a
checkout is everything outside it: registry metadata, a marketplace listing, what a downstream
install resolves to. That is the evidence worth the space, and it is usually a small table.

## One ask, and hand them the command

If the fix is a single command, give it. It turns a triage decision into twenty seconds of work,
and it proves you know the size of what you are asking for.

```markdown
`npm deprecate @gedcom/validator "moved to @domorium/validator"`, and the same for the other two,
would cover it.
```

## What does not belong

| Cut                               | Because                                                            |
| --------------------------------- | ------------------------------------------------------------------ |
| How you found it, past one clause | Your evaluation is not their bug.                                  |
| A second finding                  | It is a second issue, and filing both buries the first.            |
| Labels, priority, severity        | Triage is theirs. An outsider setting `priority/high` reads badly. |
| A praise preamble                 | "Great library, but" is a softener and they can tell.              |
| Your workaround                   | It argues the issue is not worth fixing. Give it if they ask.      |

## Register

- **Never state their intent.** "That step looks like it never ran", not "you forgot to deprecate".
- **Standing fits in a clause.** "which is how I ended up on the wrong one while evaluating the
  validator". Not a paragraph about your project.
- **Hedge their state, not yours.** "Looks like it never ran" about their release, flat about what
  you measured.

## The worked example

Filed on `lavich/domorium`, 158 words, about a rebrand that stranded three npm packages.

```markdown
ADR 0006 lists the old listings as a consequence of the rebrand:

> Existing packages and plugins cannot provide an ordinary in-place update; their old listings need deprecation or migration notices when the new releases are published.

That step looks like it never ran. None of the three carry a `deprecated` field in their registry metadata:

| package                    | latest | published  | deprecated |
| -------------------------- | ------ | ---------- | ---------- |
| `@gedcom/validator`        | 0.1.3  | 2026-07-28 | no         |
| `@gedcom/language-service` | 0.1.2  | 2026-07-28 | no         |
| `@gedcom/codemirror`       | 0.1.0  | 2026-07-30 | no         |

So `npm install @gedcom/validator` still succeeds and pins `chevrotain@^12`, against `^13` in `@domorium/validator@2.0.0`. npm search ranks the two scopes next to each other and neither is marked, which is how I ended up on the wrong one while evaluating the validator.

`npm deprecate @gedcom/validator "moved to @domorium/validator"`, and the same for the other two, would cover it.
```

Two things were cut to reach it. A library bake-off across nine packages, with parse failures and
byte-fidelity numbers: that is how the problem surfaced, not the problem. And an observation that
their release runbook has three steps that never touch registry state, which is true, probably
useful, and a second ask.
