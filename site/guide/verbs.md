---
layout: guide_page.njk
permalink: /guide/verbs.html
title: Verbs & Aspects | Tovian Guide
---
# Verbs & Aspects

Tovian uses a conjugated auxiliary + a bare lexical predicate. The predicate is an unchanged noun root used verbally; all marking for person, tense, aspect, mood, and voice appears on the auxiliary.

Every auxiliary in formal writing or a complex sentence must carry a person prefix, including each auxiliary in a nested chain. The order within each auxiliary is **person + mood + voice + aspect root + tense**. Case and class prefixes belong to noun phrases and keep their existing order.

## Inheritance as carrying the past forward

{% tovc "inheritance" %} means **inheritance**: taking up and carrying forward what came before. It can refer to property, traits, duties, traditions, or ideas passed on from an earlier source. As a lexical predicate, the same root means “inherit.”

The compound `carrying+past`, formed at year 500, develops through the sound-change script into {% tovc "inheritance" %}. The date follows the formation of the existing “past” compound at year 10.

- {% tovc "abs-inheritance" %} — “inheritance” as an abstract noun.
- {% tovc "aux_3_sim_prs inheriting" %} — “he/she/it/they inherit.”
- {% tovc "acc-abs-life aux_3_sim_prs inheriting" %} — “they inherit life.”

The noun root stays unchanged in each example. In the working sentence, “inherit a life of their own” uses this sense of carrying something forward; the possessive construction for “their own” remains to be worked out.

## Tense suffixes on the auxiliary

<table>
  <thead>
    <tr><th>Tense</th><th>Auxiliary suffix</th></tr>
  </thead>
  <tbody>
    <tr><td>Past</td><td><code>-e</code></td></tr>
    <tr><td>Present</td><td><code>-a</code></td></tr>
    <tr><td>Future</td><td><code>-o</code></td></tr>
  </tbody>
</table>

## Common aspects (auxiliary roots)

<table>
  <thead>
    <tr><th>Aspect</th><th>Aux root</th><th>Present example</th></tr>
  </thead>
  <tbody>
    <tr><td>Simple</td><td><code>f-</code></td><td>{% tovc "aux_3_sim_prs sight" %} “see(s)”</td></tr>
    <tr><td>Imperfective</td><td><code>th-</code></td><td>{% tovc "aux_3_ipf_prs sight" %} “be seeing”</td></tr>
    <tr><td>Perfect</td><td><code>lh-</code></td><td>{% tovc "aux_3_prf_prs sight" %} “have seen”</td></tr>
    <tr><td>Near</td><td><code>tl-</code></td><td>{% tovc "aux_3_nea_prs sight" %} “about to see”</td></tr>
    <tr><td>Immediate</td><td><code>k-</code></td><td>{% tovc "aux_3_imm_prs sight" %} “seeing now”</td></tr>
    <tr><td>Habitual</td><td><code>m-</code></td><td>{% tovc "aux_3_hab_prs sight" %} “see(s) regularly”</td></tr>
    <tr><td>Progressive</td><td><code>s-</code></td><td>{% tovc "aux_3_pro_prs sight" %} “be seeing now”</td></tr>
    <tr><td>Continuous</td><td><code>sh-</code></td><td>{% tovc "aux_3_cnt_prs sight" %} “be seeing”</td></tr>
    <tr><td>Iterative</td><td><code>n-</code></td><td>{% tovc "aux_3_itr_prs sight" %} “see(s) repeatedly”</td></tr>
    <tr><td>Inceptive</td><td><code>y-</code></td><td>{% tovc "aux_3_inc_prs sight" %} “begin seeing”</td></tr>
    <tr><td>Cessative</td><td><code>p-</code></td><td>{% tovc "aux_3_ces_prs sight" %} “stop seeing”</td></tr>
    <tr><td>Remote</td><td><code>h-</code></td><td>{% tovc "aux_3_rem_prs sight" %} “see(s) (remote)”</td></tr>
  </tbody>
</table>

## Examples

- {% tovc "aux_3_sim_prs sight" %}. — English: [He/She] sees. (simple present)
- {% tovc "aux_3_cnt_prs speech" %}. — English: is speaking. (continuous present)
- {% tovc "aux_3_obl_hab_prs" %} … — English: should habitually … (obligative + habitual present)
- {% tovc "aux_2_imp_sim_prs returning" %}. — English: Return! (2nd person imperative; person + mood on auxiliary)

## Agreement (subject person on every auxiliary)

<table>
  <thead>
    <tr><th>Person</th><th>Auxiliary prefix</th><th>Example</th></tr>
  </thead>
  <tbody>
    <tr><td>1st</td><td><code>i-</code></td><td>{% tovc "aux_1_sim_prs sight" %} “I/we see”</td></tr>
    <tr><td>2nd</td><td><code>o-</code></td><td>{% tovc "aux_2_sim_prs speech" %} “you speak”</td></tr>
    <tr><td>3rd</td><td><code>a-</code></td><td>{% tovc "aux_3_sim_prs sight" %} “he/she/it/they see”</td></tr>
  </tbody>
</table>

Plural is a noun suffix <code>-e</code>; verbs do not agree with number.

The subject determines person: “the truths” takes third-person `a-`, just as “it” and “they” do. An explicit subject noun or pronoun does not remove the requirement for agreement.

In short, unambiguous casual speech, third-person `a-` may be omitted: {% tovc "aux_3C_sim_prs sight" %} can stand for {% tovc "aux_3_sim_prs sight" %}, “he/she/it/they see.” Retain person marking throughout formal writing and complex sentences, especially auxiliary chains. First- and second-person prefixes remain required.

### Distinguishing modifiers from auxiliaries

Bare `lha` means “hardness/strength” and can follow a noun as its modifier. The formal third-person perfect auxiliary is `alha`; the passive perfect is `apalha`.

- {% tovc "nom-abs-truth+pl hardness aux_3_pas_sim_prs thinking" %} — “The hard truths are pondered.”
- {% tovc "nom-abs-truth+pl aux_3_pas_prf_prs thinking" %} — “The truths have been pondered.”

The person prefix identifies the auxiliary in these examples. It preserves the noun-based predicate system without requiring a separate class of lexical verbs.

## Auxiliary nesting and scope

An auxiliary may take the following auxiliary phrase as its complement. **Each earlier auxiliary applies to the entire phrase that follows it.** Read a chain from the inside outward. Brackets below show grouping only; they are not spoken or written Tovian morphemes.

Within one shared-subject chain, every auxiliary carries the same person prefix. Each layer can contribute its own mood and aspect. Within a single auxiliary, mood takes scope over aspect: potential + cessative means “can stop,” while an outer cessative followed by a potential auxiliary means “stops being able.”

<table>
  <thead><tr><th>Form and grouping</th><th>Meaning</th></tr></thead>
  <tbody>
    <tr><td>{% tovc "aux_3_ces_prs sight" %}</td><td>Stops seeing.</td></tr>
    <tr><td>{% tovc "aux_3_pot_ces_prs sight" %}</td><td>Can [stop seeing].</td></tr>
    <tr><td>{% tovc "aux_3_ces_prs [aux_3_pot_sim_prs sight]" %}</td><td>Stops [being able to see].</td></tr>
    <tr><td>{% tovc "aux_3_pot_inc_prs sight" %}</td><td>Can [begin seeing].</td></tr>
    <tr><td>{% tovc "aux_3_inc_prs [aux_3_pot_sim_prs sight]" %}</td><td>Begins [being able to see].</td></tr>
    <tr><td>{% tovc "aux_3_obl_ces_prs writing" %}</td><td>Should [stop writing].</td></tr>
    <tr><td>{% tovc "aux_3_ces_prs [aux_3_obl_sim_prs writing]" %}</td><td>Ceases [to be expected to write].</td></tr>
    <tr><td>{% tovc "aux_1_ces_prs [aux_1_pot_sim_prs sight]" %}</td><td>I/we cease [being able to see].</td></tr>
  </tbody>
</table>

Person agreement repeats because the grammatical subject is shared. It does not require the moods or aspects to match.

### “Can no longer be ignored”

The intended scope is **cessation → possibility → passive predicate**. Using `[IGNORE]` as an English placeholder for a lexical root still to be chosen:

`apa [ashopafa [IGNORE]]`

- `a-p-a`: third person + cessative + present.
- `a-sho-pa-f-a`: third person + potential + passive + simple + present.
- `[IGNORE]`: the unchanged lexical predicate.

The truths remain the grammatical subject throughout. The inner phrase means “can be ignored”; the outer cessative ends that possibility. This differs from “stop being ignored,” where actual ignoring ends, and from “can stop being ignored,” where stopping is possible. The construction uses one cessative; the bound `pa-` inside `ashopafa` marks passive voice.

“No longer” presupposes an earlier possibility; it does not by itself mean that the impossibility will last forever. No new particle or untensed auxiliary is introduced by this nesting rule.

### Shared subjects, embedded clauses, and tense

“I cease [being able to see]” is a shared-subject chain. “I know [you left yesterday]” contains a clause with its own subject and time. A shared-subject agreement rule applies within a chain; it does not require every auxiliary in a whole sentence to have the same person. The [temporal frame](syntax.html) `tu-le-ngothr: P; Q` now specifies one construction with a finite event description P; general complement clauses such as “I know [you left]” still need their own rule.

**Temporal dependence remains to be defined.** The examples here use present tense throughout. Matching person does not commit Tovian to copying tense endings across every layer. A general account of inner temporal reference and mixed-tense chains is still open; these examples establish person agreement and scope without settling that question.

<details class="card" style="margin-top: 1rem;">
  <summary><b>Third-person auxiliary forms</b> <span class="muted">(formal; aspect × tense)</span></summary>
  <div id="auxiliariesAuto" class="muted" style="margin-top: .75rem;">Loading…</div>
</details>

<details class="card" style="margin-top: 1rem;">
  <summary><b>All possible auxiliaries</b> <span class="muted">(person × mood × voice × aspect × tense)</span></summary>
  <p>Forms labeled “3rd (casual)” omit <code>a-</code> and are limited to short, unambiguous casual speech.</p>
  <div style="margin-top: .75rem; display: grid; gap: .75rem;">
    <input id="allAuxFilter" type="search" placeholder="Filter (e.g. 'imperative', 'passive', 'habitual', 'future')" />
    <select id="allAuxSelect" size="12" style="width: 100%;"></select>
    <div id="allAuxPreview" class="muted"></div>
  </div>
</details>
