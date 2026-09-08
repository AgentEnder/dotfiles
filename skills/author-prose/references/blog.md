# Blog posts

The `nx-blog-post` skill owns the mechanics: where the file goes, the frontmatter, the images folder, the
author record, the vale rules, and which of his published posts to read to ground the voice.
**Read that skill first.** This document adds only what one full draft cycle taught, and does
not restate any of it.

## The cycle it came from

The `@nx/dotnet` OpenAPI to TypeScript post, drafted across roughly forty rounds, two rounds
of annotated feedback on the rendered draft, structural notes from a second reviewer, and
finally an editing pass by the blog's editor, who rewrote it in place on the PR.

Do not treat it as a finished model of the form. Treat the corrections below as the model.

## The editor added words back

| Draft                              | Words |
| ---------------------------------- | ----- |
| agent's first                      | 2381  |
| after two rounds of his feedback   | 1483  |
| after the second reviewer's notes  | 1558  |
| after the editor's pass            | 1691  |

**The cut was in the wrong places, not the wrong amount.** Aggressive cutting took out the
reader's orientation and left the clever sentences standing, which is exactly backwards. The
editor deleted the epigrams and spent the words on where the reader is and what happens next.

So when `conciseness.md` says a draft is twice the size it should be, believe it about the
prose that explains the explanation. Do not believe it about the paragraph that says which
project we are in.

## The rewrites, and what each one is an instance of

**The epigram.** Every balanced, turning sentence he touched died. This is the tell he named
in review as _"AI generated phrases which just sound horrible IMO"_.

| Mine                                                                              | His                                                    |
| --------------------------------------------------------------------------------- | ------------------------------------------------------ |
| You only ever run one of these by hand. The rest come along for the ride:          | This is what our ideal task pipeline should look like. |
| Running this by hand works. Running it as part of a build does not, yet, because…  | For now you can run this by hand, but it won't automatically run as part of the build. This is because… That's next. |
| That is the payoff, and the pieces behind it are small:                            | We've seen the entire chain now of…                    |

`unslop-text` names the "it's not X, it's Y" cadence. This is the same instinct wearing
other clothes: X works / Y does not, one by hand / the rest for free, here is the payoff.
Any sentence whose shape is doing rhetorical work is the one to delete. If it would land in
a conference talk, it is wrong here.

**The trailing flourish.** _"You find out at runtime, from a field that reads `undefined`."_
became _"You'll find out at runtime."_ The extra concrete image reads as a writer enjoying
themselves.

**The bare imperative.** _"Rename a property on a C# record and nothing tells you…"_ became
_"If you change a property on your C# DTO, nothing tells you…"_. Imperative-plus-`and` is an
aphorism generator. Use a conditional and address the reader.

**The counterfactual aside.** A whole paragraph on why `"dependsOn": ["ProductsApi:build"]`
would be the wrong way was cut outright. Explaining the road not taken is process, not
content, even when the road is tempting.

**Over-compression.** _"The example is a products API: one endpoint returning one record."_
became _"To keep things simple, we use the example of a products API. It sits in an existing
workspace, next to the frontend that already renders products."_ The colon-compressed
fragment is dense and disorienting. He also added a file tree and a paragraph disambiguating
folder paths from Nx project names, neither of which existed.

## The house voice, measured

- **First person plural.** `we`/`our` went from **1 to 15** in one pass. `you`/`your` also
  rose, 17 to 25. The register is a colleague walking you through it, not a document
  describing itself. Write "we install the plugin", not "install the plugin".
- **Signpost freely.** He added _"In this article we're going to…"_, _"That's next."_ and
  _"This is what our ideal task pipeline should look like."_ The rule elsewhere in this skill
  about cutting sentences that narrate the document **does not apply to a tutorial-shaped
  blog post**. A reader following along wants to know what is coming.
- **Headings name the technology.** Every short, clever heading was replaced by a longer
  explicit one. The two that survived were already explicit.

  | Mine                        | His                                            |
  | --------------------------- | ---------------------------------------------- |
  | The API and its models      | Our example setup                              |
  | What the plugin gives you   | Adding .NET capabilities to your monorepo      |
  | Getting the document out    | Using OpenAPI to describe our API surface      |
  | Generating the client       | Generating the TypeScript client for the API   |
  | Wiring it into the graph    | Wiring the OpenAPI codegen into the Nx task graph |

- **Bullets for enumerable config facts.** He broke a wall of explanation into
  _"A couple of things worth calling out here:"_ plus three bullets. `unslop-text` prefers
  paragraphs over bullets for expository prose; that preference loses to a list of things
  the config does.
- **Link into the docs inline.** He linked `dependentTasksOutputFiles` and the plugin's
  introduction page from the body. Do not save every link for "Learn More".
- **Calibrate the diction scanner down for a tutorial.** `unslop-text` flags "dive into", and
  in a blog post it is not worth raising: _"isn't super AI, its just one potential indicator,
  I think I'd leave it as common for blog posts / tutorials."_ The same goes for a lone
  "Additionally". These are register, not tells, in a piece that walks a reader through
  something. Save the diction findings for prose that is not a tutorial.
- **`frontend` and `backend` are one word.** Also `WebAPI`, and `DTO` in preference to
  language-specific words like `record` when making a cross-language point.

## Mechanics

**One line per paragraph. Never hard-wrap.** Every paragraph the editor touched came back
unwrapped; the only wrapped lines left in the post are in the one section he never read.
Mixed wrapping in a single file is itself a tell that two hands wrote it. The audit script
checks this.

## Framing

- A post that shows off a new feature is a puff piece. _"we don't really need to mention that
  at all. It should
  be a bit of a puff piece showing how the new integration can be used to accomplish good
  things, not bringing up anything that could be construed negatively."_ Cut every comparison
  to what came before, including favourable ones. "X used to handle this, now we do" is out.
- **Generalise in one paragraph, not two.** He rewrote a two-paragraph version into: _"This can
  work just as well when your back end is in another language. The basic pipeline is to setup a
  target that reflects the DTOs from one side to the other. In C#, we can use..."_ Say the
  technique generalises, name the pipeline in one clause, then get back to the concrete case.
- **One-line tldr, not a box.** A "Quick Scoop" callout got replaced by a single line at the
  end of the overview pointing at the runnable example.
- **Land the ending.** _"the narrative falls apart a bit and it feels like it just 'ends',
  rather abruptly."_ Stopping at the last fact is right for docs. A post needs its last
  paragraph to close the thing the first paragraph opened.

## Scope discipline

A section that grows past the post's subject gets cut, not tightened. A serializer-settings
section was killed with _"The ... title itself, and its contents, are both way too large for
the blog which should be largely focused on setting up the Nx build pipeline."_

Ask what the post is about in one clause, then check every heading against it.

## Code in a post

- **Use the shorthand the docs recommend.** `command: ...`, not `executor: nx:run-commands`.
- **Show a diff when adding lines to an existing file**, not the whole file. A csproj excerpt
  became a diff on his instruction.
- **Show the command that produced the change too.** When lines came from
  `dotnet add package`, show that shell line as its own block. Then you do not have to explain
  in prose where the lines came from.
- **Never explain what the diff already shows.** _"The two nested lines came from that command,
  not from you"_ was cut as _"nobody talks like that and its not really adding anything."_
- **Never start a sentence or a paragraph with a code block.** Prose motivates, then code.
- Show the target a reader would actually run. `typecheck` over `compile`, because
  `@nx/js/typescript` infers it and `typecheck dependsOn ^typecheck` makes the graph work
  without extra wiring.

## When the post documents a real repo

The example moves and the post rots silently. Two rounds of feedback on the
`@nx/dotnet` post were mostly this: it still described a generator, a csproj
property and an output directory the example had dropped weeks earlier.

- **Diff every snippet against the source.** Parse the fenced JSON and compare
  field by field. Reading side by side missed an abbreviated `inputs` array,
  and `inputs` replaces rather than merges.
- **Show the command and its real output.** Capture it by running the thing.
  Trimming paths and noise is fine, composing plausible output is not.
- **A claim about state has a shelf life.** While the example is a PR, say so
  and link it.
- **Do not document another project's API.** Naming a plugin's targets dates
  the post the moment they rename one.

## Images

Reach for them. Task graph visualisations are the natural fit for anything about task wiring,
and he asks for them unprompted.

For cover images: **look at what the repo has actually shipped recently, not at what good taste
suggests.** He pushed back on a first attempt with _"recent blogs don't seem to meet the values
you mentioned? of these 5, 3 are more clip-arty or match the opengraph image for their target,
and 2 are the default og image."_ The house standard is lower and looser than a generated
"tasteful" image. When generating a prompt for him to run, ground it in the last five covers.

His headshot is at `~/Downloads/nrwl_headshot.jpeg`. Crop loose. A tight crop got
_"my head looks huge."_

## Before handing it over

- vale, per `nx-blog-post`, on your post only.
- The unslop scanner.
- `node scripts/prose-audit.mjs <post>`. It walks `.mdoc` as well as `.md`, and
  it is the only thing that reliably catches paragraphs opening on a code span.
  That rule is written down below and was still broken three times in one post.
- `npx oxfmt` (or `pnpm dlx oxfmt`), unless the repo formats content itself.
  nx-blog lists `blog/src/content/**/*.mdoc` in `.prettierignore` and uses
  single-quoted frontmatter, which oxfmt rewrites. Skip it there.
- Never start `pnpm dev` yourself. Ask him to.
