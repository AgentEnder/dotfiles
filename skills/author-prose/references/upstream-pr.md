# Commenting on your own PR in a repo you do not own

The exact inverse of `community-pr.md`. There you are the maintainer and the reader spent their
evening on your project. Here the reader is a maintainer with commit rights, no obligation to
you, and a queue. Read that file for the rules this one does not repeat.

## Size it to the ask

Most of these comments want one small action: rerun this, take another look, tell me which way
you want it. Ask what the maintainer has to do after reading, and give them exactly that.

They have a queue and no obligation to you, so the detail that earns their attention is the
detail that makes the ask decidable. Everything past that spends attention you have not been
given. A rerun request that runs long reads as a defence, and gets skimmed.

If what you found is a real bug in their repo, that is a separate issue, not a longer comment
on your PR. `upstream-issue.md` covers writing it.

## What does not belong in an ask

Each of these is true, checkable, and still wrong to include. They are bug-report material:

- **Test pass counts.** "41,656 passed, one suite failed to run" is the kind of thing nobody
  writes. It reads as building a case.
- **A walkthrough of the mechanism.** Naming the racing thing in a clause is credible. Tracing
  the calls and the error codes is a different document.
- **Your diff's file list.** They can see it, and they will look if they doubt you.
- **Other red checks.** Every extra item lowers the odds of the one ask landing.

## Pick one reason, hold the rest

You have no standing yet, so the ask needs something. It needs **one** thing: the shortest
clause that makes the claim plausible. Keep the others for if they push back, which they
usually will not.

Ranked by how little space they take:

- **The mechanism, in a clause.** "which two suites race on".
- **Non-determinism.** A failing shard or job that moves between runs.
- **Scope.** What your diff touches.

## Register

- **Hedge once.** "Looks unrelated" is enough. Do not add "I think it just needs".
- **Never state their infrastructure as fact.** "Should pass on a rerun", not "will pass".
- **Name the mechanism, not the culprit.** If a maintainer's own commit introduced the problem,
  the sha and the author are not needed for a rerun and read badly upward.
- **Check the person has the power and the context.** Approving your PR, or authoring most of
  the recent commits, is the evidence.

## Before you post

Run the unslop scanner, then `oxfmt`. Then cut it again, against the budget above.
