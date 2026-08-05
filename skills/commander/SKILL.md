---
name: commander
description: Multi-lens orchestrator that runs the Scout (market), Analyst (tech), Architect (product), and Strategist (growth) skills together in one cohesive pass and synthesizes their briefs into a single GO/REFINE/KILL decision. Use when a request spans more than one specialist domain or needs an end-to-end evaluation — e.g. "should we build X", "full evaluation of this idea", "run the whole team on Y", "give me market + tech + product + growth on Z", "is this worth pursuing", or any idea/feature/venture that needs market, feasibility, product, and go-to-market perspectives at once. For a single-domain question, invoke that one specialist skill directly instead.
---

# Commander — Multi-Lens Orchestrator

Commander coordinates the specialist skills into one cohesive evaluation. It does not do the specialist analysis itself — it **selects the right lenses, runs them in dependency order, passes findings forward, and synthesizes one decision** from the parts.

The specialists (each a standalone skill in this fleet):
- **Scout** (market-research) — competitors, demand, landscape, positioning
- **Analyst** (tech-research) — feasibility, stack, build-vs-buy, APIs
- **Architect** (product) — PRD, scope, user stories, roadmap
- **Strategist** (growth) — GTM, funnel, launch, experiments

## When to run the chain vs. a single skill

- **One domain** → invoke that specialist skill directly; don't spin up the whole chain.
- **Two or more domains, or an open "should we do this?"** → run the chain.

Don't force all four. Select only the lenses the question needs (see `references/orchestration.md`); a feasibility-only debate doesn't need Strategist, a positioning question may need only Scout + Strategist.

## Workflow

Run inline and sequentially, honoring dependencies. Each specialist skill writes its own timestamped brief; Commander reads each result and feeds the key findings into the next.

1. **Frame & select lenses.** Restate the decision in one line, name the success criteria, and pick which lenses apply. State the plan before running (e.g. "Running Scout → Analyst → Architect → Strategist; here's why").
2. **Phase 1 — Independent lenses (Scout, Analyst).** These don't depend on each other. Invoke the `scout` skill (market truth) and the `analyst` skill (technical feasibility) for the parts the question needs. Capture each brief's Bottom Line and the facts the later phases require.
3. **Phase 2 — Architect (depends on Scout + Analyst).** Invoke the `architect` skill, feeding it the market opportunity (Scout) and feasibility constraints (Analyst). Its PRD/scope should reflect what's worth building *and* buildable.
4. **Phase 3 — Strategist (depends on Architect + Scout).** Invoke the `strategist` skill, feeding it the product definition (Architect) and positioning/demand (Scout) to design the go-to-market.
5. **Phase 4 — Synthesize.** Reconcile the four briefs into one decision using `references/synthesis-brief-template.md`. Resolve conflicts explicitly (e.g. strong demand but low feasibility). Carry up **each lens's verdict AND its evidence strength as separate columns** — a 🔴 nobody could source and a 🔴 backed by primary sources are opposite situations, and one dot cannot say which you have. End with a clear **GO / REFINE / KILL** and the single biggest risk.

How to invoke a specialist: trigger its skill with a scoped sub-prompt (e.g. for Scout, "competitive landscape and demand for <idea>"). Each runs its own workflow and writes its own brief; Commander orchestrates and never re-does their analysis. See `references/orchestration.md` for the dependency map, lens-selection rules, and the hand-off format that carries findings between phases.

## Output

Commander writes a **synthesis brief** to a timestamped markdown file and summarizes it in chat with the path. The synthesis **links to the four sub-briefs** (each specialist already saved its own) rather than duplicating them.

- **Template:** `references/synthesis-brief-template.md`.
- **Filename:** `commander-briefs/commander-brief_<YYYY-MM-DD_HHMM>_<slug>.md`. Create the directory if absent.
- **Timestamp from the system, not memory:** `date +"%Y-%m-%d_%H%M"` and `date +%F`.

## Rules of orchestration

- **Synthesize, don't relay.** The value is reconciling the lenses into one call — surfacing where market, tech, product, and growth agree or collide. Four stapled briefs is a failure mode.
- **Select, don't dump.** Run only the lenses the decision needs. More briefs ≠ more insight.
- **Respect dependencies.** Architect needs Scout + Analyst first; Strategist needs Architect. Running them out of order produces a spec disconnected from reality.
- **Carry findings forward.** Each phase gets the prior phases' Bottom Lines as input — that's what makes the chain cohesive rather than four parallel monologues.
- **One decision, owned conflicts.** End with GO / REFINE / KILL. When lenses disagree, state the tension and how you weighted it — don't average it away.
- **Don't spawn subagents by default.** Run inline. Parallelizing the independent lenses (Scout, Analyst) across subagents is an option only if the user asks for it — see `references/orchestration.md`.
- **Never collapse verdict into confidence.** The at-a-glance table carries both: what a lens concluded, and how well-evidenced that conclusion is. A 🔴 at *Low* evidence is a reason to go research; a 🔴 at *High* evidence is a reason to stop; a 🟢 at *Low* evidence reads as permission and isn't. Averaging them into one colour throws away the distinction the sub-briefs paid for.
- **Degrade gracefully.** If a specialist skill (or an import-required external skill it relies on) isn't available, note the gap and continue with the lenses you have rather than failing the whole chain.

## Rules of communication

The synthesis is the brief most likely to leave the building. It is the verdict, it is the shortest of the five, and it is the one someone forwards — so it is the one that most has to work for a reader who does not work on this product.

- **It must stand alone.** The design of this doc is "link, don't duplicate" — which means a reader who cannot open the four sub-briefs still has to get the whole argument. Every finding carried up states its own point in full; a bottom line that only parses after reading its sub-brief has been referenced, not synthesized.
- **Name the reader, then write to them.** The header's `Written for` line fixes the vocabulary for the whole document.
- **Spell out every term of art at first use** and list it in §6 Glossary. The synthesis inherits vocabulary from four specialists at once, so it accumulates more jargon than any single lens while reaching the reader least likely to share it.
- **One idea per sentence. Three sentences per paragraph.** The verdict block is where this matters most: it is the one section everyone reads and the one most likely to be written as a wall.
- **Bold at most one phrase per paragraph.** When a third of the text is bold, none of it is emphasis.
- **Never cross-reference by filename alone.** Every sub-brief link is accompanied by the one-line conclusion it reached.
- **Write the `In one line` header last.** If the verdict won't compress into one jargon-free sentence, the lenses have not actually been reconciled.
