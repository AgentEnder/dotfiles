# Slack

Slack has two registers and they look nothing alike. Averaging them produces a voice he uses
nowhere.

## Register A: spontaneous

Most messages. One or two sentences, sent as fast as thought.

Real ones:

> Yeah, if its a content addressable thing limiting it by workspace doesn't really make sense imho

> Hmmmm, thats true... but we prune yeah... its an interesting thing to think through

> Uhhhh no

> there's a project planned for this stuff its just not kicked off yet

What is actually going on there:

- **`...` is the connector**, not a trailing-off. It joins clauses where a semicolon or a comma
  would go. It is the loudest signature in his Slack.
- **Apostrophes go missing** in `its`, `thats`, `ive`, `havent`, `im`. Not consistently. Do not
  correct them, and do not add them everywhere either.
- **Sentences start lowercase** about half the time.
- Abbreviations: `w/`, `w/o`, `ofc`, `imho`, `RE:`, `POV`.
- Openers: `Yeah,` `Ok,` `Oh, interesting.` `Hmmmm,` `Ah,` `Curious,`.
- Self-deprecating asides land in the middle of a sentence, not as a joke at the end.
- Emoji are rare and reactive: `:sweat_smile:` `:slightly_smiling_face:`. Never decorative.
- Terminal output is pasted raw, prompt line and all, inside a fence.

**The outbound ask has no attested example here.** The quotes above are all replies: an
opinion, an agreement, a refusal, a status answer. The one message that opened a thread could
not be kept, so what follows is shape derived from the bullets above, not his words. Do not
quote it back as his voice.

```
hey do you know why <the thing happened>? <the system> flags it and asks why so im just a meat
proxy here
```

The ask comes first and the reason second, and the pressure is attributed to whatever actually
applies it rather than to him. The self-deprecating aside lands mid-sentence, which is the one
habit in the list above that nothing else illustrates. Register B does the same move formally,
under `Template: asking about someone else's ticket`.

Do not write this register from scratch for him. If he asks you to draft a spontaneous message,
keep it to one sentence and let him mangle it.

### Register A, stretched: findings in a thread

Delivering investigation results into a live technical thread is the one place Register A runs
past a sentence, and it stays Register A: two short paragraphs, ~110 words, no bullets, no
headings, no bolded labels. Colleagues read analysis-shaped replies in a thread as
machine-written and it annoys them (said so directly, 2026-09-01); the annoyance is the message failing,
not a style nit.

Shipped verbatim from a preview:

> Ok correction on my end, the v4 workers are forked processes not worker_threads... and each
> task inside a worker goes through runDiscreteTasks, which makes a fresh orchestrator per task.
> That per-invocation orchestrator getting pinned forever (signal handlers it never removes) is
> exactly what my PR fixes, so it should clear the workers too w/o any cloud-side change.
>
> One thing I noticed: NX_CLOUD_V4_WORKER_MAX_TASKS defaults to off, and when its set the
> recycle is a full process.exit... so if their workers arent recycling at all the
> unbounded growth there makes sense. <@U...> is the ~50 a value we set or just how long they
> happen to live?

What makes it work:

- **A correction opens it, owned in the first clause, first person**, then moves straight on.
- **One load-bearing fact per sentence**, identifiers written bare (`runDiscreteTasks`, env var
  names) with no backtick fuss.
- **Evidence stays behind the claim.** File paths, line numbers, and the four-point structure of
  the underlying report all stay out; the thread gets conclusions.
- **It ends with the one question that moves the thread**, aimed at a named person.

## Register B: the structured ask

Review requests, standup updates, anything with more than one item. These are the messages
worth templating, and the ones `babysit` already stages.

Rules for all of them:

- A lead line, then `•` bullets. One line per item.
- Mentions must be `<@Uxxxx>`. A literal `@Name` posts as text and pings nobody. Resolve with
  `brain slack users "<name>" --area nx --json`.
- Links are `<url|short text>`.
- Separate a link from its description with `:` , not an em dash. His shipped messages use em
  dashes because `babysit` drafted them; that is the tell, not the style.
- Every item says what it is in a half-sentence. Not "fix a bug", but what changed.
- If order matters, say what gates what.
- **Draft it, unless a preview approved it.** `slack_send_message_draft` by default, and never
  `slack_schedule_message`. `slack_send_message` is allowed only when `preview-prose`
  reported `status=empty` on this exact text, having been run with `PREVIEW_PROSE_ON_ACCEPT`
  naming the send. Editing the
  text after that approval voids it: preview again.

### Template: review request, one reviewer

```
Hey, one of mine for you, no rush if you're still at the conference:

• <https://github.com/nrwl/nx-console/pull/3198|nx-console#3198> (<link|TICKET-1234>): create the socket dir owner-only and resolve its path from one env

It pairs with <https://github.com/nrwl/nx/pull/36774|nx#36774>, which has to land first, and the
extension picks up the resolver behind a capability check, and #36774 carries a retry against
the legacy derived path so nothing breaks in the window between the two shipping. I moved that
one to another reviewer so it isn't waiting on your return, since it's the gate.
```

Note the acknowledgement of the reviewer's situation in the lead line. That is not filler, it
is the thing that makes the ask land.

### Template: review request, a batch

```
Hey, two small ones for you if you have a minute, both green.

• <link|#36663>: don't allowlist the analytics domain when analytics are off. configure-ai-agents was writing the analytics domain into the agent sandbox's network allowlist unconditionally, including for users who had turned analytics off.

• <link|#36638>: sort tailwind classes to match prettier. Purely mechanical, and it only touches the docs and web surface (astro-docs, graph, nx-dev), which is why it is coming to you rather than one of the core CLI folks.
```

Saying _why this reviewer_ is what stops the message reading as a queue dump.

### Template: re-review, where they already left feedback

```
Re-reviews, you've already left feedback on these two
• <link|#36703> (<link|TICKET-1234>): <what it does>. Your Critical (<the finding>) and both Importants are fixed at <sha>, replies on the ticket.
• <link|#35863>: <what it does>. Your asks from July: <each one, in a clause>.

<Group heading, e.g. "Sandboxing (review #36586 first, #36514 sits on it)">
• <link|#36586>: <what it does>
• <link|#36514>: <what it does> · based on #36586
```

Group by theme, and put the ordering constraint in the group heading. `·` separates a note from
the description.

### Template: async standup

```
Going to miss sync, update below:
• Most of the work for agent friendly output is done, and in review as stacked PRs. One ticket merged last night, the others ill be pushing along.
• The agent sandbox tickets are in a similar spot, just havent moved them all to in review as im making sure my local claude is happy with them before having anyone else's Claude run the review skill.
• Blog post for .NET typescript openapi stuff is in draft state still, talked with our DevRel lead last Friday about it and we want to see if theres a good community plugin we can ref.
• high priority ticket about the task hook and isolated workers is blocked until some of the agent output tickets go in - also pairing on the sandboxing/auto inputs stuff with <@Uxxxxxxxxx> / <@Uyyyyyyyyy>
```

Register A prose inside register B bullets. No links, no PR numbers, no polish. Each bullet is
a project, its state, and the thing standing in the way.

### Template: channel announcement

One line. That is the whole template.

```
Quick PR for .NET, adding inference support for openapi document outputs: <link|github.com/nrwl/nx/pull/36788>
```

```
<link|github.com/nrwl/nx/pull/36785> should fix the release
```

### Template: asking about someone else's ticket

```
On this one: <link|TICKET-1234 the ticket title, pasted in as it reads>

What's its status? Its marked high priority + labeled security so compliance is mad its not been addressed quickly.
```

Link, blank line, the actual question, then the reason it is being asked. The reason is short
and says who is applying the pressure, so it does not read as him applying it.

## Reading Slack

Reads go through `brain slack read|search|users` (offline-shaped, testable). The MCP plugin is
loaded for the write side only: the draft, and the preview-approved send. `brain slack` needs a signed-in `slack.com` tab open in the
browser, and says so when there is not one. Fall back to the MCP search tools for reads in
that case.
