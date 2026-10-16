---
layout: guide_page.njk
permalink: /guide/syntax.html
title: Syntax & Word Order | Tovian Guide
---
# Syntax & Word Order

Canonical word order is historically SOV (Subject–Object–Verb):

- {% tovc "ani-person loc-inan-city aux_3_sim_prs sight" %} — “The person sees in the city.”

Modern Tovian allows fronting for emphasis. Elements can be moved to the beginning for focus, while case marking preserves roles:

- {% tovc "loc-inan-city ani-person aux_3_sim_prs sight" %} — “In the city, the person sees.”

**Important**: attributive nouns (adjectives) follow the nouns they modify and should remain adjacent:

- {% tovc "ani-person loc-inan-city large aux_3_sim_prs sight" %} — “The person sees the big city.”
- {% tovc "loc-inan-city ani-person large aux_3_sim_prs sight" %} — “The big person sees the city.” (meaning changes)

## Temporal clauses: “when P, Q”

An explicit temporal frame uses {% tovc "temp-abs-time" %}, “at the time,” followed by a finite event description:

`tu-le-ngothr: P; Q.`

This means **“At the time described by P, Q”**, naturally translated as **“When P, Q.”** The head consists of existing `tu-` (temporal case), `le-` (abstract class), and `ngothr` (“time”). The finite clause P describes the relevant time. This is a construction using an existing noun and case marking; it introduces no new lexical word.

### Boundaries and scope

- The colon after `tu-le-ngothr` opens the event description P.
- The semicolon closes that description and introduces the main clause Q.
- Commas may join events inside P. In `tu-le-ngothr: P1, P2; Q`, both P1 and P2 belong to the temporal frame. Their order alone does not explicitly mean “and then.”
- In speech, the time expression introduces a continuing intonation contour; a pause and intonation reset mark the transition to Q. Clarity may require repeating a subject that would otherwise be recoverable from context.

These punctuation roles apply within this construction. Outside an open temporal frame, the ordinary [asyndetic coordination](coordination.html) rules still apply. The examples below establish one temporal frame; deeper nested temporal frames need a separately specified grouping convention.

### Subjects and agreement

P and Q are finite clauses, each using the ordinary subject, case, and auxiliary rules. They may have different subjects and person prefixes. Every auxiliary retains its required person marking. An omitted subject must be recoverable from context.

- {% tovc "temp-abs-time: I aux_1_sim_prs speech; you aux_2_sim_prs writing" %}.
  — “When I speak, you write.”

- {% tovc "temp-abs-time: nom-ani-child aux_3_cnt_pst sleep; nom-ani-mother aux_3_sim_pst writing" %}.
  — “When the child was sleeping, the mother wrote.”

Each clause contributes its own tense and aspect; person agreement does not require matching tense or aspect across P and Q. The temporal interpretation must remain coherent. The frame alone does not assert that P is completed, that P causes Q, or that the statement is conditional; aspect and context supply those distinctions.

### Sequencing events with “then”

{% tovc "following_stage" %} is the noun “following time or stage,” from the year-0 compound `time+front`. Temporal case and abstract class give {% tovc "temp-abs-following_stage" %}, “at the following stage”: **“then” or “afterward.”** The reference point is the preceding event or another salient stage. Aspect and context supply the delay and any completion requirement. See [time expressions](calendar.html) for the derivation and an independent-clause example.

Inside a temporal frame, this expression can locate the second event after the first:

`tu-le-ngothr: P1, tu-le-methr P2; Q.`

Both P1 and P2 remain inside the frame. The comma joins the events, `tu-le-methr` explicitly orders P2 after P1, and the semicolon introduces Q. The temporal noun phrase before P2 takes no colon because it does not open a further finite event description.

In the working sentence:

- {% tovc "temp-abs-time: nom-abs-half_truth+pl com-abs-truth+pl hardness aux_3_pas_sim_prs pondering, temp-abs-following_stage aux_3_pas_sim_prs writing" %}; …
  — “When the half-truths, together with the hard truths, are pondered and then written, …”

### Relation to other constructions

{% tovc "when" %} remains the interrogative “when?” This temporal frame supplies an explicit “when P, Q” relation where bare clause juxtaposition would leave that relation to context. It licenses a finite event description after the temporal head; general relative clauses and other noun-clause complements remain separate questions. The interpretation of tense inside a nested auxiliary chain also remains open.

In the working sentence, the truths being pondered and written belong inside P; inheriting life, taking root, and becoming impossible to ignore belong in Q. The words or constructions for “their own,” “take root,” and “ignore” still need to be settled.
