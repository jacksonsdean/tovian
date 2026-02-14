---
layout: guide_page.njk
permalink: /guide/verbs.html
title: Verbs & Aspects | Tovian Guide
---
# Verbs & Aspects

Tovian uses a conjugated auxiliary + a bare main verb. The main verb stays uninflected; all marking for person, tense, aspect, mood, and voice appears on the auxiliary.

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

Agreement (subject person on auxiliary)

<table>
  <thead>
    <tr><th>Person</th><th>Auxiliary prefix</th><th>Example</th></tr>
  </thead>
  <tbody>
    <tr><td>1st</td><td><code>i-</code></td><td>{% tovc "aux_1_sim_prs sight" %} “I/we see”</td></tr>
    <tr><td>2nd</td><td><code>o-</code></td><td>{% tovc "aux_2_sim_prs speech" %} “you speak”</td></tr>
    <tr><td>3rd</td><td><em>unmarked</em> (optionally <code>a-</code>)</td><td>{% tovc "aux_3_sim_prs sight" %} “he/she/they see”</td></tr>
  </tbody>
</table>

Plural is a noun suffix <code>-e</code>; verbs do not agree with number.

<details class="card" style="margin-top: 1rem;">
  <summary><b>All auxiliary forms</b> <span class="muted">(aspect × tense)</span></summary>
  <div id="auxiliariesAuto" class="muted" style="margin-top: .75rem;">Loading…</div>
</details>

<details class="card" style="margin-top: 1rem;">
  <summary><b>All possible auxiliaries</b> <span class="muted">(person × mood × voice × aspect × tense)</span></summary>
  <div style="margin-top: .75rem; display: grid; gap: .75rem;">
    <input id="allAuxFilter" type="search" placeholder="Filter (e.g. 'imperative', 'passive', 'habitual', 'future')" />
    <select id="allAuxSelect" size="12" style="width: 100%;"></select>
    <div id="allAuxPreview" class="muted"></div>
  </div>
</details>
