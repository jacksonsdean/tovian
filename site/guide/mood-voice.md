---
layout: guide_page.njk
permalink: /guide/mood-voice.html
title: Mood & Voice | Tovian Guide
---
# Mood & Voice

Mood prefixes attach to the auxiliary:

<table>
  <thead>
    <tr><th>Prefix</th><th>Mood</th></tr>
  </thead>
  <tbody>
    <tr><td>{% tovc "sub" %}</td><td>subjunctive</td></tr>
    <tr><td>{% tovc "imp" %}</td><td>imperative</td></tr>
    <tr><td>{% tovc "cond" %}</td><td>conditional</td></tr>
    <tr><td>{% tovc "counter" %}</td><td>counterfactual</td></tr>
    <tr><td>{% tovc "opt" %}</td><td>optative</td></tr>
    <tr><td>{% tovc "obl" %}</td><td>obligative</td></tr>
    <tr><td><code>ef-</code></td><td>necessative</td></tr>
    <tr><td>{% tovc "pot" %}</td><td>potential</td></tr>
  </tbody>
</table>

Voice prefixes:

<table>
  <thead>
    <tr><th>Prefix</th><th>Voice</th></tr>
  </thead>
  <tbody>
    <tr><td>{% tovc "refl" %}</td><td>reflexive</td></tr>
    <tr><td>{% tovc "pass" %}</td><td>passive</td></tr>
    <tr><td>{% tovc "mid" %}</td><td>middle</td></tr>
    <tr><td>{% tovc "caus" %}</td><td>causative</td></tr>
    <tr><td>{% tovc "rec" %}</td><td>reciprocal</td></tr>
    <tr><td><em>unmarked</em></td><td>active</td></tr>
  </tbody>
</table>

Note: person + mood + voice can combine on the auxiliary. Order is person prefix, then mood, then voice, followed by the aspect/tense-marked auxiliary root.

Example:

- {% tovc "aux_2_imp_sim_prs returning" %} — 2nd person imperative “Return!” (o- person, se- imperative, fa simple aspect)
